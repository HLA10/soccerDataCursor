import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateRequestBody, createPlayerSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const teamId = searchParams.get("teamId")
    const includeBorrowed = searchParams.get("includeBorrowed") === "true"

    // Build where clause
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by team if teamId is provided (only if migration has run)
    if (teamId) {
      try {
        // When filtering by team, only show players under contract
        whereClause.isUnderContract = true
        
        if (includeBorrowed) {
          // Include players from this team (primary or borrowed)
          whereClause.OR = [
            ...(whereClause.OR || []),
            { primaryTeamId: teamId },
            { teams: { some: { teamId } } },
          ]
        } else {
          // Only primary team players
          whereClause.primaryTeamId = teamId
        }
      } catch (error) {
        // Teams table might not exist yet - ignore team filtering
        console.warn("Team filtering not available:", error)
      }
    }
    // If no teamId provided, return all players (including out of contract for admin purposes)

    const players = await prisma.player.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        primaryTeam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        gameStats: {
          include: {
            game: true,
          },
        },
        tournamentStats: {
          include: {
            tournament: true,
          },
        },
        injuries: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
        illnesses: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { error: "Failed to fetch players" },
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
    
    // Validate request body
    const validation = await validateRequestBody(createPlayerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, position, jerseyNumber, dateOfBirth, photo, teamId } = body

    // Get user's team if teamId not provided
    let finalTeamId = teamId || user.teamId

    // Try to get or create a default team if none exists
    // Note: This requires the migration to be run first
    if (!finalTeamId) {
      try {
        const defaultTeam = await (prisma as any).team?.findFirst()
        if (!defaultTeam) {
          // Create a default team
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
        // Teams table might not exist yet - create player without team
        console.warn("Teams table not available (migration may not be run):", error)
        finalTeamId = null
      }
    }

    const playerData: any = {
      name,
      position,
      jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      photo: photo || null,
      isUnderContract: true, // All new players are under contract by default
    }

    // Only add primaryTeamId if it exists and migration has run
    if (finalTeamId) {
      playerData.primaryTeamId = finalTeamId
    }

    const player = await prisma.player.create({
      data: playerData,
    })

    // Also add to TeamPlayer for consistency (if TeamPlayer table exists)
    if (finalTeamId) {
      try {
        await (prisma as any).teamPlayer?.create({
          data: {
            playerId: player.id,
            teamId: finalTeamId,
            isBorrowed: false,
          },
        })
      } catch (error) {
        // TeamPlayer table might not exist yet if migration hasn't run
        console.warn("Could not create TeamPlayer entry:", error)
      }
    }

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    )
  }
}
