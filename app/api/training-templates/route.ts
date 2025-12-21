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

    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get("teamId")

    const user = session.user as any
    const finalTeamId = teamId || user.teamId

    const whereClause: any = {}
    
    if (finalTeamId) {
      whereClause.teamId = finalTeamId
    }

    const templates = await prisma.trainingSessionTemplate.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        parts: {
          orderBy: {
            partNumber: "asc",
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
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
    const { name, description, teamId, parts } = body

    if (!name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      )
    }

    const finalTeamId = teamId || user.teamId
    if (!finalTeamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      )
    }

    const template = await prisma.trainingSessionTemplate.create({
      data: {
        name,
        description: description || null,
        teamId: finalTeamId,
        authorId: user.id,
        parts: parts && parts.length > 0
          ? {
              create: (parts as any[]).map((part: any) => ({
                partNumber: part.partNumber,
                partType: part.partType || null,
                withBall: part.withBall !== undefined ? part.withBall : null,
                duration: part.duration || null,
                classificationLevel: part.classificationLevel || null,
                classificationStyle: part.classificationStyle || null,
              })),
            }
          : undefined,
      },
      include: {
        parts: {
          orderBy: {
            partNumber: "asc",
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}

