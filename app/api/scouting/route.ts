import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const opponentId = searchParams.get("opponentId")
    const position = searchParams.get("position")
    const minRating = searchParams.get("minRating")
    const maxRating = searchParams.get("maxRating")

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (opponentId) {
      where.opponentId = opponentId
    }

    if (position) {
      where.position = {
        contains: position,
        mode: "insensitive",
      }
    }

    if (minRating || maxRating) {
      where.starRating = {}
      if (minRating) {
        where.starRating.gte = parseInt(minRating)
      }
      if (maxRating) {
        where.starRating.lte = parseInt(maxRating)
      }
    }

    const scoutedPlayers = await prisma.scoutedPlayer.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        opponent: {
          select: {
            id: true,
            name: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
        game: {
          select: {
            id: true,
            date: true,
            opponent: true,
            venue: true,
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

    return NextResponse.json(scoutedPlayers)
  } catch (error) {
    console.error("Error fetching scouted players:", error)
    return NextResponse.json(
      { error: "Failed to fetch scouted players" },
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
    if (!canCreate(user.role)) {
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

    const scoutedPlayer = await prisma.scoutedPlayer.create({
      data: {
        name,
        date: new Date(date),
        position,
        starRating: parseInt(starRating),
        preferredFoot,
        comments: comments || null,
        gameId: gameId || null,
        opponentId,
        scoutedById: user.id,
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

    return NextResponse.json(scoutedPlayer, { status: 201 })
  } catch (error) {
    console.error("Error creating scouted player:", error)
    return NextResponse.json(
      { error: "Failed to create scouted player" },
      { status: 500 }
    )
  }
}



