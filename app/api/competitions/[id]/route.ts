import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEdit, canDelete } from "@/lib/permissions"

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

    const competition = await prisma.competition.findUnique({
      where: { id: params.id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        games: {
          take: 20,
          orderBy: { date: "desc" },
          select: {
            id: true,
            date: true,
            venue: true,
            score: true,
            opponent: true,
            opponentClub: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            games: true,
            teams: true,
          },
        },
      },
    })

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(competition)
  } catch (error) {
    console.error("Error fetching competition:", error)
    return NextResponse.json(
      { error: "Failed to fetch competition" },
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
    if (!canEdit(user.role, null, null)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      type,
      customType,
      season,
      startDate,
      endDate,
      description,
      logo,
      location,
      teamId,
      teamIds,
    } = body

    if (!name || !type || !season) {
      return NextResponse.json(
        { error: "Name, type, and season are required" },
        { status: 400 }
      )
    }

    // Update teams if provided
    if (teamIds !== undefined) {
      // Delete existing team associations
      await prisma.competitionTeam.deleteMany({
        where: { competitionId: params.id },
      })

      // Create new associations
      if (teamIds.length > 0) {
        await prisma.competitionTeam.createMany({
          data: teamIds.map((tid: string) => ({
            competitionId: params.id,
            teamId: tid,
          })),
        })
      }
    }

    const competition = await prisma.competition.update({
      where: { id: params.id },
      data: {
        name,
        type,
        customType: type === "CUSTOM" ? customType : null,
        season,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        logo: logo || null,
        location: location || null,
        teamId: teamId || null,
      },
      include: {
        team: true,
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    return NextResponse.json(competition)
  } catch (error) {
    console.error("Error updating competition:", error)
    return NextResponse.json(
      { error: "Failed to update competition" },
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.competition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Competition deleted successfully" })
  } catch (error) {
    console.error("Error deleting competition:", error)
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    )
  }
}



