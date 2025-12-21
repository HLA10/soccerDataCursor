import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: params.token },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 })
    }

    if (invitation.usedAt) {
      return NextResponse.json({ error: "This invitation has already been used" }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "This invitation has expired" }, { status: 400 })
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { password, name } = body

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password is required and must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Verify invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token: params.token },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 })
    }

    if (invitation.usedAt) {
      return NextResponse.json({ error: "This invitation has already been used" }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "This invitation has expired" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        name: name || null,
        role: invitation.role,
        teamId: invitation.teamId,
        invitedBy: invitation.createdById,
        emailVerified: true,
      },
    })

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json(
      { message: "Account created successfully", user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: `Failed to accept invitation: ${error.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}

