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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const user = session.user as any
    const finalTeamId = teamId || user.teamId

    const whereClause: any = {}
    
    if (finalTeamId) {
      whereClause.teamId = finalTeamId
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const trainings = await prisma.trainingSession.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        attendance: {
          include: {
            player: true,
          },
        },
        parts: {
          orderBy: {
            partNumber: "asc",
          },
        },
        team: true,
        template: {
          include: {
            parts: {
              orderBy: {
                partNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(trainings)
  } catch (error) {
    console.error("Error fetching trainings:", error)
    return NextResponse.json(
      { error: "Failed to fetch trainings" },
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
    console.log("=== TRAINING CREATION REQUEST ===")
    console.log("Full request body:", JSON.stringify(body, null, 2))
    console.log("User:", { id: user.id, role: user.role, teamId: user.teamId })

    const { date, startTime, endTime, duration, location, field, gathering, notes, teamId, attendance, parts, seriesId, templateId, sessionPlanPdf, recurring } = body

    // Validation
    if (!date) {
      console.error("Missing date")
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }
    if (!startTime) {
      console.error("Missing startTime")
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }

    const finalTeamId = teamId || user.teamId
    if (!finalTeamId) {
      console.error("Missing teamId")
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    // Verify team exists
    const team = await prisma.teams.findUnique({
      where: { id: finalTeamId },
    })
    if (!team) {
      console.error("Team not found:", finalTeamId)
      return NextResponse.json({ error: "Team not found" }, { status: 400 })
    }

    // Parse date
    let trainingDate: Date
    try {
      trainingDate = new Date(date)
      if (isNaN(trainingDate.getTime())) {
        console.error("Invalid date:", date)
        return NextResponse.json({ error: `Invalid date: ${date}` }, { status: 400 })
      }
      console.log("Parsed date:", trainingDate.toISOString())
    } catch (error: any) {
      console.error("Date parsing error:", error)
      return NextResponse.json({ error: `Date parsing failed: ${error.message}` }, { status: 400 })
    }

    // Handle recurring trainings
    if (recurring && recurring.count > 1) {
      const { type, count, dayOfWeek } = recurring
      const createdTrainings = []
      const recurringSeriesId = `series-${Date.now()}`

      // Find the first occurrence of the target day on or after the start date
      let firstDate = new Date(trainingDate)
      
      if (type === "weekly-day" && dayOfWeek !== null && dayOfWeek !== undefined) {
        const targetDay = dayOfWeek
        const currentDay = firstDate.getDay()
        const daysUntilTarget = (targetDay - currentDay + 7) % 7
        if (daysUntilTarget > 0) {
          firstDate.setDate(firstDate.getDate() + daysUntilTarget)
        }
      }

      for (let i = 0; i < count; i++) {
        const sessionDate = new Date(firstDate)
        
        if (type === "daily") {
          sessionDate.setDate(sessionDate.getDate() + i)
        } else if (type === "weekly" || type === "weekly-day") {
          sessionDate.setDate(sessionDate.getDate() + (i * 7))
        } else if (type === "monthly") {
          sessionDate.setMonth(sessionDate.getMonth() + i)
        }

        const sessionData: any = {
          date: sessionDate,
          startTime,
          teamId: finalTeamId,
          seriesId: recurringSeriesId,
        }
        if (endTime) sessionData.endTime = endTime
        if (duration) sessionData.duration = parseInt(String(duration)) || null
        if (location) sessionData.location = location
        if (field) sessionData.field = field
        if (gathering) sessionData.gathering = gathering
        if (notes) sessionData.notes = notes
        if (templateId) sessionData.templateId = templateId

        const created = await prisma.trainingSession.create({
          data: sessionData,
          include: { team: true },
        })
        createdTrainings.push(created)
      }

      return NextResponse.json({ 
        message: `Created ${createdTrainings.length} recurring training sessions`,
        trainings: createdTrainings,
        seriesId: recurringSeriesId
      }, { status: 201 })
    }

    // Build minimal data object - only required fields first
    const trainingData: any = {
      date: trainingDate,
      startTime: startTime,
      teamId: finalTeamId,
    }

    // Add optional fields
    if (endTime) trainingData.endTime = endTime
    if (duration) trainingData.duration = parseInt(String(duration)) || null
    if (location) trainingData.location = location
    if (field) trainingData.field = field
    if (gathering) trainingData.gathering = gathering
    if (notes) trainingData.notes = notes
    if (seriesId) trainingData.seriesId = seriesId
    if (templateId) trainingData.templateId = templateId
    if (sessionPlanPdf) trainingData.sessionPlanPdf = sessionPlanPdf

    console.log("Training data to create:", JSON.stringify(trainingData, null, 2))

    // Create training with minimal data first
    let training
    try {
      training = await prisma.trainingSession.create({
        data: trainingData,
        include: {
          team: true,
        },
      })
      console.log("Training created successfully:", training.id)
    } catch (createError: any) {
      console.error("Prisma create error:", createError)
      console.error("Error code:", createError?.code)
      console.error("Error meta:", createError?.meta)
      throw createError
    }

    // Handle attendance if provided
    if (attendance && Array.isArray(attendance) && attendance.length > 0) {
      try {
        await prisma.trainingAttendance.createMany({
          data: attendance.map((att: any) => ({
            trainingSessionId: training.id,
            playerId: att.playerId,
            attended: att.attended !== false,
            absenceReason: att.absenceReason || null,
            absenceComment: att.absenceComment || null,
          })),
          skipDuplicates: true,
        })
      } catch (attError) {
        console.error("Error creating attendance:", attError)
        // Don't fail the whole request if attendance fails
      }
    }

    // Handle parts if provided
    if (parts && Array.isArray(parts) && parts.length > 0) {
      try {
        await prisma.trainingSessionPart.createMany({
          data: parts.map((part: any) => ({
            trainingSessionId: training.id,
            partNumber: part.partNumber,
            partType: part.partType || null,
            withBall: part.withBall !== undefined ? part.withBall : null,
            duration: part.duration || null,
            classificationLevel: part.classificationLevel || null,
            classificationStyle: part.classificationStyle || null,
          })),
          skipDuplicates: true,
        })
      } catch (partsError) {
        console.error("Error creating parts:", partsError)
        // Don't fail the whole request if parts fail
      }
    }

    // Fetch complete training with relations
    const completeTraining = await prisma.trainingSession.findUnique({
      where: { id: training.id },
      include: {
        attendance: {
          include: { player: true },
        },
        parts: {
          orderBy: { partNumber: "asc" },
        },
        team: true,
        template: {
          include: {
            parts: {
              orderBy: { partNumber: "asc" },
            },
          },
        },
      },
    })

    return NextResponse.json(completeTraining, { status: 201 })
  } catch (error: any) {
    console.error("=== TRAINING CREATION ERROR ===")
    console.error("Error:", error)
    console.error("Error message:", error?.message)
    console.error("Error code:", error?.code)
    console.error("Error meta:", error?.meta)
    console.error("Error stack:", error?.stack)
    
    let errorMessage = "Failed to create training"
    if (error?.code === "P2002") {
      errorMessage = "A training session with this information already exists"
    } else if (error?.code === "P2003") {
      errorMessage = `Invalid foreign key: ${error?.meta?.target?.join(", ") || "unknown"}`
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        code: error?.code || "UNKNOWN_ERROR",
        details: error?.meta || null
      },
      { status: 500 }
    )
  }
}

