import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: "ACTIVE" },
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve user" },
      { status: 500 }
    )
  }
}

