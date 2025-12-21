"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"

interface StaffFormProps {
  staff?: any
  onSuccess?: () => void
}

const STAFF_POSITIONS = [
  "Head Coach",
  "Assistant Coach",
  "Physio",
  "Strength Coach",
  "Goalkeeper Coach",
  "Analyst",
  "Team Manager",
  "Equipment Manager",
  "Other"
]

export function StaffForm({ staff, onSuccess }: StaffFormProps) {
  const router = useRouter()
  const { teams } = useTeam()
  const [loading, setLoading] = useState(false)
  const [teamSearch, setTeamSearch] = useState("")
  
  // Initialize selectedTeamIds from staff.teams
  const getInitialTeamIds = () => {
    if (!staff?.teams) return []
    return staff.teams.map((t: any) => t.teamId || t.team?.id).filter(Boolean)
  }
  
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(getInitialTeamIds())
  const [formData, setFormData] = useState({
    name: staff?.name || "",
    position: staff?.position || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    photo: staff?.photo || "",
  })

  // Update selectedTeamIds when staff prop changes (for editing)
  useEffect(() => {
    if (staff?.teams) {
      const teamIds = staff.teams.map((t: any) => t.teamId || t.team?.id).filter(Boolean)
      setSelectedTeamIds(teamIds)
    }
  }, [staff])

  // Filter teams based on search
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.code?.toLowerCase().includes(teamSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = staff
        ? `/api/staff/${staff.id}`
        : "/api/staff"
      const method = staff ? "PUT" : "POST"

      const requestBody = {
        ...formData,
        teamIds: selectedTeamIds,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        const data = await res.json()
        if (onSuccess) {
          onSuccess()
        } else if (staff) {
          // When editing, go back to staff list
          router.push("/staff")
        } else {
          // When creating, redirect to the new staff profile page
          router.push(`/staff/${data.id}`)
        }
      } else {
        const error = await res.json()
        console.error("Staff creation error:", error)
        alert(error.error || "Failed to save staff")
      }
    } catch (error) {
      console.error("Error saving staff:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staff ? "Edit Staff" : "Add Staff"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="position">Position *</Label>
            <select
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select position...</option>
              {STAFF_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              type="url"
              value={formData.photo}
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.value })
              }
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div>
            <Label htmlFor="teamSearch">Assign to Team(s)</Label>
            <Input
              id="teamSearch"
              placeholder="Search for a team..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="mb-2"
            />
            {teamSearch && filteredTeams.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto bg-white">
                {filteredTeams.map((team) => {
                  const isSelected = selectedTeamIds.includes(team.id)
                  return (
                    <div
                      key={team.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTeamIds(
                            selectedTeamIds.filter((id) => id !== team.id)
                          )
                        } else {
                          setSelectedTeamIds([...selectedTeamIds, team.id])
                        }
                        setTeamSearch("")
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {team.name}
                        </span>
                        {team.code && (
                          <span className="text-xs text-gray-500">
                            {team.code}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-xs text-blue-600">✓</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedTeamIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTeamIds.map((teamId) => {
                  const team = teams.find((t) => t.id === teamId)
                  return team ? (
                    <span
                      key={teamId}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                    >
                      {team.name}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeamIds(
                            selectedTeamIds.filter((id) => id !== teamId)
                          )
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null
                })}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

