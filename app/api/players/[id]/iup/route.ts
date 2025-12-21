import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Temporarily disabled - individualDevelopmentPlan model is not in the Prisma schema
  return NextResponse.json(
    { error: "IUP functionality not available - model not in schema" },
    { status: 501 }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Temporarily disabled - individualDevelopmentPlan model is not in the Prisma schema
  return NextResponse.json(
    { error: "IUP functionality not available - model not in schema" },
    { status: 501 }
  )
}