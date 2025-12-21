"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

function PlayerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const user = session.user as any
      // Allow both PLAYER and ADMIN/SUPER_USER to access player wellness
      if (user.role === "PLAYER" || user.role === "ADMIN" || user.role === "SUPER_USER" || user.role === "COACH") {
        router.push("/player/wellness")
      } else {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setError("")
      // Show success message
      const timer = setTimeout(() => {
        // Clear any error and show success
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Check user role and redirect accordingly
        // Allow ADMIN, SUPER_USER, COACH, and PLAYER to access player wellness
        const res = await fetch("/api/auth/session")
        const sessionData = await res.json()
        const role = sessionData?.user?.role
        if (role === "PLAYER" || role === "ADMIN" || role === "SUPER_USER" || role === "COACH") {
          router.push("/player/wellness")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Player Wellness Portal</CardTitle>
          <CardDescription>
            Sign in to access the wellness questionnaire. Admin and staff can use their regular credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.get("registered") === "true" && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded text-sm">
              Account created successfully! Please sign in.
            </div>
          )}
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
            <div className="text-center text-sm">
              <Link href="/player/register" className="text-primary hover:underline">
                Don't have an account? Register
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500">
              <Link href="/login" className="hover:underline">
                Staff/Admin Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PlayerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    }>
      <PlayerLoginForm />
    </Suspense>
  )
}

