import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCreate } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formations = await prisma.matchFormation.findMany({
      where: { gameId: params.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(formations)
  } catch (error) {
    console.error("Error fetching formations:", error)
    return NextResponse.json(
      { error: "Failed to fetch formations" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, formation, isActive, notes } = body

    // If setting this as active, deactivate all other formations
    if (isActive) {
      await prisma.matchFormation.updateMany({
        where: { gameId: params.id },
        data: { isActive: false },
      })
    }

    const created = await prisma.matchFormation.create({
      data: {
        gameId: params.id,
        name,
        formation: typeof formation === "string" ? formation : JSON.stringify(formation),
        isActive: isActive || false,
        notes,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating formation:", error)
    return NextResponse.json(
      { error: "Failed to create formation" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const formationId = searchParams.get("formationId")

    if (!formationId) {
      return NextResponse.json(
        { error: "formationId is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, formation, isActive, notes } = body

    // If setting this as active, deactivate all other formations
    if (isActive) {
      await prisma.matchFormation.updateMany({
        where: {
          gameId: params.id,
          id: { not: formationId },
        },
        data: { isActive: false },
      })
    }

    const updated = await prisma.matchFormation.update({
      where: { id: formationId },
      data: {
        name,
        formation: typeof formation === "string" ? formation : JSON.stringify(formation),
        isActive,
        notes,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating formation:", error)
    return NextResponse.json(
      { error: "Failed to update formation" },
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canCreate(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const formationId = searchParams.get("formationId")

    if (!formationId) {
      return NextResponse.json(
        { error: "formationId is required" },
        { status: 400 }
      )
    }

    await prisma.matchFormation.delete({
      where: { id: formationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting formation:", error)
    return NextResponse.json(
      { error: "Failed to delete formation" },
      { status: 500 }
    )
  }
}

