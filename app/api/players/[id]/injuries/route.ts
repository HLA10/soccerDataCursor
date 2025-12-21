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

    const injuries = await prisma.injury.findMany({
      where: { playerId: params.id },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(injuries)
  } catch (error) {
    console.error("Error fetching injuries:", error)
    return NextResponse.json(
      { error: "Failed to fetch injuries" },
      { status: 500 }
    )
  }
}

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
    if (user.role !== "ADMIN" && user.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { type, startDate, endDate, status, description } = body

    if (!type || !startDate) {
      return NextResponse.json(
        { error: "Type and start date are required" },
        { status: 400 }
      )
    }

    const injury = await prisma.injury.create({
      data: {
        playerId: params.id,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || "ACTIVE",
        description: description || null,
      },
    })

    return NextResponse.json(injury, { status: 201 })
  } catch (error) {
    console.error("Error creating injury:", error)
    return NextResponse.json(
      { error: "Failed to create injury" },
      { status: 500 }
    )
  }
}

