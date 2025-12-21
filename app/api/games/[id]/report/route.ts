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

    const report = await prisma.matchReport.findUnique({
      where: { gameId: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        playerRatings: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                position: true,
                jerseyNumber: true,
                photo: true,
              },
            },
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json(null)
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching match report:", error)
    return NextResponse.json(
      { error: "Failed to fetch match report" },
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
    const {
      postMatchNotes,
      tacticalObservations,
      keyMoments,
      videoLinks,
      overallRating,
      areasForImprovement,
      playerRatings,
    } = body

    // Check if report already exists
    const existing = await prisma.matchReport.findUnique({
      where: { gameId: params.id },
    })

    if (existing) {
      // Update existing report
      const updated = await prisma.matchReport.update({
        where: { id: existing.id },
        data: {
          postMatchNotes,
          tacticalObservations,
          keyMoments:
            typeof keyMoments === "string"
              ? keyMoments
              : JSON.stringify(keyMoments),
          videoLinks: videoLinks || [],
          overallRating,
          areasForImprovement,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          playerRatings: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  jerseyNumber: true,
                  photo: true,
                },
              },
            },
          },
        },
      })

      // Update or create player ratings
      if (playerRatings && Array.isArray(playerRatings)) {
        for (const rating of playerRatings) {
          await prisma.matchPlayerRating.upsert({
            where: {
              matchReportId_playerId: {
                matchReportId: updated.id,
                playerId: rating.playerId,
              },
            },
            update: {
              rating: rating.rating,
              feedback: rating.feedback,
              areasForImprovement: rating.areasForImprovement,
            },
            create: {
              matchReportId: updated.id,
              playerId: rating.playerId,
              rating: rating.rating,
              feedback: rating.feedback,
              areasForImprovement: rating.areasForImprovement,
            },
          })
        }
      }

      // Fetch updated report with all ratings
      const finalReport = await prisma.matchReport.findUnique({
        where: { id: updated.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          playerRatings: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  jerseyNumber: true,
                  photo: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json(finalReport)
    } else {
      // Create new report
      const created = await prisma.matchReport.create({
        data: {
          gameId: params.id,
          authorId: user.id,
          postMatchNotes,
          tacticalObservations,
          keyMoments:
            typeof keyMoments === "string"
              ? keyMoments
              : JSON.stringify(keyMoments),
          videoLinks: videoLinks || [],
          overallRating,
          areasForImprovement,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create player ratings
      if (playerRatings && Array.isArray(playerRatings)) {
        for (const rating of playerRatings) {
          await prisma.matchPlayerRating.create({
            data: {
              matchReportId: created.id,
              playerId: rating.playerId,
              rating: rating.rating,
              feedback: rating.feedback,
              areasForImprovement: rating.areasForImprovement,
            },
          })
        }
      }

      // Fetch complete report with all ratings
      const finalReport = await prisma.matchReport.findUnique({
        where: { id: created.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          playerRatings: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  jerseyNumber: true,
                  photo: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json(finalReport, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating/updating match report:", error)
    return NextResponse.json(
      { error: "Failed to create/update match report" },
      { status: 500 }
    )
  }
}

