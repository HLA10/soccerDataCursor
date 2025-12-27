import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMatchReport } from "@/lib/ai-report-generator"
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

    // TODO: Add generatedMatchReport model to schema if report storage is needed
    // For now, reports are generated on-demand and not stored
    return NextResponse.json(null)
  } catch (error) {
    console.error("Error fetching generated report:", error)
    return NextResponse.json(
      { error: "Failed to fetch generated report" },
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
    // Allow ADMIN, COACH, and SUPER_USER to generate reports
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    // Fetch game data
    const game = await prisma.games.findUnique({
      where: { id: params.id },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
        opponentClub: {
          select: {
            id: true,
            name: true,
          },
        },
        game_stats: {
          include: {
            players_game_stats_playerIdToplayers: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if match report exists (TODO: Add reports relation if needed)
    const matchReport = null

    // Validate that we have player stats
    if (!game.game_stats || game.game_stats.length === 0) {
      return NextResponse.json(
        { error: "Cannot generate report: No player statistics found for this game. Please add player statistics first." },
        { status: 400 }
      )
    }

    // Prepare player stats
    const playerStats = game.game_stats.map((stat) => ({
      playerId: stat.players_game_stats_playerIdToplayers.id,
      playerName: stat.players_game_stats_playerIdToplayers.name,
      position: stat.position || stat.players_game_stats_playerIdToplayers.position || "Unknown",
      minutes: stat.minutes,
      goals: stat.goals,
      assists: stat.assists,
      started: stat.started,
    }))

    // Generate report using AI
    let generatedReport
    try {
      generatedReport = await generateMatchReport(
        {
          id: game.id,
          date: game.date,
          opponent: game.opponent,
          opponentClub: game.opponentClub,
          score: game.score,
          venue: game.venue,
          competition: game.competition,
          isHome: game.isHome,
          teams: game.teams,
        },
        matchReport,
        playerStats
      )
    } catch (aiError: any) {
      console.error("AI generation error details:", {
        message: aiError.message,
        stack: aiError.stack,
      })
      // Re-throw with more context
      throw new Error(aiError.message || "Failed to generate report with AI")
    }

    // TODO: Add generatedMatchReport model to schema if report storage is needed
    // For now, we just return the generated report without storing it
    return NextResponse.json(
      {
        gameId: params.id,
        teamReport: generatedReport.teamReport,
        playerSummaries: generatedReport.playerSummaries,
        generatedAt: new Date(),
        generatedById: user.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error generating match report:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate match report"
    if (error.message?.includes("OPENAI_API_KEY")) {
      errorMessage = "OpenAI API key is not configured. Please contact your administrator."
    } else if (error.message?.includes("OpenAI API error")) {
      errorMessage = `OpenAI API error: ${error.message.replace("OpenAI API error: ", "")}`
    } else if (error.message?.includes("No content")) {
      errorMessage = "OpenAI did not return any content. Please try again."
    } else if (error.message?.includes("Invalid report structure")) {
      errorMessage = "The AI returned an invalid report format. Please try again."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
