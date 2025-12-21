import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendGameReminderEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
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
    const { gameId } = body

    if (!gameId) {
      return NextResponse.json({ error: "Game ID required" }, { status: 400 })
    }

    // Get game with team and players
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        team: {
          include: {
            players: {
              include: {
                player: {
                  include: {
                    userAccount: true,
                  },
                },
              },
            },
          },
        },
        opponentClub: true,
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Send reminders to all players with email accounts
    let sentCount = 0
    for (const tp of game.team.players) {
      if (tp.player.userAccount?.email) {
        await sendGameReminderEmail({
          email: tp.player.userAccount.email,
          playerName: tp.player.name,
          opponent: game.opponentClub?.name || game.opponent || "TBD",
          date: game.date,
          venue: game.venue,
          teamName: game.team.name,
        })
        sentCount++
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} reminder(s)`,
      sentCount,
    })
  } catch (error) {
    console.error("Error sending game reminders:", error)
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 })
  }
}





