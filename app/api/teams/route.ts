import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applyTeamLogos } from "@/lib/team-logo-utils"
import { extractClubName } from "@/lib/club-logos"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      orderBy: {
        name: "asc",
      },
    })

    // Fetch all club logos for logo inheritance
    const clubLogos = await prisma.clubLogo.findMany()
    const clubLogosMap = clubLogos.map(cl => ({
      clubName: cl.clubName,
      logo: cl.logo,
    }))

    // Automatically apply logos (team logo → club logo → Djugarden logo)
    const teamsWithLogos = applyTeamLogos(teams || [], clubLogosMap)

    return NextResponse.json(teamsWithLogos)
  } catch (error: any) {
    console.error("Error fetching teams:", error)
    
    // Check if the error is because the table doesn't exist
    if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('Unknown model')) {
      return NextResponse.json(
        { error: "Teams table does not exist. Please run: npx prisma db push && npx prisma generate" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to fetch teams: ${error.message || 'Unknown error'}` },
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, code, logo } = body

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      )
    }

    // Auto-assign club logo if team has no logo
    let finalLogo = logo
    if (!finalLogo) {
      const clubName = extractClubName(name)
      if (clubName) {
        const clubLogo = await prisma.clubLogo.findUnique({
          where: { clubName },
        })
        if (clubLogo) {
          finalLogo = clubLogo.logo
        }
      }
    }

    const team = await prisma.team.create({
      data: {
        name,
        code: code || null,
        logo: finalLogo || null,
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}

