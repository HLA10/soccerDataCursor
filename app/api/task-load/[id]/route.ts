import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canDelete } from "@/lib/permissions"

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

    const response = await prisma.taskLoadResponse.findUnique({
      where: { id: params.id },
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

    if (!response) {
      return NextResponse.json(
        { error: "Task load response not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching task load response:", error)
    return NextResponse.json(
      { error: "Failed to fetch task load response" },
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
    if (user.role !== "ADMIN" && user.role !== "COACH" && user.role !== "SUPER_USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      mentalEffort,
      physicalEffort,
      timePressure,
      performance,
      effort,
      frustration,
      submittedAt,
    } = body

    // Validate ranges if provided
    const values = [mentalEffort, physicalEffort, timePressure, performance, effort, frustration]
      .filter(v => v !== undefined)
    
    if (values.some(v => typeof v !== 'number' || v < 1 || v > 100)) {
      return NextResponse.json(
        { error: "All values must be between 1 and 100" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (mentalEffort !== undefined) updateData.mentalEffort = mentalEffort
    if (physicalEffort !== undefined) updateData.physicalEffort = physicalEffort
    if (timePressure !== undefined) updateData.timePressure = timePressure
    if (performance !== undefined) updateData.performance = performance
    if (effort !== undefined) updateData.effort = effort
    if (frustration !== undefined) updateData.frustration = frustration
    if (submittedAt !== undefined) updateData.submittedAt = new Date(submittedAt)

    const response = await prisma.taskLoadResponse.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error updating task load response:", error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Task load response not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update task load response" },
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
    if (!canDelete({ user } as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.taskLoadResponse.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting task load response:", error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Task load response not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete task load response" },
      { status: 500 }
    )
  }
}



