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
    const playerId = searchParams.get("playerId")
    const trainingSessionId = searchParams.get("trainingSessionId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")

    const user = session.user as any

    const whereClause: any = {}

    if (playerId) {
      whereClause.playerId = playerId
    } else if (user.role === "PLAYER") {
      // Players can only see their own responses
      if (!user.playerId) {
        return NextResponse.json(
          { error: "Player account not properly linked" },
          { status: 403 }
        )
      }
      whereClause.playerId = user.playerId
    } else if (user.role !== "SUPER_USER" && user.role !== "ADMIN") {
      // Non-admin users can only see their own team's players
      // This would need team context - for now, require playerId
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 }
      )
    }

    if (trainingSessionId) {
      whereClause.trainingSessionId = trainingSessionId
    }

    if (startDate && endDate) {
      whereClause.submittedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      whereClause.submittedAt = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.submittedAt = {
        lte: new Date(endDate),
      }
    }

    const responses = await prisma.taskLoadResponse.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        player: {
          select: {
            id: true,
            name: true,
          },
        },
        trainingSession: {
          select: {
            id: true,
            date: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Error fetching task load responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch task load responses" },
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
    // Allow PLAYER role to create their own responses
    if (user.role !== "ADMIN" && user.role !== "COACH" && user.role !== "SUPER_USER" && user.role !== "PLAYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    // If PLAYER role, ensure they can only create responses for themselves
    if (user.role === "PLAYER") {
      if (!user.playerId) {
        return NextResponse.json({ error: "Player account not properly linked" }, { status: 403 })
      }
      // Force playerId to match the logged-in player
      body.playerId = user.playerId
    }
    const {
      playerId,
      trainingSessionId,
      mentalEffort,
      physicalEffort,
      timePressure,
      performance,
      effort,
      frustration,
      submittedAt,
    } = body

    // Validate required fields
    if (!playerId || mentalEffort === undefined || physicalEffort === undefined ||
        timePressure === undefined || performance === undefined ||
        effort === undefined || frustration === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate ranges (1-100)
    const values = [mentalEffort, physicalEffort, timePressure, performance, effort, frustration]
    if (values.some(v => typeof v !== 'number' || v < 1 || v > 100)) {
      return NextResponse.json(
        { error: "All values must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      )
    }

    // Check if training session exists (if provided)
    if (trainingSessionId) {
      const training = await prisma.trainingSession.findUnique({
        where: { id: trainingSessionId },
      })

      if (!training) {
        return NextResponse.json(
          { error: "Training session not found" },
          { status: 404 }
        )
      }
    }

    // Check if response already exists
    const existing = await prisma.taskLoadResponse.findFirst({
      where: {
        playerId,
        trainingSessionId: trainingSessionId || null,
      },
    })

    const response = existing
      ? await prisma.taskLoadResponse.update({
          where: { id: existing.id },
          data: {
            mentalEffort,
            physicalEffort,
            timePressure,
            performance,
            effort,
            frustration,
            submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
          },
          include: {
            player: {
              select: {
                id: true,
                name: true,
              },
            },
            trainingSession: {
              select: {
                id: true,
                date: true,
                startTime: true,
              },
            },
          },
        })
      : await prisma.taskLoadResponse.create({
          data: {
            playerId,
            trainingSessionId: trainingSessionId || null,
            mentalEffort,
            physicalEffort,
            timePressure,
            performance,
            effort,
            frustration,
            submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
          },
          include: {
            player: {
              select: {
                id: true,
                name: true,
              },
            },
            trainingSession: {
              select: {
                id: true,
                date: true,
                startTime: true,
              },
            },
          },
        })

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error("Error creating task load response:", error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A response already exists for this player and training session" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create task load response" },
      { status: 500 }
    )
  }
}

