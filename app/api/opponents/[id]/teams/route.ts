import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate, canEdit, canDelete } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await prisma.opponentTeam.findMany({
      where: { opponentId: params.id },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching opponent teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch opponent teams" },
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
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, gender, age, teamColor, homeField } = body

    if (!name || !gender) {
      return NextResponse.json(
        { error: "Name and gender are required" },
        { status: 400 }
      )
    }

    // Verify opponent exists
    const opponent = await prisma.opponent.findUnique({
      where: { id: params.id },
    })

    if (!opponent) {
      return NextResponse.json(
        { error: "Opponent not found" },
        { status: 404 }
      )
    }

    const team = await prisma.opponentTeam.create({
      data: {
        name,
        gender,
        age: age || null,
        teamColor: teamColor || null,
        homeField: homeField || null,
        opponentId: params.id,
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating opponent team:", error)
    return NextResponse.json(
      { error: "Failed to create opponent team" },
      { status: 500 }
    )
  }
}



