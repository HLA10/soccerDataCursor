import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageInvitations } from "@/lib/permissions"

export const dynamic = 'force-dynamic'

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

    const pendingUsers = await prisma.users.findMany({
      where: { status: "PENDING" },
      include: {
        team: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return NextResponse.json({ error: "Failed to fetch pending users" }, { status: 500 })
  }
}




