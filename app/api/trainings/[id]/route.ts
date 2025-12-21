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

    const training = await prisma.trainingSession.findUnique({
      where: { id: params.id },
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
    })

    if (!training) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 })
    }

    return NextResponse.json(training)
  } catch (error) {
    console.error("Error fetching training:", error)
    return NextResponse.json(
      { error: "Failed to fetch training" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { date, startTime, endTime, duration, location, field, gathering, notes, attendance, parts, templateId, sessionPlanPdf } = body

    // Update training session
    const updateData: any = {}
    if (date !== undefined) updateData.date = new Date(date)
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime || null
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null
    if (location !== undefined) updateData.location = location || null
    if (field !== undefined) updateData.field = field || null
    if (gathering !== undefined) updateData.gathering = gathering || null
    if (notes !== undefined) updateData.notes = notes || null
    if (templateId !== undefined) updateData.templateId = templateId || null
    if (sessionPlanPdf !== undefined) updateData.sessionPlanPdf = sessionPlanPdf || null

    // Update attendance if provided
    if (attendance !== undefined) {
      // Delete existing attendance
      await prisma.trainingAttendance.deleteMany({
        where: { trainingSessionId: params.id },
      })

      // Create new attendance records
      if (attendance.length > 0) {
        await prisma.trainingAttendance.createMany({
          data: attendance.map((att: any) => ({
            trainingSessionId: params.id,
            playerId: att.playerId,
            attended: att.attended !== false,
            absenceReason: att.absenceReason || null,
            absenceComment: att.absenceComment || null,
          })),
        })
      }
    }

    // Update parts if provided
    if (parts !== undefined) {
      // Delete existing parts
      await prisma.trainingSessionPart.deleteMany({
        where: { trainingSessionId: params.id },
      })

      // Create new parts
      if (parts.length > 0) {
        await prisma.trainingSessionPart.createMany({
          data: parts.map((part: any) => ({
            trainingSessionId: params.id,
            partNumber: part.partNumber,
            partType: part.partType || null,
            withBall: part.withBall !== undefined ? part.withBall : null,
            duration: part.duration || null,
            classificationLevel: part.classificationLevel || null,
            classificationStyle: part.classificationStyle || null,
          })),
        })
      }
    }

    const training = await prisma.trainingSession.update({
      where: { id: params.id },
      data: updateData,
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
    })

    return NextResponse.json(training)
  } catch (error) {
    console.error("Error updating training:", error)
    return NextResponse.json(
      { error: "Failed to update training" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.trainingSession.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Training deleted" })
  } catch (error) {
    console.error("Error deleting training:", error)
    return NextResponse.json(
      { error: "Failed to delete training" },
      { status: 500 }
    )
  }
}

