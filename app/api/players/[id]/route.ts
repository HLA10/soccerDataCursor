import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canDelete, canEdit } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        gameStats: {
          include: {
            game: true,
            substitutedByPlayer: true,
          },
        },
        tournamentStats: {
          include: {
            tournament: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error fetching player:", error)
    return NextResponse.json(
      { error: "Failed to fetch player" },
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
    
    // Get player to check team ownership
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        primaryTeam: true,
      },
    })

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Check permissions
    if (!canEdit(user.role, user.teamId, existingPlayer.primaryTeamId)) {
      return NextResponse.json({ error: "Forbidden: You can only edit players from your own team" }, { status: 403 })
    }

    const body = await request.json()
    const { name, position, jerseyNumber, dateOfBirth, photo, isInjured, injuryDescription, isSick, illnessDescription } = body

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(position !== undefined && { position }),
        ...(jerseyNumber !== undefined && { jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(photo !== undefined && { photo: photo || null }),
        ...(isInjured !== undefined && { isInjured }),
        ...(injuryDescription !== undefined && { injuryDescription }),
        ...(isSick !== undefined && { isSick }),
        ...(illnessDescription !== undefined && { illnessDescription }),
      },
      include: {
        gameStats: {
          include: {
            game: true,
            substitutedByPlayer: true,
          },
        },
        tournamentStats: {
          include: {
            tournament: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json(
      { error: "Failed to update player" },
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

    await prisma.player.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Player deleted" })
  } catch (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    )
  }
}

