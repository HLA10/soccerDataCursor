import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageInvitations } from "@/lib/permissions"
import { sendInvitationEmail } from "@/lib/email"
import { validateRequestBody, createInvitationSchema } from "@/lib/validation"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (!canManageInvitations(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
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
    if (!canManageInvitations(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = await validateRequestBody(createInvitationSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, role, teamId } = validation.data

    // Note: SUPER_USER role is not in the validation schema, so it cannot be invited

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours expiration

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        teamId: teamId || null,
        token,
        expiresAt,
        createdById: user.id,
      },
      include: {
        team: {
          select: {
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

    // Send invitation email
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const invitationLink = `${baseUrl}/invite/${token}`

    await sendInvitationEmail({
      email,
      role,
      teamName: invitation.team?.name,
      invitationLink,
      inviterName: invitation.createdBy.name || invitation.createdBy.email,
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error: any) {
    console.error("Error creating invitation:", error)
    return NextResponse.json(
      { error: `Failed to create invitation: ${error.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}

