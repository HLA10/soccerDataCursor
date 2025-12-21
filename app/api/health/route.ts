import { NextResponse } from "next/server"

export async function GET() {
  try {
    const startTime = Date.now()
    const healthChecks: Record<string, { status: string; latency?: number; error?: string }> = {}

    // Database connectivity check
    try {
      const { prisma } = await import("@/lib/prisma")
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const dbLatency = Date.now() - dbStart
      healthChecks.database = {
        status: "healthy",
        latency: dbLatency,
      }
    } catch (error: any) {
      healthChecks.database = {
        status: "unhealthy",
        error: error.message || "Database connection failed",
      }
    }

    // Environment variables check
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET"]
    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])
    
    if (missingEnvVars.length > 0) {
      healthChecks.environment = {
        status: "warning",
        error: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      }
    } else {
      healthChecks.environment = {
        status: "healthy",
      }
    }

    // Determine overall health status
    const isHealthy = 
      healthChecks.database.status === "healthy" && 
      healthChecks.environment.status !== "warning"

    const totalLatency = Date.now() - startTime

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        latency: totalLatency,
        checks: healthChecks,
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      },
      { status: isHealthy ? 200 : 503 }
    )
  } catch (error: any) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}





