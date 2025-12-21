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
    const type = searchParams.get("type")
    const season = searchParams.get("season")
    const teamId = searchParams.get("teamId")

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (type) {
      where.type = type
    }

    if (season) {
      where.season = {
        contains: season,
        mode: "insensitive",
      }
    }

    if (teamId) {
      where.OR = [
        { teamId: teamId },
        { teams: { some: { teamId: teamId } } },
      ]
    }

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            games: true,
          },
        },
      },
    })

    return NextResponse.json(competitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
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
    const {
      name,
      type,
      customType,
      season,
      startDate,
      endDate,
      description,
      logo,
      location,
      teamId,
      teamIds,
    } = body

    if (!name || !type || !season) {
      return NextResponse.json(
        { error: "Name, type, and season are required" },
        { status: 400 }
      )
    }

    const competition = await prisma.competition.create({
      data: {
        name,
        type,
        customType: type === "CUSTOM" ? customType : null,
        season,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        logo: logo || null,
        location: location || null,
        teamId: teamId || null,
        teams: teamIds && teamIds.length > 0
          ? {
              create: teamIds.map((tid: string) => ({
                teamId: tid,
              })),
            }
          : undefined,
      },
      include: {
        team: true,
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    return NextResponse.json(competition, { status: 201 })
  } catch (error) {
    console.error("Error creating competition:", error)
    return NextResponse.json(
      { error: "Failed to create competition" },
      { status: 500 }
    )
  }
}



