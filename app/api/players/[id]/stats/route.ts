import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameStats = await prisma.gameStat.findMany({
      where: { playerId: params.id },
      include: {
        game: true,
      },
      orderBy: {
        game: {
          date: "desc",
        },
      },
    })

    const tournamentStats = await prisma.tournamentStat.findMany({
      where: { playerId: params.id },
      include: {
        tournament: true,
      },
    })

    // Calculate totals
    const totalMinutes = gameStats.reduce((sum, stat) => sum + stat.minutes, 0)
    const totalGoals = gameStats.reduce((sum, stat) => sum + stat.goals, 0)
    const totalAssists = gameStats.reduce((sum, stat) => sum + stat.assists, 0)
    const totalGames = gameStats.length
    const avgRating =
      gameStats.filter((s) => s.rating).length > 0
        ? gameStats
            .filter((s) => s.rating)
            .reduce((sum, stat) => sum + (stat.rating || 0), 0) /
          gameStats.filter((s) => s.rating).length
        : null

    return NextResponse.json({
      gameStats,
      tournamentStats,
      totals: {
        minutes: totalMinutes,
        goals: totalGoals,
        assists: totalAssists,
        games: totalGames,
        avgRating,
      },
    })
  } catch (error) {
    console.error("Error fetching player stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    )
  }
}

