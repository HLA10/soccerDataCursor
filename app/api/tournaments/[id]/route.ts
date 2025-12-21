import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canDelete } from "@/lib/permissions"

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

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        stats: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error("Error fetching tournament:", error)
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
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
    if (user.role !== "ADMIN" && user.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, season, startDate, endDate, type } = body

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name,
        season,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    console.error("Error updating tournament:", error)
    return NextResponse.json(
      { error: "Failed to update tournament" },
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
      return NextResponse.json({ error: "Forbidden: Only SUPER_USER can delete data" }, { status: 403 })
    }

    await prisma.tournament.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Tournament deleted" })
  } catch (error) {
    console.error("Error deleting tournament:", error)
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 }
    )
  }
}

