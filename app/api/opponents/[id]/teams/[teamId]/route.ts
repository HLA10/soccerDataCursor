import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEdit, canDelete } from "@/lib/permissions"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; teamId: string } }
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
    const { name, gender, age, teamColor, homeField } = body

    if (!name || !gender) {
      return NextResponse.json(
        { error: "Name and gender are required" },
        { status: 400 }
      )
    }

    const team = await prisma.opponentTeam.update({
      where: { id: params.teamId },
      data: {
        name,
        gender,
        age: age || null,
        teamColor: teamColor || null,
        homeField: homeField || null,
      },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error updating opponent team:", error)
    return NextResponse.json(
      { error: "Failed to update opponent team" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; teamId: string } }
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

    await prisma.opponentTeam.delete({
      where: { id: params.teamId },
    })

    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting opponent team:", error)
    return NextResponse.json(
      { error: "Failed to delete opponent team" },
      { status: 500 }
    )
  }
}



