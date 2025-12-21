import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
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

    if (!params.seriesId) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      )
    }

    const result = await prisma.trainingSession.deleteMany({
      where: { seriesId: params.seriesId },
    })

    return NextResponse.json({ deletedCount: result.count })
  } catch (error) {
    console.error("Error deleting training series:", error)
    return NextResponse.json(
      { error: "Failed to delete training series" },
      { status: 500 }
    )
  }
}












