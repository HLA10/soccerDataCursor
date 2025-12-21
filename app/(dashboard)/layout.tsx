"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { TeamProvider } from "@/contexts/team-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { PageSkeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:block w-64 bg-gray-50 border-r" />
        <div className="flex-1 lg:ml-64 pt-16 px-4 lg:px-6 py-8">
          <PageSkeleton />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <TeamProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <main className="pt-16 px-4 lg:px-6 py-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </TeamProvider>
  )
}

