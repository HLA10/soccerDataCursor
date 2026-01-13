"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === "authenticated" && session) {
      router.push("/dashboard")
    }
  }, [mounted, status, session, router])

  // Check for NextAuth error in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration. Please check NEXTAUTH_SECRET environment variable.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification token has expired or has already been used.",
        CredentialsSignin: "Invalid email or password.",
        Default: "An error occurred during authentication. Please try again.",
      }
      setError(errorMessages[errorParam] || errorMessages.Default)
      
      // Also log the error for debugging
      console.error("NextAuth error:", errorParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000) // 30 second timeout
      })

      const signInPromise = signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      const result = await Promise.race([signInPromise, timeoutPromise]) as any

      console.log("Login result:", result)

      if (result?.error) {
        // Provide more specific error messages
        console.error("Login error:", result.error)
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (result.error.includes("pending approval")) {
          setError("Your account is pending approval. Please wait for an admin to approve your registration.")
        } else if (result.error.includes("not approved")) {
          setError("Your account registration was not approved.")
        } else if (result.error.includes("Database connection")) {
          setError("Database connection error. Please contact support.")
        } else {
          setError(result.error || "Invalid email or password. Please try again.")
        }
      } else if (result?.ok) {
        // Success - redirect to dashboard
        console.log("Login successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
      } else {
        // No error but also no success - this shouldn't happen
        console.error("Unexpected login result:", result)
        setError("Login failed. Please check your credentials and try again.")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.message === "Request timeout") {
        setError("Login is taking too long. This might indicate a database connection issue. Please try again or contact support.")
      } else {
        setError(`Login failed: ${err.message || "An unexpected error occurred. Please try again."}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <div className="flex justify-center mt-4">
            <Image 
              src="/logo.png.png" 
              alt="Djugarden IF Logo" 
              width={80} 
              height={80}
              className="object-contain"
            />
          </div>
          <div className="text-center mt-4">
            <CardDescription>Djugarden IF</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-gray-500 mt-4">
              <Link href="/player/login" className="hover:underline">
                Access Player Wellness Portal
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

