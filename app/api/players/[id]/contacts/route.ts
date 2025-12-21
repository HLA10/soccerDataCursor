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

    const user = session.user as any
    const isSelfPlayer = user.role === "PLAYER" && user.playerId === params.id
    const canView =
      isSelfPlayer ||
      user.role === "ADMIN" ||
      user.role === "COACH" ||
      user.role === "SUPER_USER"

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        // Note: Contact fields (motherName, fatherName, etc.) are not in the schema
        // Add them to prisma/schema.prisma if needed
      },
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error fetching player contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch player contacts" },
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
    const canEdit =
      user.role === "ADMIN" || user.role === "COACH" || user.role === "SUPER_USER"

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Note: Contact fields are not in the Player schema
    // To enable this functionality, add these fields to prisma/schema.prisma:
    // motherName, motherEmail, motherPhone, fatherName, fatherEmail, fatherPhone,
    // homeAddress, personalNumber, allergies, medicalNotes
    
    const updated = await prisma.player.update({
      where: { id: params.id },
      data: {
        // Contact fields removed - add to schema if needed
      },
      select: {
        id: true,
        name: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating player contacts:", error)
    return NextResponse.json(
      { error: "Failed to update player contacts" },
      { status: 500 }
    )
  }
}




