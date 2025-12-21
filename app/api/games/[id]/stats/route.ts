import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const stats = await prisma.gameStat.findMany({
      where: { gameId: params.id },
      include: {
        player: true,
        substitutedByPlayer: true,
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching game stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch game stats" },
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== "ADMIN" && user.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      playerId,
      minutes,
      goals,
      assists,
      yellowCards,
      redCards,
      rating,
      started,
      position,
      substitutionMinute,
      substitutionInMinute,
      substitutedBy,
      substitutions,
      goalMinutes,
      assistMinutes,
    } = body

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      )
    }

    const stat = await prisma.gameStat.upsert({
      where: {
        playerId_gameId: {
          playerId,
          gameId: params.id,
        },
      },
      update: {
        minutes: minutes ? parseInt(minutes) : 0,
        goals: goals ? parseInt(goals) : 0,
        assists: assists ? parseInt(assists) : 0,
        yellowCards: yellowCards ? parseInt(yellowCards) : 0,
        redCards: redCards ? parseInt(redCards) : 0,
        rating: rating ? Math.max(1, Math.min(5, parseFloat(rating))) : null,
        started: started || false,
        position: position || null,
        substitutionMinute: substitutionMinute ? parseInt(substitutionMinute) : null,
        substitutionInMinute: substitutionInMinute ? parseInt(substitutionInMinute) : null,
        substitutedBy: substitutedBy || null,
        substitutions: substitutions || null,
        goalMinutes: goalMinutes || null,
        assistMinutes: assistMinutes || null,
      },
      create: {
        playerId,
        gameId: params.id,
        minutes: minutes ? parseInt(minutes) : 0,
        goals: goals ? parseInt(goals) : 0,
        assists: assists ? parseInt(assists) : 0,
        yellowCards: yellowCards ? parseInt(yellowCards) : 0,
        redCards: redCards ? parseInt(redCards) : 0,
        rating: rating ? Math.max(1, Math.min(5, parseFloat(rating))) : null,
        started: started || false,
        position: position || null,
        substitutionMinute: substitutionMinute ? parseInt(substitutionMinute) : null,
        substitutionInMinute: substitutionInMinute ? parseInt(substitutionInMinute) : null,
        substitutedBy: substitutedBy || null,
        substitutions: substitutions || null,
        goalMinutes: goalMinutes || null,
        assistMinutes: assistMinutes || null,
      },
      include: {
        player: true,
        substitutedByPlayer: true,
      },
    })

    return NextResponse.json(stat, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating game stat:", error)
    return NextResponse.json(
      { error: "Failed to create/update game stat" },
      { status: 500 }
    )
  }
}

