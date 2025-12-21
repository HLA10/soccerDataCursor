"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotoUpload } from "@/components/ui/image-cropper"

export default function ClubLogosPage() {
  const { data: session } = useSession()
  const [clubLogo, setClubLogo] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    clubName: "Djugarden",
    logo: "",
  })
  const [saving, setSaving] = useState(false)

  const user = session?.user as any

  useEffect(() => {
    fetchClubLogo()
  }, [])

  const fetchClubLogo = async () => {
    try {
      setLoading(true)
      // Only fetch the Djugarden logo
      const res = await fetch("/api/club-logos")
      if (res.ok) {
        const data = await res.json()
        const djugardenLogo = data.find((cl: any) => 
          cl.clubName.toLowerCase() === "djugarden"
        )
        setClubLogo(djugardenLogo || null)
        if (djugardenLogo) {
          setFormData({ clubName: "Djugarden", logo: djugardenLogo.logo })
        }
      }
    } catch (error) {
      console.error("Error fetching club logo:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.logo) {
      alert("Please upload a logo")
      return
    }

    setSaving(true)
    try {
      // Always use POST with Djugarden - the API will upsert
      const res = await fetch("/api/club-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName: "Djugarden", logo: formData.logo }),
      })

      if (res.ok) {
        await fetchClubLogo()
        alert(clubLogo ? "Club logo updated successfully!" : "Club logo saved successfully!")
      } else {
        const error = await res.json()
        const errorMsg = error.details 
          ? `${error.error}\n\nDetails: ${error.details}`
          : error.error || "Failed to save club logo"
        alert(errorMsg)
        console.error("API Error:", error)
      }
    } catch (error) {
      console.error("Error saving club logo:", error)
      alert("Failed to save club logo")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!clubLogo) return
    if (!confirm("Are you sure you want to delete the club logo?")) return

    try {
      const res = await fetch(`/api/club-logos/${clubLogo.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setClubLogo(null)
        setFormData({ clubName: "Djugarden", logo: "" })
        alert("Club logo deleted successfully!")
      } else {
        alert("Failed to delete club logo")
      }
    } catch (error) {
      console.error("Error deleting club logo:", error)
      alert("Failed to delete club logo")
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your Club Logo</h1>
        <p className="text-xs text-muted-foreground">
          Upload your club logo (Djugarden). This logo will be automatically applied to all your teams.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Example: Teams like "Djugarden F2011-A", "Djugarden F2012-B" will all use this logo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{clubLogo ? "Update Club Logo" : "Upload Club Logo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clubName">Club Name</Label>
              <Input
                id="clubName"
                value={formData.clubName}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is your club name (Djugarden)
              </p>
            </div>

            <div>
              <Label>Club Logo *</Label>
              <div className="mt-2">
                <PhotoUpload
                  currentPhoto={formData.logo || clubLogo?.logo}
                  onPhotoChange={(logo) => setFormData({ ...formData, logo })}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : clubLogo ? "Update Logo" : "Save Logo"}
              </Button>
              {clubLogo && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Show existing logo if it exists */}
      {clubLogo && (
      <Card>
        <CardHeader>
            <CardTitle>Current Club Logo</CardTitle>
        </CardHeader>
        <CardContent>
                    <div className="flex items-center space-x-4">
                      {clubLogo.logo ? (
                        <img
                          src={clubLogo.logo}
                          alt={clubLogo.clubName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 bg-white"
                />
              ) : null}
              <div>
                <h3 className="font-semibold">{clubLogo.clubName}</h3>
                        <p className="text-xs text-muted-foreground">
                  This logo is applied to all your teams automatically
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
          )}
    </div>
  )
}

