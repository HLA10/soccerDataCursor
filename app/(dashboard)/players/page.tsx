"use client"

import { useEffect, useState } from "react"
import { PlayerCard } from "@/components/players/player-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog"
import { exportToCSV, formatPlayersForExport } from "@/lib/export"

export default function PlayersPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [players, setPlayers] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showEventDialog, setShowEventDialog] = useState(false)

  const user = session?.user as any

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const params = new URLSearchParams()
        if (selectedTeam?.id) params.append("teamId", selectedTeam.id)
        if (search) params.append("search", search)
        
        const url = params.toString() 
          ? `/api/players?${params.toString()}`
          : "/api/players"
        const res = await fetch(url)
        const data = await res.json()
        setPlayers(data)
      } catch (error) {
        console.error("Error fetching players:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchStaff() {
      try {
        const params = new URLSearchParams()
        if (selectedTeam?.id) params.append("teamId", selectedTeam.id)
        
        const url = params.toString() 
          ? `/api/staff?${params.toString()}`
          : "/api/staff"
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setStaff(data)
        }
      } catch (error) {
        console.error("Error fetching staff:", error)
      }
    }

    fetchPlayers()
    fetchStaff()
  }, [search, selectedTeam])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">Manage your team players</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <div className="flex space-x-2">
            <Button onClick={() => setShowEventDialog(true)} variant="outline">
              Create Event
            </Button>
            <Link href="/players/new">
              <Button>Add Player</Button>
            </Link>
          </div>
        )}
      </div>

      <CreateEventDialog
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        onSuccess={() => {
          // Optionally refresh players list if needed
          window.location.reload()
        }}
      />

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {players.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(formatPlayersForExport(players), "players")}
          >
            Export CSV
          </Button>
        )}
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No players found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Staff Section */}
      {selectedTeam && staff.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Staff</h2>
          <div className="space-y-2">
            {staff.map((staffMember) => (
              <div
                key={staffMember.id}
                className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Link
                  href={`/staff/${staffMember.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {staffMember.name}
                </Link>
                <span className="text-gray-600 text-sm">
                  - {staffMember.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

