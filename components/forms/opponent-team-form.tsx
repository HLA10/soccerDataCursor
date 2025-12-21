"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OpponentTeamFormProps {
  opponentId: string
  team?: any
  onSuccess: () => void
  onCancel?: () => void
}

export function OpponentTeamForm({
  opponentId,
  team,
  onSuccess,
  onCancel,
}: OpponentTeamFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: team?.name || "",
    gender: team?.gender || "MALE",
    age: team?.age || "",
    teamColor: team?.teamColor || "#000000",
    homeField: team?.homeField || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = team
        ? `/api/opponents/${opponentId}/teams/${team.id}`
        : `/api/opponents/${opponentId}/teams`
      const method = team ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
        if (!team) {
          // Reset form for new team
          setFormData({
            name: "",
            gender: "MALE",
            age: "",
            teamColor: "#000000",
            homeField: "",
          })
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save team")
      }
    } catch (error) {
      console.error("Error saving team:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team ? "Edit Team" : "Add Team"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., U15, U17, Senior, First Team"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            <div>
              <Label htmlFor="age">Age Group</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g., U15, U17, 2008, Senior"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teamColor">Team Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="teamColor"
                type="color"
                value={formData.teamColor}
                onChange={(e) =>
                  setFormData({ ...formData, teamColor: e.target.value })
                }
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.teamColor}
                onChange={(e) =>
                  setFormData({ ...formData, teamColor: e.target.value })
                }
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="homeField">Home Field</Label>
            <Input
              id="homeField"
              value={formData.homeField}
              onChange={(e) =>
                setFormData({ ...formData, homeField: e.target.value })
              }
              placeholder="Stadium name or field number"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : team ? "Update" : "Create Team"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            {!team && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: "",
                    gender: "MALE",
                    age: "",
                    teamColor: "#000000",
                    homeField: "",
                  })
                }}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}



