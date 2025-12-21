"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/player/login")
      return
    }

    // Allow ADMIN, SUPER_USER, COACH, and PLAYER to access player portal
    if (status === "authenticated") {
      const user = session?.user as any
      const allowedRoles = ["PLAYER", "ADMIN", "SUPER_USER", "COACH"]
      if (user?.role && !allowedRoles.includes(user.role)) {
        router.push("/dashboard")
        return
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const user = session?.user as any
  const allowedRoles = ["PLAYER", "ADMIN", "SUPER_USER", "COACH"]
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  // Full-width layout without sidebar for players
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

