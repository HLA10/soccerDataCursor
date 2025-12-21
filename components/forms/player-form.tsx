"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"
import { PhotoUpload } from "@/components/ui/image-cropper"

interface PlayerFormProps {
  player?: any
  onSuccess?: () => void
}

export function PlayerForm({ player, onSuccess }: PlayerFormProps) {
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: player?.name || "",
    position: player?.position || "",
    jerseyNumber: player?.jerseyNumber?.toString() || "",
    dateOfBirth: player?.dateOfBirth
      ? new Date(player.dateOfBirth).toISOString().split("T")[0]
      : "",
    photo: player?.photo || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = player
        ? `/api/players/${player.id}`
        : "/api/players"
      const method = player ? "PUT" : "POST"

      // Include teamId when creating a new player (not when editing)
      const requestBody = player 
        ? formData 
        : { ...formData, teamId: selectedTeam?.id }

      console.log("Submitting player data, photo size:", formData.photo ? Math.round(formData.photo.length / 1024) + "KB" : "none")

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else if (player) {
            router.push(`/players/${player.id}`)
            router.refresh()
          } else {
            router.push("/players")
          }
        }, 500)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Failed to save player")
      }
    } catch (err: any) {
      console.error("Error saving player:", err)
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{player ? "Edit Player" : "Add Player"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
              Player saved successfully!
            </div>
          )}
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
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="jerseyNumber">Jersey Number</Label>
            <Input
              id="jerseyNumber"
              type="number"
              value={formData.jerseyNumber}
              onChange={(e) =>
                setFormData({ ...formData, jerseyNumber: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2">
              <PhotoUpload
                currentPhoto={formData.photo}
                onPhotoChange={(photo) => {
                  console.log("Photo changed, length:", photo?.length)
                  setFormData((prev) => ({ ...prev, photo }))
                }}
              />
              {formData.photo && (
                <p className="text-xs text-green-600 mt-1">Photo ready ({Math.round(formData.photo.length / 1024)}KB)</p>
              )}
            </div>
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

