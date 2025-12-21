import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate } from "@/lib/permissions"
import { saveUploadedFile, deleteUploadedFile } from "@/lib/file-upload"

export async function POST(
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

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Get existing training to check for old PDF
    const existingTraining = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      select: { sessionPlanPdf: true },
    })

    // Delete old PDF if it exists
    if (existingTraining?.sessionPlanPdf) {
      await deleteUploadedFile(existingTraining.sessionPlanPdf)
    }

    // Save new file
    const uploadResult = await saveUploadedFile(file, params.id)

    if (!uploadResult.success || !uploadResult.filePath) {
      return NextResponse.json(
        { error: uploadResult.error || "Failed to upload file" },
        { status: 500 }
      )
    }

    // Update training session with new PDF path
    const training = await prisma.trainingSession.update({
      where: { id: params.id },
      data: {
        sessionPlanPdf: uploadResult.filePath,
      },
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

    return NextResponse.json({
      success: true,
      filePath: uploadResult.filePath,
      training,
    })
  } catch (error) {
    console.error("Error uploading session plan:", error)
    return NextResponse.json(
      { error: "Failed to upload session plan" },
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
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get training to find PDF path
    const training = await prisma.trainingSession.findUnique({
      where: { id: params.id },
      select: { sessionPlanPdf: true },
    })

    if (training?.sessionPlanPdf) {
      // Delete file from filesystem
      await deleteUploadedFile(training.sessionPlanPdf)
    }

    // Update training to remove PDF reference
    const updatedTraining = await prisma.trainingSession.update({
      where: { id: params.id },
      data: {
        sessionPlanPdf: null,
      },
    })

    return NextResponse.json({ success: true, training: updatedTraining })
  } catch (error) {
    console.error("Error deleting session plan:", error)
    return NextResponse.json(
      { error: "Failed to delete session plan" },
      { status: 500 }
    )
  }
}

