import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get("teamId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const user = session.user as any
    const finalTeamId = teamId || user.teamId

    if (!finalTeamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      )
    }

    const whereClause: any = {
      teamId: finalTeamId,
    }

    if (from && to) {
      whereClause.date = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    const sessions = await prisma.trainingSession.findMany({
      where: whereClause,
      include: {
        parts: true,
      },
    })

    const totals: Record<string, number> = {}

    sessions.forEach((session) => {
      session.parts.forEach((part) => {
        const level = part.classificationLevel || "OTHER"
        const duration = part.duration || 0
        totals[level] = (totals[level] || 0) + duration
      })
    })

    return NextResponse.json({
      teamId: finalTeamId,
      from: from || null,
      to: to || null,
      totals,
    })
  } catch (error) {
    console.error("Error fetching training analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch training analytics" },
      { status: 500 }
    )
  }
}





