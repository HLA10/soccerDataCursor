"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTeam } from "@/contexts/team-context"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const { selectedTeam } = useTeam()

  const handleSignOut = async () => {
    // Clear team selection from localStorage
    localStorage.removeItem("selectedTeamId")
    await signOut({ redirect: false })
    router.push("/login")
  }

  if (!session) return null

  return (
    <nav className="border-b bg-white h-16 fixed top-0 left-0 lg:left-64 right-0 z-10">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center ml-12 lg:ml-0">
          <h1 className="text-lg font-semibold truncate max-w-[200px] lg:max-w-none">
            {selectedTeam?.name || "Football CMS"}
          </h1>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <span className="text-xs text-gray-600 hidden sm:block">{session.user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}

