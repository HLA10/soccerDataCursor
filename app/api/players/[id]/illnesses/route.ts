import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const illnesses = await prisma.illness.findMany({
      where: { playerId: params.id },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(illnesses)
  } catch (error) {
    console.error("Error fetching illnesses:", error)
    return NextResponse.json(
      { error: "Failed to fetch illnesses" },
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

    const illness = await prisma.illness.create({
      data: {
        playerId: params.id,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || "ACTIVE",
        description: description || null,
      },
    })

    return NextResponse.json(illness, { status: 201 })
  } catch (error) {
    console.error("Error creating illness:", error)
    return NextResponse.json(
      { error: "Failed to create illness" },
      { status: 500 }
    )
  }
}

