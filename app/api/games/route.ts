import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTeamLogo } from "@/lib/team-logo-utils"
import { getOpponentLogo } from "@/lib/opponent-logo-utils"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const competition = searchParams.get("competition")
    const teamId = searchParams.get("teamId")

    // Get user's team if teamId not provided
    const user = session.user as any
    const finalTeamId = teamId || user.teamId

    const whereClause: any = {}
    if (competition) {
      whereClause.competition = { contains: competition, mode: "insensitive" }
    }
    // Only filter by teamId if it exists and migration has run (backward compatibility)
    if (finalTeamId) {
      try {
        whereClause.teamId = finalTeamId
      } catch (error) {
        // Teams table might not exist yet - ignore team filtering
        console.warn("Team filtering not available:", error)
      }
    }

    const games = await prisma.games.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        game_stats: {
          include: {
            players_game_stats_playerIdToplayers: true,
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        opponentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
        competitionRelation: {
          select: {
            id: true,
            name: true,
            type: true,
            logo: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Fetch club logos for opponent logo matching
    const clubLogos = await prisma.clubLogo.findMany()
    const clubLogosArray = clubLogos.map(cl => ({
      clubName: cl.clubName,
      logo: cl.logo
    }))

    // Apply Djugarden logo to team data and club logos to opponents
    const gamesWithLogos = games.map(game => ({
      ...game,
      teams: game.teams ? {
        ...game.teams,
        logo: getTeamLogo(game.teams),
      } : game.teams,
      // Apply club logo to opponentClub if it doesn't have one
      opponentClub: game.opponentClub ? {
        ...game.opponentClub,
        logo: getOpponentLogo(game.opponentClub, clubLogosArray) || game.opponentClub.logo,
      } : game.opponentClub,
      // Add opponent logo for string-based opponents
      opponentLogo: game.opponent ? getOpponentLogo({ name: game.opponent }, clubLogosArray) : null,
    }))

    return NextResponse.json(gamesWithLogos)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json(
      { error: "Failed to fetch games" },
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
    const { date, opponent, opponentId, venue, field, competition, competitionId, score, duration, teamId, isHome, rating } = body

    // Validate required fields
    if (!date || !venue) {
      return NextResponse.json(
        { error: "Date and venue are required" },
        { status: 400 }
      )
    }

    // Either opponent (string) or opponentId must be provided
    if (!opponent && !opponentId) {
      return NextResponse.json(
        { error: "Either opponent (string) or opponentId is required" },
        { status: 400 }
      )
    }

    // Either competition (string) or competitionId must be provided
    if (!competition && !competitionId) {
      return NextResponse.json(
        { error: "Either competition (string) or competitionId is required" },
        { status: 400 }
      )
    }

    // Validate date format
    if (isNaN(new Date(date).getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 0 and 5" },
        { status: 400 }
      )
    }

    // Get user's team if teamId not provided
    const finalTeamId = teamId || (user as any).teamId

    // Try to get or create a default team if none exists
    let gameTeamId = finalTeamId
    if (!gameTeamId) {
      try {
        // Try to find any team or create a default one
        const defaultTeam = await (prisma as any).team?.findFirst()
        if (!defaultTeam) {
          // Create a default team
          const newTeam = await (prisma as any).team?.create({
            data: {
              name: "Djugarden F2011-A",
              code: "F2011-A",
            },
          })
          gameTeamId = newTeam?.id
        } else {
          gameTeamId = defaultTeam.id
        }
      } catch (error) {
        // Teams table might not exist yet - create game without teamId
        console.warn("Teams table not available (migration may not be run):", error)
        gameTeamId = null
      }
    }

    const gameData: any = {
      date: new Date(date),
      opponent: opponent || null, // Keep for backward compatibility
      opponentId: opponentId || null,
      venue,
      field: field || null,
      competition: competition || null, // Keep for backward compatibility
      competitionId: competitionId || null,
      score: score || null,
      duration: duration ? parseInt(duration) : null,
      isHome: isHome !== undefined ? isHome : null,
      rating: rating !== undefined ? Math.max(1, Math.min(5, rating)) : null,
    }

    // Only add teamId if it exists and migration has run
    if (gameTeamId) {
      gameData.teamId = gameTeamId
    }

    const game = await prisma.games.create({
      data: gameData,
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    )
  }
}
