"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PlayerContactsTabProps {
  playerId: string
}

export function PlayerContactsTab({ playerId }: PlayerContactsTabProps) {
  const { data: session } = useSession()
  const user = session?.user as any

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    motherName: "",
    motherEmail: "",
    motherPhone: "",
    fatherName: "",
    fatherEmail: "",
    fatherPhone: "",
    homeAddress: "",
    personalNumber: "",
    allergies: "",
    medicalNotes: "",
  })

  const canEdit =
    user &&
    (user.role === "ADMIN" || user.role === "COACH" || user.role === "SUPER_USER")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/players/${playerId}/contacts`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to load contacts")
        }
        const data = await res.json()
        setForm({
          motherName: data.motherName || "",
          motherEmail: data.motherEmail || "",
          motherPhone: data.motherPhone || "",
          fatherName: data.fatherName || "",
          fatherEmail: data.fatherEmail || "",
          fatherPhone: data.fatherPhone || "",
          homeAddress: data.homeAddress || "",
          personalNumber: data.personalNumber || "",
          allergies: data.allergies || "",
          medicalNotes: data.medicalNotes || "",
        })
      } catch (err: any) {
        console.error("Error loading player contacts:", err)
        setError(err.message || "Failed to load contacts")
      } finally {
        setLoading(false)
      }
    }

    if (playerId) {
      load()
    }
  }, [playerId])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/players/${playerId}/contacts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save contacts")
      }
      await res.json()
      alert("Contacts updated")
    } catch (err: any) {
      console.error("Error saving player contacts:", err)
      setError(err.message || "Failed to save contacts")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Loading contacts…</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parents & Emergency Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mother / Guardian</Label>
            <Input
              placeholder="Name"
              value={form.motherName}
              onChange={(e) => handleChange("motherName", e.target.value)}
              disabled={!canEdit}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.motherEmail}
              onChange={(e) => handleChange("motherEmail", e.target.value)}
              disabled={!canEdit}
            />
            <Input
              placeholder="Phone"
              value={form.motherPhone}
              onChange={(e) => handleChange("motherPhone", e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Father / Guardian</Label>
            <Input
              placeholder="Name"
              value={form.fatherName}
              onChange={(e) => handleChange("fatherName", e.target.value)}
              disabled={!canEdit}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.fatherEmail}
              onChange={(e) => handleChange("fatherEmail", e.target.value)}
              disabled={!canEdit}
            />
            <Input
              placeholder="Phone"
              value={form.fatherPhone}
              onChange={(e) => handleChange("fatherPhone", e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Home Address</Label>
            <Textarea
              rows={3}
              placeholder="Street, postal code, city"
              value={form.homeAddress}
              onChange={(e) => handleChange("homeAddress", e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Personal number</Label>
            <Input
              placeholder="Personnummer"
              value={form.personalNumber}
              onChange={(e) => handleChange("personalNumber", e.target.value)}
              disabled={!canEdit}
            />
            <Label>Allergies</Label>
            <Textarea
              rows={2}
              placeholder="Food allergies, medication, etc."
              value={form.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Medical notes</Label>
          <Textarea
            rows={3}
            placeholder="Important medical information for staff when travelling."
            value={form.medicalNotes}
            onChange={(e) => handleChange("medicalNotes", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save contacts"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}










