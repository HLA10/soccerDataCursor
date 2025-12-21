import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const squad = await prisma.matchSquad.findMany({
      where: { gameId: params.id },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            jerseyNumber: true,
            photo: true,
          },
        },
      },
      orderBy: [
        { isStartingXI: "desc" },
        { isSubstitute: "desc" },
        { jerseyNumber: "asc" },
      ],
    })

    return NextResponse.json(squad)
  } catch (error) {
    console.error("Error fetching squad:", error)
    return NextResponse.json(
      { error: "Failed to fetch squad" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { playerId, isStartingXI, isSubstitute, position, jerseyNumber } = body

    // Check if squad entry already exists
    const existing = await prisma.matchSquad.findUnique({
      where: {
        gameId_playerId: {
          gameId: params.id,
          playerId,
        },
      },
    })

    if (existing) {
      // Update existing entry
      const updated = await prisma.matchSquad.update({
        where: { id: existing.id },
        data: {
          isStartingXI,
          isSubstitute,
          position,
          jerseyNumber,
        },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              position: true,
              jerseyNumber: true,
              photo: true,
            },
          },
        },
      })
      return NextResponse.json(updated)
    } else {
      // Create new entry
      const created = await prisma.matchSquad.create({
        data: {
          gameId: params.id,
          playerId,
          isStartingXI,
          isSubstitute,
          position,
          jerseyNumber,
        },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              position: true,
              jerseyNumber: true,
              photo: true,
            },
          },
        },
      })
      return NextResponse.json(created, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating/updating squad:", error)
    return NextResponse.json(
      { error: "Failed to create/update squad" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { squad } = body // Array of squad entries

    // Delete all existing squad entries for this game
    await prisma.matchSquad.deleteMany({
      where: { gameId: params.id },
    })

    // Create new squad entries
    if (squad && squad.length > 0) {
      const created = await prisma.matchSquad.createMany({
        data: squad.map((entry: any) => ({
          gameId: params.id,
          playerId: entry.playerId,
          isStartingXI: entry.isStartingXI || false,
          isSubstitute: entry.isSubstitute || false,
          position: entry.position,
          jerseyNumber: entry.jerseyNumber,
        })),
      })

      // Fetch the created entries with player data
      const squadWithPlayers = await prisma.matchSquad.findMany({
        where: { gameId: params.id },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              position: true,
              jerseyNumber: true,
              photo: true,
            },
          },
        },
        orderBy: [
          { isStartingXI: "desc" },
          { isSubstitute: "desc" },
          { jerseyNumber: "asc" },
        ],
      })

      return NextResponse.json(squadWithPlayers)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Error updating squad:", error)
    return NextResponse.json(
      { error: "Failed to update squad" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get("playerId")

    if (playerId) {
      // Delete specific player from squad
      await prisma.matchSquad.deleteMany({
        where: {
          gameId: params.id,
          playerId,
        },
      })
    } else {
      // Delete entire squad
      await prisma.matchSquad.deleteMany({
        where: { gameId: params.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting squad:", error)
    return NextResponse.json(
      { error: "Failed to delete squad" },
      { status: 500 }
    )
  }
}

