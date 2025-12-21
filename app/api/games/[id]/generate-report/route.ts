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

    let generatedReport
    try {
      generatedReport = await prisma.generatedMatchReport.findUnique({
        where: { gameId: params.id },
        include: {
          generatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    } catch (dbError: any) {
      // If table doesn't exist, return helpful error
      if (dbError.code === "P2021" || dbError.message?.includes("does not exist") || dbError.message?.includes("Unknown model")) {
        console.error("Database table error:", dbError)
        return NextResponse.json(
          { error: "Database table not found. Please run: npx prisma migrate dev" },
          { status: 500 }
        )
      }
      throw dbError
    }

    if (!generatedReport) {
      return NextResponse.json(null)
    }

    // Parse JSON strings
    let teamReport, playerSummaries
    try {
      teamReport = JSON.parse(generatedReport.teamReport)
      playerSummaries = JSON.parse(generatedReport.playerSummaries)
    } catch (parseError) {
      console.error("Error parsing generated report JSON:", parseError)
      return NextResponse.json(
        { error: "Failed to parse stored report data" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...generatedReport,
      teamReport,
      playerSummaries,
    })
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
    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        team: {
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
        stats: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        },
        reports: {
          select: {
            postMatchNotes: true,
            tacticalObservations: true,
            overallRating: true,
            areasForImprovement: true,
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if match report exists
    const matchReport = game.reports && game.reports.length > 0 ? game.reports[0] : null

    // Validate that we have player stats
    if (!game.stats || game.stats.length === 0) {
      return NextResponse.json(
        { error: "Cannot generate report: No player statistics found for this game. Please add player statistics first." },
        { status: 400 }
      )
    }

    // Prepare player stats
    const playerStats = game.stats.map((stat) => ({
      playerId: stat.player.id,
      playerName: stat.player.name,
      position: stat.position || stat.player.position || "Unknown",
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
          duration: game.duration,
          isHome: game.isHome,
          team: game.team,
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

    // Check if report already exists
    let existing
    try {
      existing = await prisma.generatedMatchReport.findUnique({
        where: { gameId: params.id },
      })
    } catch (dbError: any) {
      // If table doesn't exist, provide helpful error
      if (dbError.code === "P2021" || dbError.message?.includes("does not exist") || dbError.message?.includes("Unknown model")) {
        return NextResponse.json(
          { error: "Database table not found. Please run: npx prisma migrate dev" },
          { status: 500 }
        )
      }
      throw dbError
    }

    if (existing) {
      // Update existing report
      const updated = await prisma.generatedMatchReport.update({
        where: { id: existing.id },
        data: {
          teamReport: JSON.stringify(generatedReport.teamReport),
          playerSummaries: JSON.stringify(generatedReport.playerSummaries),
          generatedById: user.id,
          generatedAt: new Date(),
        },
        include: {
          generatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({
        ...updated,
        teamReport: generatedReport.teamReport,
        playerSummaries: generatedReport.playerSummaries,
      })
    } else {
      // Create new report
      const created = await prisma.generatedMatchReport.create({
        data: {
          gameId: params.id,
          teamReport: JSON.stringify(generatedReport.teamReport),
          playerSummaries: JSON.stringify(generatedReport.playerSummaries),
          generatedById: user.id,
        },
        include: {
          generatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json(
        {
          ...created,
          teamReport: generatedReport.teamReport,
          playerSummaries: generatedReport.playerSummaries,
        },
        { status: 201 }
      )
    }
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
