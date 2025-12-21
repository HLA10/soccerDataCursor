"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCountryFlag } from "@/lib/country-flags"

interface CompetitionFormProps {
  competition?: any
  onSuccess?: () => void
}

export function CompetitionForm({ competition, onSuccess }: CompetitionFormProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: competition?.name || "",
    type: competition?.type || "FRIENDLY",
    customType: competition?.customType || "",
    season: competition?.season || new Date().getFullYear().toString(),
    startDate: competition?.startDate
      ? new Date(competition.startDate).toISOString().split("T")[0]
      : "",
    endDate: competition?.endDate
      ? new Date(competition.endDate).toISOString().split("T")[0]
      : "",
    description: competition?.description || "",
    logo: competition?.logo || "",
    location: competition?.location || "",
    teamId: competition?.teamId || "",
    teamIds: competition?.teams?.map((t: any) => t.teamId) || [],
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.type || !formData.season) {
      alert("Name, type, and season are required")
      setLoading(false)
      return
    }

    try {
      const url = competition
        ? `/api/competitions/${competition.id}`
        : "/api/competitions"
      const method = competition ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          teamId: formData.teamId || null,
          teamIds: formData.teamIds,
        }),
      })

      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/competitions")
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save competition")
      }
    } catch (error) {
      console.error("Error saving competition:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {competition ? "Edit Competition" : "Add Competition"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Competition Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="CUP">Cup</option>
                <option value="TOURNAMENT">Tournament</option>
                <option value="FRIENDLY">Friendly</option>
                <option value="MATCH_CAMP">Match Camp</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            {formData.type === "CUSTOM" && (
              <div>
                <Label htmlFor="customType">Custom Type Name *</Label>
                <Input
                  id="customType"
                  value={formData.customType}
                  onChange={(e) =>
                    setFormData({ ...formData, customType: e.target.value })
                  }
                  placeholder="e.g., Preseason Camp"
                  required={formData.type === "CUSTOM"}
                />
              </div>
            )}

            <div>
              <Label htmlFor="season">Season *</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                placeholder="2024-2025"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <div className="space-y-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => {
                  const location = e.target.value
                  const flag = getCountryFlag(location)
                  setFormData({
                    ...formData,
                    location: location,
                    logo: flag || "",
                  })
                }}
                placeholder="City, Country or Venue (e.g., Stockholm, Sweden)"
              />
              {formData.logo && (
                <div className="flex items-center space-x-2 p-3 border rounded bg-gray-50">
                  <span className="text-4xl">{formData.logo}</span>
                  <div>
                    <p className="text-sm font-medium">Country Flag</p>
                    <p className="text-xs text-gray-500">Automatically generated from location</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logo: "" })}
                    className="ml-auto"
                  >
                    Remove Flag
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a country name and the flag will be generated automatically
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Competition details, format, etc."
              rows={4}
            />
          </div>

          <div>
            <Label>Participating Teams (Optional)</Label>
            <p className="text-xs text-gray-500 mb-2">
              Select teams that participate in this competition
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
              {teams.map((team) => (
                <label
                  key={team.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.teamIds.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          teamIds: [...formData.teamIds, team.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          teamIds: formData.teamIds.filter((id: string) => id !== team.id),
                        })
                      }
                    }}
                    className="rounded flex-shrink-0"
                  />
                  {team.logo ? (
                    <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden bg-white rounded-full border-2 border-gray-300 shadow-sm" style={{ aspectRatio: "1/1" }}>
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain p-1"
                        style={{ objectFit: "contain" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-sm">
                      <span className="text-lg font-bold text-gray-700">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm flex-1">{team.name} {team.code && `(${team.code})`}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : competition ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

