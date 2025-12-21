import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canDelete, canEdit } from "@/lib/permissions"
import { getTeamLogo } from "@/lib/team-logo-utils"
import { getOpponentLogo } from "@/lib/opponent-logo-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch club logos for opponent logo matching
    const clubLogos = await prisma.clubLogo.findMany()
    const clubLogosArray = clubLogos.map(cl => ({
      clubName: cl.clubName,
      logo: cl.logo
    }))

    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        stats: {
          include: {
            player: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true,
          },
        },
        opponentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            location: true,
            homeField: true,
          },
        },
        competitionRelation: {
          select: {
            id: true,
            name: true,
            type: true,
            customType: true,
            logo: true,
            season: true,
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Apply Djugarden logo to team data and club logos to opponents
    const gameWithLogo = {
      ...game,
      team: game.team ? {
        ...game.team,
        logo: getTeamLogo(game.team),
      } : game.team,
      // Apply club logo to opponentClub if it doesn't have one
      opponentClub: game.opponentClub ? {
        ...game.opponentClub,
        logo: getOpponentLogo(game.opponentClub, clubLogosArray) || game.opponentClub.logo,
      } : game.opponentClub,
      // Add opponent logo for string-based opponents
      opponentLogo: game.opponent ? getOpponentLogo({ name: game.opponent }, clubLogosArray) : null,
    }

    return NextResponse.json(gameWithLogo)
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json(
      { error: "Failed to fetch game" },
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
    
    // Get game to check team ownership
    const existingGame = await prisma.game.findUnique({
      where: { id: params.id },
    })

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Check permissions
    if (!canEdit(user.role, user.teamId, existingGame.teamId)) {
      return NextResponse.json({ error: "Forbidden: You can only edit games from your own team" }, { status: 403 })
    }

    const body = await request.json()
    const { date, opponent, opponentId, venue, competition, competitionId, score, isHome, rating, duration } = body

    const updateData: any = {
      date: date ? new Date(date) : undefined,
      venue,
      score,
      isHome: isHome !== undefined ? isHome : undefined,
      rating: rating !== undefined ? Math.max(1, Math.min(5, rating)) : undefined,
      duration: duration !== undefined ? parseInt(duration) : undefined,
    }

    // Update opponent fields if provided
    if (opponent !== undefined) {
      updateData.opponent = opponent
    }
    if (opponentId !== undefined) {
      updateData.opponentId = opponentId
    }

    // Update competition fields if provided
    if (competition !== undefined) {
      updateData.competition = competition
    }
    if (competitionId !== undefined) {
      updateData.competitionId = competitionId
    }

    const game = await prisma.game.update({
      where: { id: params.id },
      data: updateData,
      include: {
        stats: {
          include: {
            player: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true,
          },
        },
        opponentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            location: true,
            homeField: true,
          },
        },
        competitionRelation: {
          select: {
            id: true,
            name: true,
            type: true,
            customType: true,
            logo: true,
            season: true,
          },
        },
      },
    })

    // Apply logos
    const clubLogos = await prisma.clubLogo.findMany()
    const clubLogosArray = clubLogos.map(cl => ({
      clubName: cl.clubName,
      logo: cl.logo
    }))

    const gameWithLogo = {
      ...game,
      team: game.team ? {
        ...game.team,
        logo: getTeamLogo(game.team),
      } : game.team,
      opponentClub: game.opponentClub ? {
        ...game.opponentClub,
        logo: getOpponentLogo(game.opponentClub, clubLogosArray) || game.opponentClub.logo,
      } : game.opponentClub,
      opponentLogo: game.opponent ? getOpponentLogo({ name: game.opponent }, clubLogosArray) : null,
    }

    return NextResponse.json(gameWithLogo)
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json(
      { error: "Failed to update game" },
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

    await prisma.game.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Game deleted" })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    )
  }
}
