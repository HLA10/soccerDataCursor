import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return NextResponse.json(
    { error: "This endpoint is not implemented. Please use /api/players/register instead." },
    { status: 501 }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return NextResponse.json(
    { error: "This endpoint is not implemented." },
    { status: 501 }
  )
}

