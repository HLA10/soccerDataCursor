import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { signIn } from "next-auth/react"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user
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
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Account status is ${user.status}. Please contact an administrator.` },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Return success - the client will handle NextAuth signin
    return NextResponse.json({
      success: true,
      message: "Credentials verified. Please use the login form to sign in.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
  } catch (error: any) {
    console.error("Simple login error:", error)
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    )
  }
}

