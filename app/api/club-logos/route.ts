import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clubLogos = await prisma.clubLogo.findMany({
      orderBy: {
        clubName: "asc",
      },
    })

    return NextResponse.json(clubLogos)
  } catch (error) {
    console.error("Error fetching club logos:", error)
    return NextResponse.json(
      { error: "Failed to fetch club logos" },
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
    const { clubName, logo } = body

    if (!clubName || !logo) {
      return NextResponse.json(
        { error: "Club name and logo are required" },
        { status: 400 }
      )
    }

    // Only allow "Djugarden" as club name
    if (clubName.toLowerCase() !== "djugarden") {
      return NextResponse.json(
        { error: "Only 'Djugarden' club logo is allowed" },
        { status: 400 }
      )
    }

    // Upsert: create if doesn't exist, update if it does
    const clubLogo = await prisma.clubLogo.upsert({
      where: { clubName: "Djugarden" }, // Force to Djugarden
      update: { logo },
      create: {
        clubName: "Djugarden",
        logo,
      },
    })

    return NextResponse.json(clubLogo, { status: 201 })
  } catch (error: any) {
    console.error("Error saving club logo:", error)
    return NextResponse.json(
      { 
        error: "Failed to save club logo",
        details: error?.message || error?.toString() || "Unknown error"
      },
      { status: 500 }
    )
  }
}

