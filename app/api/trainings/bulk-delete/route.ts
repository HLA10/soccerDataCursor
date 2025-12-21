import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
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
    const { ids } = body as { ids?: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "At least one training ID is required" },
        { status: 400 }
      )
    }

    const result = await prisma.trainingSession.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return NextResponse.json({ deletedCount: result.count })
  } catch (error) {
    console.error("Error deleting trainings:", error)
    return NextResponse.json(
      { error: "Failed to delete trainings" },
      { status: 500 }
    )
  }
}












