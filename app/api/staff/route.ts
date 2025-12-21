import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const teamId = searchParams.get("teamId")

    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ]
    }

    try {
      const staff = await prisma.staff.findMany({
        where: search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { position: { contains: search, mode: "insensitive" } },
          ],
          ...(teamId ? {
            teams: {
              some: {
                teamId: teamId,
              },
            },
          } : {}),
        } : (teamId ? {
          teams: {
            some: {
              teamId: teamId,
            },
          },
        } : undefined),
        orderBy: {
          name: "asc",
        },
        include: {
          teams: {
            include: {
              team: true,
            },
          },
        },
      })

      return NextResponse.json(staff)
    } catch (error: any) {
      // Check if the error is because the table doesn't exist
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: "Staff table does not exist. Please run the database migration: npx prisma migrate dev --name add_staff" },
          { status: 500 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== "ADMIN" && user.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, position, email, phone, photo, teamIds } = body

    if (!name || !position) {
      return NextResponse.json(
        { error: "Name and position are required" },
        { status: 400 }
      )
    }

    // Handle teamIds - optional, can be array or single value
    let finalTeamIds: string[] = []
    
    if (teamIds) {
      // Support both array and single value
      finalTeamIds = Array.isArray(teamIds) ? teamIds : [teamIds]
    }

    try {
      const staff = await prisma.staff.create({
        data: {
          name,
          position,
          email: email || null,
          phone: phone || null,
          photo: photo || null,
          ...(finalTeamIds.length > 0 && {
            teams: {
              create: finalTeamIds.map((teamId) => ({
                teamId,
              })),
            },
          }),
        },
        include: {
          teams: {
            include: {
              team: true,
            },
          },
        },
      })

      return NextResponse.json(staff, { status: 201 })
    } catch (error: any) {
      console.error("Detailed error creating staff:", error)
      
      // Check if the error is because the table doesn't exist
      if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('Unknown model')) {
        return NextResponse.json(
          { error: "Staff table does not exist. Please run: npx prisma db push && npx prisma generate" },
          { status: 500 }
        )
      }
      
      // Check for foreign key constraint errors
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: `Invalid team ID. Please select a valid team. Error: ${error.meta?.field_name || 'teamId'}` },
          { status: 400 }
        )
      }
      
      // Return more detailed error
      return NextResponse.json(
        { error: `Failed to create staff: ${error.message || 'Unknown error'}. Code: ${error.code || 'N/A'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error creating staff:", error)
    return NextResponse.json(
      { error: `Failed to create staff: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

