import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEdit, canDelete } from "@/lib/permissions"

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

    const opponent = await prisma.opponent.findUnique({
      where: { id: params.id },
      include: {
        games: {
          take: 10,
          orderBy: { date: "desc" },
          select: {
            id: true,
            date: true,
            venue: true,
            score: true,
            team: {
              select: {
                name: true,
              },
            },
          },
        },
        scoutedPlayers: {
          take: 10,
          orderBy: { date: "desc" },
          select: {
            id: true,
            name: true,
            position: true,
            starRating: true,
            date: true,
          },
        },
        teams: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            games: true,
            scoutedPlayers: true,
            teams: true,
          },
        },
      },
    })

    if (!opponent) {
      return NextResponse.json(
        { error: "Opponent not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(opponent)
  } catch (error) {
    console.error("Error fetching opponent:", error)
    return NextResponse.json(
      { error: "Failed to fetch opponent" },
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
    if (!canEdit(user.role, null, null)) {
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

    const opponent = await prisma.opponent.update({
      where: { id: params.id },
      data: {
        name,
        location: location || null,
        homeField: homeField || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        logo: logo || null,
      },
    })

    return NextResponse.json(opponent)
  } catch (error) {
    console.error("Error updating opponent:", error)
    return NextResponse.json(
      { error: "Failed to update opponent" },
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

    await prisma.opponent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Opponent deleted successfully" })
  } catch (error) {
    console.error("Error deleting opponent:", error)
    return NextResponse.json(
      { error: "Failed to delete opponent" },
      { status: 500 }
    )
  }
}

