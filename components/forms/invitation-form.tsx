"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"

interface InvitationFormProps {
  onSuccess?: () => void
}

const INVITABLE_ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "COACH", label: "Coach" },
  { value: "VIEWER", label: "Viewer" },
]

export function InvitationForm({ onSuccess }: InvitationFormProps) {
  const { teams } = useTeam()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    role: "COACH",
    teamId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          teamId: formData.teamId || null,
        }),
      })

      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        }
        // Reset form
        setFormData({
          email: "",
          role: "COACH",
          teamId: "",
        })
        alert("Invitation sent successfully!")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Invitation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {INVITABLE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="teamId">Team (Optional)</Label>
            <select
              id="teamId"
              value={formData.teamId}
              onChange={(e) =>
                setFormData({ ...formData, teamId: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No specific team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.code && `(${team.code})`}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

