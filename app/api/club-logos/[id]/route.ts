import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const param = decodeURIComponent(params.id)
    
    // Check if it's a UUID (ID) or a club name
    let clubLogo
    if (isUUID(param)) {
      // It's an ID - fetch by ID
      clubLogo = await prisma.clubLogo.findUnique({
        where: { id: param },
      })
      
      if (!clubLogo) {
        return NextResponse.json({ error: "Club logo not found" }, { status: 404 })
      }
      
      return NextResponse.json(clubLogo)
    } else {
      // It's a club name - fetch by club name
      clubLogo = await prisma.clubLogo.findUnique({
        where: { clubName: param },
      })
      
      if (!clubLogo) {
        return NextResponse.json({ logo: null }, { status: 200 })
      }
      
      return NextResponse.json({ logo: clubLogo.logo })
    }
  } catch (error) {
    console.error("Error fetching club logo:", error)
    return NextResponse.json(
      { error: "Failed to fetch club logo" },
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { logo } = body

    if (!logo) {
      return NextResponse.json(
        { error: "Logo is required" },
        { status: 400 }
      )
    }

    const clubLogo = await prisma.clubLogo.update({
      where: { id: params.id },
      data: { logo },
    })

    return NextResponse.json(clubLogo)
  } catch (error: any) {
    console.error("Error updating club logo:", error)
    return NextResponse.json(
      { 
        error: "Failed to update club logo",
        details: error?.message || error?.toString() || "Unknown error"
      },
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
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.clubLogo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting club logo:", error)
    return NextResponse.json(
      { error: "Failed to delete club logo" },
      { status: 500 }
    )
  }
}



