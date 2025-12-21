"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotoUpload } from "@/components/ui/image-cropper"

interface OpponentFormProps {
  opponent?: any
  onSuccess?: () => void
  returnTo?: string | null
}

export function OpponentForm({ opponent, onSuccess, returnTo }: OpponentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: opponent?.name || "",
    location: opponent?.location || "",
    homeField: opponent?.homeField || "",
    primaryColor: opponent?.primaryColor || "#000000",
    secondaryColor: opponent?.secondaryColor || "#FFFFFF",
    logo: opponent?.logo || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = opponent ? `/api/opponents/${opponent.id}` : "/api/opponents"
      const method = opponent ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (onSuccess) {
          onSuccess()
        } else {
          // If returnTo is provided, redirect there with opponentId (e.g., back to game creation)
          if (returnTo) {
            // Include the newly created opponent ID in the URL
            const separator = returnTo.includes('?') ? '&' : '?'
            router.push(`${returnTo}${separator}opponentId=${data.id}`)
          } else if (!opponent) {
          // If creating new opponent, redirect to detail page to add teams
            router.push(`/opponents/${data.id}`)
          } else {
            router.push("/opponents")
          }
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save opponent")
      }
    } catch (error) {
      console.error("Error saving opponent:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{opponent ? "Edit Opponent" : "Add Opponent"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label htmlFor="homeField">Home Field</Label>
            <Input
              id="homeField"
              value={formData.homeField}
              onChange={(e) => setFormData({ ...formData, homeField: e.target.value })}
              placeholder="Stadium name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Club Logo</Label>
            <div className="mt-2">
              <PhotoUpload
                currentPhoto={formData.logo}
                onPhotoChange={(logo) => setFormData({ ...formData, logo })}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : opponent ? "Update" : "Create"}
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

