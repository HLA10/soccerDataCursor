import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("🔍 Debug auth - Looking up user:", email)
    
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
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      passwordValid: isPasswordValid,
      message: isPasswordValid 
        ? "Password is correct - authentication should work" 
        : "Password is incorrect"
    })
  } catch (error: any) {
    console.error("Debug auth error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 })
  }
}
