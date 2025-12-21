"use client"

import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SoccerField } from "@/components/games/soccer-field"
import { useTeam } from "@/contexts/team-context"
import { Checkbox } from "@/components/ui/checkbox"

interface Player {
  id: string
  name: string
  position: string
  jerseyNumber: number | null
  photo: string | null
  primaryTeam?: {
    id: string
    name: string
  }
}

interface SquadEntry {
  id?: string
  playerId: string
  isStartingXI: boolean
  isSubstitute: boolean
  position: string | null
  jerseyNumber: number | null
  player?: Player
}

interface MatchSquadSectionProps {
  gameId: string
  canEdit: boolean
  onSave?: () => void | Promise<void>
  onSaveRef?: React.MutableRefObject<(() => Promise<void>) | undefined>
  onSaveAndNext?: () => void | Promise<void>
  game?: any
  onGameUpdate?: (game: any) => void
}

const FORMATION_OPTIONS = [
  "4-4-2",
  "4-3-3",
  "4-2-3-1",
  "3-5-2",
  "3-4-3",
  "4-5-1",
  "5-3-2",
] as const

const POSITION_OPTIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "ST",
] as const

export const MatchSquadSection = forwardRef<any, MatchSquadSectionProps>(
  ({ gameId, canEdit, onSave, onSaveRef, onSaveAndNext, game, onGameUpdate }, ref) => {
  const { selectedTeam } = useTeam()
  const [players, setPlayers] = useState<Player[]>([])
  const [squad, setSquad] = useState<SquadEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState<string>("4-4-2")
  const [matchDuration, setMatchDuration] = useState<number>(90)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchAllPlayers, setSearchAllPlayers] = useState(false)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, selectedTeam?.id])

  // Search all players when search term changes and searchAllPlayers is enabled
  useEffect(() => {
    if (searchAllPlayers && searchTerm.trim()) {
      const timeoutId = setTimeout(async () => {
        setSearching(true)
        try {
          const res = await fetch(`/api/players?search=${encodeURIComponent(searchTerm.trim())}`)
          if (res.ok) {
            const data = await res.json()
            setAllPlayers(data)
          }
        } catch (error) {
          console.error("Error searching all players:", error)
        } finally {
          setSearching(false)
        }
      }, 300) // Debounce search

      return () => clearTimeout(timeoutId)
    } else if (!searchAllPlayers) {
      setAllPlayers([])
    }
  }, [searchTerm, searchAllPlayers])

  async function fetchData() {
    try {
      setLoading(true)
      const [playersRes, squadRes] = await Promise.all([
        fetch(
          `/api/players?teamId=${selectedTeam?.id || ""}&includeBorrowed=true`
        ),
        fetch(`/api/games/${gameId}/squad`),
      ])

      const playersData = await playersRes.json()
      const squadData = await squadRes.json()

      setPlayers(playersData)
      setSquad(squadData || [])

      // Load saved formation if available
      const formationsRes = await fetch(`/api/games/${gameId}/formations`)
      const formationsData = await formationsRes.json()
      const activeFormation = formationsData.find((f: any) => f.isActive)
      if (activeFormation) {
        setSelectedFormation(activeFormation.name)
      }

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load game duration when game prop changes
  useEffect(() => {
    if (game?.duration) {
      setMatchDuration(game.duration)
    }
  }, [game?.duration])

  const handleSaveSquad = useCallback(async (suppressAlert = false) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/games/${gameId}/squad`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squad }),
      })

      if (!response.ok) throw new Error("Failed to save squad")

      // Save formation
      await fetch(`/api/games/${gameId}/formations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedFormation,
          formation: JSON.stringify({ formation: selectedFormation }),
          isActive: true,
        }),
      })

      // Save match duration
      const durationRes = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: matchDuration,
        }),
      })

      if (durationRes.ok && onGameUpdate) {
        const updatedGame = await durationRes.json()
        onGameUpdate(updatedGame)
      }

      if (!suppressAlert) {
        alert("Squad saved successfully!")
      }
      
      // Call onSave callback if provided
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error("Error saving squad:", error)
      if (!suppressAlert) {
        alert("Failed to save squad")
      }
      throw error // Re-throw so parent can handle it
    } finally {
      setSaving(false)
    }
  }, [gameId, squad, selectedFormation, matchDuration, onSave])

  const handleSaveAndNext = useCallback(async () => {
    try {
      await handleSaveSquad(true) // Suppress alert
      if (onSaveAndNext) {
        await onSaveAndNext()
      }
    } catch (error) {
      console.error("Error in save and next:", error)
      alert("Failed to save squad. Please try again.")
    }
  }, [handleSaveSquad, onSaveAndNext])

  // Expose save function via ref
  useImperativeHandle(ref, () => ({
    save: handleSaveSquad,
  }), [handleSaveSquad])

  // Also expose via onSaveRef if provided
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef.current = handleSaveSquad
    }
  }, [onSaveRef, handleSaveSquad])

  function togglePlayerInSquad(
    playerId: string,
    type: "startingXI" | "substitute"
  ) {
    if (!canEdit) return

    const existing = squad.find((s) => s.playerId === playerId)
    const player = players.find((p) => p.id === playerId)

    if (existing) {
      if (type === "startingXI") {
        if (existing.isStartingXI) {
          // Remove from starting XI
          setSquad(squad.filter((s) => s.playerId !== playerId))
        } else {
          // Move to starting XI (remove from substitutes)
          setSquad(
            squad.map((s) =>
              s.playerId === playerId
                ? {
                    ...s,
                    isStartingXI: true,
                    isSubstitute: false,
                    position: s.position || player?.position || null,
                  }
                : s
            )
          )
        }
      } else {
        if (existing.isSubstitute) {
          // Remove from substitutes
          setSquad(squad.filter((s) => s.playerId !== playerId))
        } else {
          // Move to substitutes (remove from starting XI)
          setSquad(
            squad.map((s) =>
              s.playerId === playerId
                ? {
                    ...s,
                    isStartingXI: false,
                    isSubstitute: true,
                    position: null,
                  }
                : s
            )
          )
        }
      }
    } else {
      // Add new player
      const newEntry: SquadEntry = {
        playerId,
        isStartingXI: type === "startingXI",
        isSubstitute: type === "substitute",
        position: type === "startingXI" ? player?.position || null : null,
        jerseyNumber: player?.jerseyNumber || null,
        player,
      }
      setSquad([...squad, newEntry])
    }
  }

  function updatePlayerPosition(playerId: string, position: string | null) {
    if (!canEdit) return
    setSquad(
      squad.map((s) =>
        s.playerId === playerId ? { ...s, position } : s
      )
    )
  }

  function updateJerseyNumber(playerId: string, jerseyNumber: number | null) {
    if (!canEdit) return
    setSquad(
      squad.map((s) =>
        s.playerId === playerId ? { ...s, jerseyNumber } : s
      )
    )
  }

  const startingXI = squad.filter((s) => s.isStartingXI)
  const substitutes = squad.filter((s) => s.isSubstitute)
  const availablePlayers = players.filter(
    (p) => !squad.some((s) => s.playerId === p.id)
  )

  // Use all players search results if searchAllPlayers is enabled, otherwise use team players
  const playersToShow = searchAllPlayers && searchTerm.trim() 
    ? allPlayers.filter((p) => !squad.some((s) => s.playerId === p.id))
    : availablePlayers

  const filteredPlayers = playersToShow.filter(
    (p) =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fieldPlayers = startingXI.map((entry) => {
    const player = players.find((p) => p.id === entry.playerId) || allPlayers.find((p) => p.id === entry.playerId)
    return {
      playerId: entry.playerId,
      playerName: player?.name || "",
      position: entry.position || "",
      jerseyNumber: entry.jerseyNumber || player?.jerseyNumber || null,
    }
  })

  if (loading) {
    return <div className="text-center py-8">Loading squad...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formation Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Starting XI Formation</CardTitle>
          </CardHeader>
          <CardContent>
            <SoccerField
              players={fieldPlayers}
              formation={selectedFormation}
              onFormationChange={canEdit ? setSelectedFormation : undefined}
              duration={matchDuration}
              onDurationChange={canEdit ? setMatchDuration : undefined}
            />
          </CardContent>
        </Card>

        {/* Starting XI List */}
        <Card>
          <CardHeader>
            <CardTitle>Starting XI ({startingXI.length}/11)</CardTitle>
          </CardHeader>
          <CardContent>
            {startingXI.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Jersey</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {startingXI.map((entry) => {
                    const player = players.find((p) => p.id === entry.playerId)
                    return (
                      <TableRow key={entry.playerId}>
                        <TableCell>{player?.name || "Unknown"}</TableCell>
                        <TableCell>
                          {canEdit ? (
                            <select
                              value={entry.position || ""}
                              onChange={(e) =>
                                updatePlayerPosition(
                                  entry.playerId,
                                  e.target.value || null
                                )
                              }
                              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                            >
                              <option value="">Select Position</option>
                              {POSITION_OPTIONS.map((pos) => (
                                <option key={pos} value={pos}>
                                  {pos}
                                </option>
                              ))}
                            </select>
                          ) : (
                            entry.position || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {canEdit ? (
                            <Input
                              type="number"
                              value={entry.jerseyNumber || ""}
                              onChange={(e) =>
                                updateJerseyNumber(
                                  entry.playerId,
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : null
                                )
                              }
                              className="w-20"
                            />
                          ) : (
                            entry.jerseyNumber || "-"
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No players selected for starting XI
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Substitutes */}
      <Card>
        <CardHeader>
          <CardTitle>Substitutes ({substitutes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {substitutes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {substitutes.map((entry) => {
                const player = players.find((p) => p.id === entry.playerId)
                return (
                  <div
                    key={entry.playerId}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <span className="text-sm font-medium">
                      {player?.name || "Unknown"}
                    </span>
                    {player?.jerseyNumber && (
                      <span className="text-xs text-muted-foreground">
                        #{player.jerseyNumber}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No substitutes</p>
          )}
        </CardContent>
      </Card>

      {/* Available Players */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Available Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-all-players"
                  checked={searchAllPlayers}
                  onCheckedChange={(checked) => {
                    setSearchAllPlayers(checked as boolean)
                    if (!checked) {
                      setSearchTerm("")
                      setAllPlayers([])
                    }
                  }}
                />
                <Label htmlFor="search-all-players" className="text-sm font-medium">
                  Search all teams (for borrowed players)
                </Label>
              </div>
              <Input
                placeholder={searchAllPlayers ? "Search all players..." : "Search team players..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searching && (
              <p className="text-sm text-muted-foreground mb-2">Searching...</p>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPlayers.length === 0 && !searching ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchAllPlayers && searchTerm.trim()
                    ? "No players found. Try a different search term."
                    : searchTerm.trim()
                    ? "No players found in your team."
                    : "No available players. All team players are already in the squad."}
                </p>
              ) : (
                filteredPlayers.map((player: any) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {player.position}
                      </span>
                      {player.jerseyNumber && (
                        <span className="text-xs text-muted-foreground">
                          #{player.jerseyNumber}
                        </span>
                      )}
                      {searchAllPlayers && player.primaryTeam && (
                        <span className="text-xs text-muted-foreground italic">
                          ({player.primaryTeam?.name || "Other Team"})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`starting-${player.id}`}
                          checked={squad.some(
                            (s) => s.playerId === player.id && s.isStartingXI
                          )}
                          onCheckedChange={() =>
                            togglePlayerInSquad(player.id, "startingXI")
                          }
                        />
                        <Label htmlFor={`starting-${player.id}`} className="text-sm">
                          Starting XI
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`sub-${player.id}`}
                          checked={squad.some(
                            (s) => s.playerId === player.id && s.isSubstitute
                          )}
                          onCheckedChange={() =>
                            togglePlayerInSquad(player.id, "substitute")
                          }
                        />
                        <Label htmlFor={`sub-${player.id}`} className="text-sm">
                          Substitute
                        </Label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

MatchSquadSection.displayName = "MatchSquadSection"
