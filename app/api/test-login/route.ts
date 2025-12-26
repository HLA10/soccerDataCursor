import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("🔵 Test login attempt for:", email)

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
      }
    })

    if (!user) {
      console.log("🔴 User not found")
      return NextResponse.json(
        { error: "Invalid email or password", step: "user_not_found" },
        { status: 401 }
      )
    }

    console.log("✅ User found, status:", user.status)

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `User status is ${user.status}. Account must be ACTIVE to login.`, step: "user_status" },
        { status: 403 }
      )
    }

    console.log("🔵 Comparing password...")
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("🔵 Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password", step: "password_invalid" },
        { status: 401 }
      )
    }

    console.log("✅ Login successful!")

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "Credentials are valid. NextAuth should work with these credentials."
    })
  } catch (error: any) {
    console.error("🔴 Test login error:", error)
    return NextResponse.json(
      { error: error.message || "Login failed", step: "error" },
      { status: 500 }
    )
  }
}

