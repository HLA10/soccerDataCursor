import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Find player by name (fuzzy matching)
    const players = await prisma.player.findMany({
      where: {
        isUnderContract: true, // Only match active players
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    // Match player name
    const matchedPlayer = players.find((p) => {
      const playerNameLower = p.name.toLowerCase().trim()
      const inputNameLower = name.toLowerCase().trim()

      // Exact match
      if (playerNameLower === inputNameLower) return true

      // Check if names are similar (one contains the other)
      if (playerNameLower.includes(inputNameLower) || inputNameLower.includes(playerNameLower)) {
        return true
      }

      // Check if first and last name match (split by space)
      const playerParts = playerNameLower.split(/\s+/)
      const inputParts = inputNameLower.split(/\s+/)

      if (playerParts.length >= 2 && inputParts.length >= 2) {
        // Check if first and last name match
        if (
          (playerParts[0] === inputParts[0] && 
           playerParts[playerParts.length - 1] === inputParts[inputParts.length - 1]) ||
          (playerParts[0] === inputParts[inputParts.length - 1] && 
           playerParts[playerParts.length - 1] === inputParts[0])
        ) {
          return true
        }
      }

      return false
    })

    if (!matchedPlayer) {
      return NextResponse.json(
        { 
          error: "Player name not found. Your name must match exactly with your name in the team roster.",
          suggestion: "Please check your name spelling and try again."
        },
        { status: 404 }
      )
    }

    // Check if player already has an account
    const existingPlayerAccount = await prisma.user.findUnique({
      where: { playerId: matchedPlayer.id },
    })

    if (existingPlayerAccount) {
      return NextResponse.json(
        { error: "An account already exists for this player" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get player's primary team
    const playerTeam = matchedPlayer.primaryTeamId 
      ? await prisma.team.findUnique({ where: { id: matchedPlayer.primaryTeamId } })
      : matchedPlayer.teams[0]?.team

    // Create user account
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: matchedPlayer.name, // Use the exact player name from database
        role: "PLAYER",
        playerId: matchedPlayer.id,
        teamId: playerTeam?.id || null,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { 
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating player account:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}



