"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams?.get("error")

  // Log all search params for debugging
  useEffect(() => {
    const params = Object.fromEntries(searchParams?.entries() || [])
    console.error("🔴 Error page loaded")
    console.error("All search params:", params)
    console.error("Error param:", error)
    console.error("Current URL:", window.location.href)
  }, [searchParams, error])

  const errorMessages: Record<string, { title: string; message: string }> = {
    Configuration: {
      title: "Configuration Error",
      message: "There is a problem with the server configuration. Please check that NEXTAUTH_SECRET is set in your environment variables.",
    },
    AccessDenied: {
      title: "Access Denied",
      message: "You do not have permission to sign in. Please contact an administrator.",
    },
    Verification: {
      title: "Verification Error",
      message: "The verification token has expired or has already been used.",
    },
    CredentialsSignin: {
      title: "Login Failed",
      message: "Invalid email or password. Please try again.",
    },
    Default: {
      title: "Authentication Error",
      message: "An error occurred during authentication. Please try again.",
    },
  }

  const errorInfo = errorMessages[error || ""] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">{errorInfo.title}</CardTitle>
          <CardDescription>Authentication Error</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{errorInfo.message}</p>
          
          <div className="p-3 bg-muted rounded-md space-y-2">
            {error ? (
              <>
                <p className="text-xs font-mono text-muted-foreground">
                  Error code: {error}
                </p>
                {error === "Default" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This usually means invalid email or password. Please check:
                    <br />• Email: admin@example.com
                    <br />• Password: admin123
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                No specific error code provided. This usually means invalid credentials.
                <br />Try: Email: admin@example.com, Password: admin123
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/login")} className="flex-1">
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Go Back
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:underline">
              Return to login page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
