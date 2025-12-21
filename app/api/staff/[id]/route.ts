import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canDelete } from "@/lib/permissions"

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Handle team updates if teamIds is provided
    const updateData: any = {
      ...(name !== undefined && { name }),
      ...(position !== undefined && { position }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(photo !== undefined && { photo: photo || null }),
    }

    // If teamIds is provided, update the teams relationship
    if (teamIds !== undefined) {
      const finalTeamIds = Array.isArray(teamIds) ? teamIds : teamIds ? [teamIds] : []
      
      // Delete existing team relationships and create new ones
      updateData.teams = {
        deleteMany: {},
        ...(finalTeamIds.length > 0 && {
          create: finalTeamIds.map((teamId: string) => ({
            teamId,
          })),
        }),
      }
    }

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: updateData,
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error updating staff:", error)
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canDelete(user.role)) {
      return NextResponse.json({ error: "Forbidden: Only SUPER_USER can delete data" }, { status: 403 })
    }

    await prisma.staff.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Staff deleted" })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    )
  }
}


