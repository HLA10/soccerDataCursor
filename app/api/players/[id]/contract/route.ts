import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEdit } from "@/lib/permissions"
import bcrypt from "bcryptjs"

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
    const { isUnderContract, password } = body

    if (isUnderContract === undefined) {
      return NextResponse.json(
        { error: "isUnderContract is required" },
        { status: 400 }
      )
    }

    // Verify password when marking as out of contract
    if (isUnderContract === false && !password) {
      return NextResponse.json(
        { error: "Password is required to mark player as out of contract" },
        { status: 400 }
      )
    }

    // Get player to check team ownership
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        primaryTeam: true,
        teams: true,
      },
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Check permissions - COACH can only edit their own team's players
    if (!canEdit(user.role, user.teamId, player.primaryTeamId)) {
      return NextResponse.json(
        { error: "Forbidden: You can only manage players from your own team" },
        { status: 403 }
      )
    }

    // Verify password if marking as out of contract
    if (isUnderContract === false && password) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(password, dbUser.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        )
      }
    }

    // Update player contract status
    const updatedPlayer = await prisma.player.update({
      where: { id: params.id },
      data: {
        isUnderContract,
      },
      include: {
        primaryTeam: true,
        teams: true,
      },
    })

    // If marking as out of contract, remove from all TeamPlayer relationships
    if (isUnderContract === false && player.teams.length > 0) {
      await prisma.team_players.deleteMany({
        where: {
          playerId: params.id,
        },
      })
    }

    // If marking as under contract again and has a primary team, add back to TeamPlayer
    if (isUnderContract === true && player.primaryTeamId) {
      // Check if TeamPlayer entry exists
      const existingTeamPlayer = await prisma.team_players.findFirst({
        where: {
          playerId: params.id,
          teamId: player.primaryTeamId,
        },
      })

      if (!existingTeamPlayer) {
        await prisma.team_players.create({
          data: {
            playerId: params.id,
            teamId: player.primaryTeamId,
            isBorrowed: false,
          },
        })
      }
    }

    return NextResponse.json(updatedPlayer)
  } catch (error: any) {
    console.error("Error updating contract status:", error)
    return NextResponse.json(
      { error: `Failed to update contract status: ${error.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}

