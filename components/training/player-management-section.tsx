"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTeam } from "@/contexts/team-context"
import PlayerSearch from "@/components/players/player-search"
import Link from "next/link"
import { X } from "lucide-react"

interface PlayerManagementSectionProps {
  trainingId: string
  canEdit: boolean
  onUpdate?: () => void
}

export function PlayerManagementSection({
  trainingId,
  canEdit,
  onUpdate,
}: PlayerManagementSectionProps) {
  const { selectedTeam } = useTeam()
  const [players, setPlayers] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [trainingId, selectedTeam?.id])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const [playersRes, trainingRes] = await Promise.all([
        fetch(`/api/players?${params.toString()}&includeBorrowed=true`),
        fetch(`/api/trainings/${trainingId}`),
      ])

      const playersData = await playersRes.json()
      const trainingData = await trainingRes.json()

      setPlayers(playersData)
      setAttendance(trainingData.attendance || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddPlayer(playerId: string) {
    if (!canEdit) return

    try {
      setSaving(true)
      const res = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: [
            ...attendance.map((a) => ({
              playerId: a.playerId,
              attended: a.attended,
              absenceReason: a.absenceReason,
              absenceComment: a.absenceComment,
            })),
            {
              playerId,
              attended: true,
            },
          ],
        }),
      })

      if (res.ok) {
        await fetchData()
        if (onUpdate) onUpdate()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to add player")
      }
    } catch (error) {
      console.error("Error adding player:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemovePlayer(playerId: string) {
    if (!canEdit) return

    try {
      setSaving(true)
      const res = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: attendance
            .filter((a) => a.playerId !== playerId)
            .map((a) => ({
              playerId: a.playerId,
              attended: a.attended,
              absenceReason: a.absenceReason,
              absenceComment: a.absenceComment,
            })),
        }),
      })

      if (res.ok) {
        await fetchData()
        if (onUpdate) onUpdate()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to remove player")
      }
    } catch (error) {
      console.error("Error removing player:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAttendanceChange(playerId: string, attended: boolean) {
    if (!canEdit) return

    try {
      setSaving(true)
      const updatedAttendance = attendance.map((a) =>
        a.playerId === playerId
          ? {
              ...a,
              attended,
              absenceReason: attended ? null : a.absenceReason,
              absenceComment: attended ? null : a.absenceComment,
            }
          : a
      )

      const res = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: updatedAttendance.map((a) => ({
            playerId: a.playerId,
            attended: a.attended,
            absenceReason: a.absenceReason,
            absenceComment: a.absenceComment,
          })),
        }),
      })

      if (res.ok) {
        await fetchData()
        if (onUpdate) onUpdate()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update attendance")
      }
    } catch (error) {
      console.error("Error updating attendance:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAbsenceReasonChange(playerId: string, reason: string) {
    if (!canEdit) return

    try {
      setSaving(true)
      const updatedAttendance = attendance.map((a) =>
        a.playerId === playerId
          ? {
              ...a,
              absenceReason: reason || null,
            }
          : a
      )

      const res = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: updatedAttendance.map((a) => ({
            playerId: a.playerId,
            attended: a.attended,
            absenceReason: a.absenceReason,
            absenceComment: a.absenceComment,
          })),
        }),
      })

      if (res.ok) {
        await fetchData()
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Error updating absence reason:", error)
    } finally {
      setSaving(false)
    }
  }

  const availablePlayers = players.filter(
    (p) => !attendance.some((a) => a.playerId === p.id)
  )

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Add Players</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerSearch
              roster={availablePlayers.map((p) => ({
                id: p.id,
                name: p.name,
                jerseyNumber: p.jerseyNumber,
                position: p.position,
              }))}
              label="Search players to add"
              onSelect={(player) => handleAddPlayer(player.id)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Players ({attendance.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No players added yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead>Absence Reason</TableHead>
                  {canEdit && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((att) => {
                  const player = players.find((p) => p.id === att.playerId)
                  if (!player) return null

                  return (
                    <TableRow key={att.id}>
                      <TableCell>
                        <Link
                          href={`/players/${player.id}`}
                          className="hover:underline text-primary font-medium"
                        >
                          {player.name}
                        </Link>
                        {player.isInjured && (
                          <span className="ml-2 text-xs text-red-600">(Injured)</span>
                        )}
                        {player.isSick && (
                          <span className="ml-2 text-xs text-yellow-600">(Sick)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {canEdit ? (
                          <Checkbox
                            checked={att.attended}
                            onCheckedChange={(checked) =>
                              handleAttendanceChange(att.playerId, checked === true)
                            }
                            disabled={saving}
                          />
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              att.attended
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {att.attended ? "Yes" : "No"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!att.attended && canEdit ? (
                          <select
                            value={att.absenceReason || ""}
                            onChange={(e) =>
                              handleAbsenceReasonChange(att.playerId, e.target.value)
                            }
                            disabled={saving}
                            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            <option value="">Select reason...</option>
                            <option value="INJURED">Injured</option>
                            <option value="SICK">Sick</option>
                            <option value="UNEXCUSED">Unexcused</option>
                            <option value="OTHER">Other</option>
                          </select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {att.absenceReason || "-"}
                          </span>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlayer(att.playerId)}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}









