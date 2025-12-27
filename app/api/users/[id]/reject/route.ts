import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.users.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reject user" },
      { status: 500 }
    )
  }
}

