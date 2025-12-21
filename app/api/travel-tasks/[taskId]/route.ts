import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  // Temporarily disabled - travelTask model is not in the Prisma schema
  return NextResponse.json(
    { error: "Travel task functionality not available - model not in schema" },
    { status: 501 }
  )
}