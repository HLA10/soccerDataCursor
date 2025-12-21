"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import Link from "next/link"

interface TournamentRosterSectionProps {
  tournamentId: string
}

export function TournamentRosterSection({ tournamentId }: TournamentRosterSectionProps) {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [roster, setRoster] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playerSearch, setPlayerSearch] = useState("")
  const [staffSearch, setStaffSearch] = useState("")
  const [playerResults, setPlayerResults] = useState<any[]>([])
  const [staffResults, setStaffResults] = useState<any[]>([])
  const [searchingPlayers, setSearchingPlayers] = useState(false)
  const [searchingStaff, setSearchingStaff] = useState(false)
  const [activeTab, setActiveTab] = useState<"roster" | "add">("roster")

  const user = session?.user as any
  const canEdit = user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER"

  useEffect(() => {
    fetchRoster()
  }, [tournamentId])

  const fetchRoster = async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster`)
      if (res.ok) {
        const data = await res.json()
        setRoster(data)
      }
    } catch (error) {
      console.error("Error fetching roster:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchPlayers = async (query: string) => {
    if (!query.trim()) {
      setPlayerResults([])
      return
    }

    setSearchingPlayers(true)
    try {
      const params = new URLSearchParams()
      params.append("search", query)
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const res = await fetch(`/api/players?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        // Filter out players already in roster
        const rosterPlayerIds = new Set(roster.filter((r) => r.playerId).map((r) => r.playerId))
        const filtered = data.filter((p: any) => !rosterPlayerIds.has(p.id))
        setPlayerResults(filtered)
      }
    } catch (error) {
      console.error("Error searching players:", error)
    } finally {
      setSearchingPlayers(false)
    }
  }

  const searchStaff = async (query: string) => {
    if (!query.trim()) {
      setStaffResults([])
      return
    }

    setSearchingStaff(true)
    try {
      const params = new URLSearchParams()
      params.append("search", query)
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const res = await fetch(`/api/staff?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        // Filter out staff already in roster
        const rosterStaffIds = new Set(roster.filter((r) => r.staffId).map((r) => r.staffId))
        const filtered = data.filter((s: any) => !rosterStaffIds.has(s.id))
        setStaffResults(filtered)
      }
    } catch (error) {
      console.error("Error searching staff:", error)
    } finally {
      setSearchingStaff(false)
    }
  }

  const handleAddPlayer = async (playerId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })

      if (res.ok) {
        await fetchRoster()
        setPlayerSearch("")
        setPlayerResults([])
      } else {
        const error = await res.json()
        alert(error.error || "Failed to add player")
      }
    } catch (error) {
      console.error("Error adding player:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const handleAddStaff = async (staffId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      })

      if (res.ok) {
        await fetchRoster()
        setStaffSearch("")
        setStaffResults([])
      } else {
        const error = await res.json()
        alert(error.error || "Failed to add staff")
      }
    } catch (error) {
      console.error("Error adding staff:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const handleRemove = async (rosterId: string) => {
    if (!confirm("Remove this person from the tournament roster?")) {
      return
    }

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster?rosterId=${rosterId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchRoster()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to remove from roster")
      }
    } catch (error) {
      console.error("Error removing from roster:", error)
      alert("An error occurred. Please try again.")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading roster...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournament Roster</h2>
        {canEdit && (
          <div className="flex space-x-2">
            <Button
              variant={activeTab === "roster" ? "default" : "outline"}
              onClick={() => setActiveTab("roster")}
            >
              View Roster
            </Button>
            <Button
              variant={activeTab === "add" ? "default" : "outline"}
              onClick={() => setActiveTab("add")}
            >
              Add Players/Staff
            </Button>
          </div>
        )}
      </div>

      {activeTab === "roster" && (
        <Card>
          <CardHeader>
            <CardTitle>Current Roster ({roster.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground">No players or staff added to roster yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Contact</TableHead>
                    {canEdit && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {entry.player ? (
                          <Link
                            href={`/players/${entry.player.id}`}
                            className="font-medium hover:underline text-primary"
                          >
                            {entry.player.name}
                          </Link>
                        ) : entry.staff ? (
                          <Link
                            href={`/staff/${entry.staff.id}`}
                            className="font-medium hover:underline text-primary"
                          >
                            {entry.staff.name}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.player ? "default" : "secondary"}>
                          {entry.player ? "Player" : "Staff"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.player?.position || entry.staff?.position || "-"}
                      </TableCell>
                      <TableCell>
                        {entry.player?.motherPhone || entry.staff?.phone || "-"}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(entry.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "add" && canEdit && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Search players by name or position..."
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value)
                    searchPlayers(e.target.value)
                  }}
                />
              </div>
              {searchingPlayers && (
                <p className="text-sm text-muted-foreground">Searching...</p>
              )}
              {playerResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {playerResults.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.position} {player.jerseyNumber && `#${player.jerseyNumber}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddPlayer(player.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {playerSearch && !searchingPlayers && playerResults.length === 0 && (
                <p className="text-sm text-muted-foreground">No players found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Search staff by name or position..."
                  value={staffSearch}
                  onChange={(e) => {
                    setStaffSearch(e.target.value)
                    searchStaff(e.target.value)
                  }}
                />
              </div>
              {searchingStaff && (
                <p className="text-sm text-muted-foreground">Searching...</p>
              )}
              {staffResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {staffResults.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.position}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddStaff(staff.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {staffSearch && !searchingStaff && staffResults.length === 0 && (
                <p className="text-sm text-muted-foreground">No staff found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}









