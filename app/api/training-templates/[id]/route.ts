import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate, canDelete } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const template = await prisma.trainingSessionTemplate.findUnique({
      where: { id: params.id },
      include: {
        parts: {
          orderBy: {
            partNumber: "asc",
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { error: "Failed to fetch template" },
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
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, parts } = body

    // Update template
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description || null

    // Update parts if provided
    if (parts !== undefined) {
      // Delete existing parts
      await prisma.trainingSessionTemplatePart.deleteMany({
        where: { templateId: params.id },
      })

      // Create new parts
      if (parts.length > 0) {
        await prisma.trainingSessionTemplatePart.createMany({
          data: parts.map((part: any) => ({
            templateId: params.id,
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

    const template = await prisma.trainingSessionTemplate.update({
      where: { id: params.id },
      data: updateData,
      include: {
        parts: {
          orderBy: {
            partNumber: "asc",
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
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
    if (!canDelete(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if template is used by any sessions
    const sessionsUsingTemplate = await prisma.trainingSession.count({
      where: { templateId: params.id },
    })

    if (sessionsUsingTemplate > 0) {
      return NextResponse.json(
        { error: "Cannot delete template that is used by training sessions" },
        { status: 400 }
      )
    }

    await prisma.trainingSessionTemplate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }
}

