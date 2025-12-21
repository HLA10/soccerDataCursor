import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEdit, canDelete } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scoutedPlayer = await prisma.scoutedPlayer.findUnique({
      where: { id: params.id },
      include: {
        opponent: true,
        game: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
        scoutedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!scoutedPlayer) {
      return NextResponse.json(
        { error: "Scouted player not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(scoutedPlayer)
  } catch (error) {
    console.error("Error fetching scouted player:", error)
    return NextResponse.json(
      { error: "Failed to fetch scouted player" },
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
      date,
      position,
      starRating,
      preferredFoot,
      comments,
      gameId,
      opponentId,
    } = body

    if (!name || !date || !position || !starRating || !preferredFoot || !opponentId) {
      return NextResponse.json(
        { error: "Name, date, position, starRating, preferredFoot, and opponentId are required" },
        { status: 400 }
      )
    }

    if (starRating < 1 || starRating > 5) {
      return NextResponse.json(
        { error: "Star rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const scoutedPlayer = await prisma.scoutedPlayer.update({
      where: { id: params.id },
      data: {
        name,
        date: new Date(date),
        position,
        starRating: parseInt(starRating),
        preferredFoot,
        comments: comments || null,
        gameId: gameId || null,
        opponentId,
      },
      include: {
        opponent: true,
        game: true,
        scoutedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(scoutedPlayer)
  } catch (error) {
    console.error("Error updating scouted player:", error)
    return NextResponse.json(
      { error: "Failed to update scouted player" },
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

    await prisma.scoutedPlayer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Scouted player deleted successfully" })
  } catch (error) {
    console.error("Error deleting scouted player:", error)
    return NextResponse.json(
      { error: "Failed to delete scouted player" },
      { status: 500 }
    )
  }
}



