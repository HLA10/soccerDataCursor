import { NextRequest, NextResponse } from "next/server"

// Redirect /api/auth/error to /error page with error parameter
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")
  
  // Log for debugging
  console.error("🔴 /api/auth/error called")
  console.error("Error param:", error)
  console.error("All params:", Object.fromEntries(searchParams.entries()))
  console.error("Full URL:", request.url)
  
  // Try to get error from query string or default to CredentialsSignin
  const errorCode = error || "CredentialsSignin"
  
  const redirectUrl = new URL("/error", request.url)
  redirectUrl.searchParams.set("error", errorCode)
  
  return NextResponse.redirect(redirectUrl)
}
