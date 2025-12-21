import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "This test endpoint is not available." },
    { status: 501 }
  )
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "This test endpoint is not available." },
    { status: 501 }
  )
}
