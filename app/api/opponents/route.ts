import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const opponents = await prisma.opponent.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            games: true,
            scoutedPlayers: true,
          },
        },
      },
    })

    return NextResponse.json(opponents)
  } catch (error) {
    console.error("Error fetching opponents:", error)
    return NextResponse.json(
      { error: "Failed to fetch opponents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { name, location, homeField, primaryColor, secondaryColor, logo } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const opponent = await prisma.opponent.create({
      data: {
        name,
        location: location || null,
        homeField: homeField || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        logo: logo || null,
      },
    })

    return NextResponse.json(opponent, { status: 201 })
  } catch (error) {
    console.error("Error creating opponent:", error)
    return NextResponse.json(
      { error: "Failed to create opponent" },
      { status: 500 }
    )
  }
}



