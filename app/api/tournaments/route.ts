import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get("teamId")

    const user = session.user as any
    const finalTeamId = teamId || user.teamId

    const whereClause: any = {}
    if (finalTeamId) {
      whereClause.teamId = finalTeamId
    }

    const tournaments = await prisma.tournament.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        stats: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
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
    const { name, season, startDate, endDate, type, teamId } = body

    if (!name || !season || !startDate || !type) {
      return NextResponse.json(
        { error: "Name, season, startDate, and type are required" },
        { status: 400 }
      )
    }

    // Get user's team if teamId not provided
    let finalTeamId = teamId || user.teamId

    // Try to get or create a default team if none exists
    if (!finalTeamId) {
      try {
        const defaultTeam = await (prisma as any).team?.findFirst()
        if (!defaultTeam) {
          const newTeam = await (prisma as any).team?.create({
            data: {
              name: "Djugarden F2011-A",
              code: "F2011-A",
            },
          })
          finalTeamId = newTeam?.id
        } else {
          finalTeamId = defaultTeam.id
        }
      } catch (error) {
        console.warn("Teams table not available:", error)
        return NextResponse.json(
          { error: "Team is required. Please select a team." },
          { status: 400 }
        )
      }
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        season,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type,
        teamId: finalTeamId,
      },
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error("Error creating tournament:", error)
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    )
  }
}

