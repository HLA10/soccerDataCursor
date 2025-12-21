"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"

export default function StaffProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { teams } = useTeam()
  const [staff, setStaff] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [savingTeams, setSavingTeams] = useState(false)

  const user = session?.user as any
  const canEdit = user?.role === "ADMIN" || user?.role === "COACH"

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(`/api/staff/${params.id}`)
        const data = await res.json()
        setStaff(data)
        // Load current team assignments
        if (data.teams) {
          setSelectedTeamIds(data.teams.map((ts: any) => ts.teamId || ts.team?.id))
        }
      } catch (error) {
        console.error("Error fetching staff:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [params.id])

  const handleSaveTeams = async () => {
    setSavingTeams(true)
    try {
      const res = await fetch(`/api/staff/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamIds: selectedTeamIds,
        }),
      })

      if (res.ok) {
        const updatedStaff = await res.json()
        setStaff(updatedStaff)
        // Update selected team IDs to match the response
        if (updatedStaff.teams) {
          setSelectedTeamIds(updatedStaff.teams.map((ts: any) => ts.teamId || ts.team?.id))
        }
        alert("Teams updated successfully!")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update teams")
      }
    } catch (error) {
      console.error("Error updating teams:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSavingTeams(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!staff) {
    return <div className="text-center py-8">Staff not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        {canEdit && (
          <Button onClick={() => router.push(`/staff/${params.id}/edit`)}>
            Edit Staff
          </Button>
        )}
      </div>

      <Card className="border-2 border-black shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {staff.photo ? (
              <img
                src={staff.photo}
                alt={staff.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center border-4 border-gray-200 shadow-md">
                <span className="text-5xl font-bold text-white">
                  {staff.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{staff.name}</h1>
              <div className="flex items-center space-x-3 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {staff.position}
                </Badge>
              </div>

              <div className="space-y-2">
                {staff.email && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {staff.email}
                  </p>
                )}
                {staff.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {staff.phone}
                  </p>
                )}
                {staff.teams && staff.teams.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Teams:</p>
                    <div className="flex flex-wrap gap-2">
                      {staff.teams.map((teamStaff: any) => {
                        const team = teamStaff.team || teamStaff
                        return (
                          <Badge key={team.id || teamStaff.teamId} variant="outline">
                            {team.name} {team.code && `(${team.code})`}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No teams available. Please create a team first.
                </p>
              ) : (
                <>
                  <div className="space-y-2 border rounded-md p-4">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={selectedTeamIds.includes(team.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTeamIds([...selectedTeamIds, team.id])
                            } else {
                              setSelectedTeamIds(
                                selectedTeamIds.filter((id) => id !== team.id)
                              )
                            }
                          }}
                        />
                        <Label
                          htmlFor={`team-${team.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {team.name} {team.code && `(${team.code})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleSaveTeams}
                    disabled={savingTeams}
                    className="w-full sm:w-auto"
                  >
                    {savingTeams ? "Saving..." : "Save Teams"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


