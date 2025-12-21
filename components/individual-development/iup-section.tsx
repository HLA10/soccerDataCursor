"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { IUP_WHAT_OPTIONS, IUP_HOW_OPTIONS, IUP_DURATION_OPTIONS, MAX_WHAT_SELECTIONS, getHowForWhat } from "@/lib/iup-constants"
import { format } from "date-fns"

interface IUPSectionProps {
  playerId: string
  canEdit?: boolean
}

interface IUPData {
  id?: string
  whats: string[]
  hows: string[]
  followUp?: string | null
  status?: string
  startDate?: string
  endDate?: string | null
  durationDays?: number | null
  completedAt?: string | null
  extendedAt?: string | null
  author?: {
    name?: string | null
    email?: string
  }
}

export function IUPSection({ playerId, canEdit = false }: IUPSectionProps) {
  const [iup, setIup] = useState<IUPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [whats, setWhats] = useState<string[]>([])
  const [hows, setHows] = useState<string[]>([])
  const [followUp, setFollowUp] = useState("")
  const [durationDays, setDurationDays] = useState<number>(60)

  useEffect(() => {
    fetchIUP()
  }, [playerId])

  const fetchIUP = async () => {
    try {
      const res = await fetch(`/api/players/${playerId}/iup`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setIup(data)
          setWhats(data.whats || [])
          setHows(data.hows || [])
          setFollowUp(data.followUp || "")
          setDurationDays(data.durationDays || 60)
        }
      }
    } catch (error) {
      console.error("Error fetching IUP:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatChange = (index: number, value: string) => {
    const newWhats = [...whats]
    if (value === "") {
      // Remove this what and its corresponding how
      newWhats.splice(index, 1)
      const newHows = [...hows]
      newHows.splice(index, 1)
      setHows(newHows)
    } else {
      newWhats[index] = value
      // Auto-set the corresponding how
      const whatIndex = IUP_WHAT_OPTIONS.indexOf(value)
      const newHows = [...hows]
      newHows[index] = IUP_HOW_OPTIONS[whatIndex]
      setHows(newHows)
    }
    setWhats(newWhats)
  }

  const handleHowChange = (index: number, value: string) => {
    const newHows = [...hows]
    newHows[index] = value
    setHows(newHows)
  }

  const handleAddWhat = () => {
    if (whats.length < MAX_WHAT_SELECTIONS) {
      setWhats([...whats, ""])
      setHows([...hows, ""])
    }
  }

  const handleRemoveWhat = (index: number) => {
    const newWhats = whats.filter((_, i) => i !== index)
    const newHows = hows.filter((_, i) => i !== index)
    setWhats(newWhats)
    setHows(newHows)
  }

  const handleSave = async () => {
    if (whats.length === 0) {
      alert("Please select at least one area to improve")
      return
    }

    if (whats.length !== hows.length) {
      alert("Each 'What' must have a corresponding 'How'")
      return
    }

    setSaving(true)
    try {
      const method = iup?.id ? "PUT" : "POST"
      const res = await fetch(`/api/players/${playerId}/iup`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whats,
          hows,
          followUp: followUp || null,
          durationDays,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setIup(data)
        setShowForm(false)
        alert(iup?.id ? "IUP updated successfully" : "IUP created successfully")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save IUP")
      }
    } catch (error) {
      console.error("Error saving IUP:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!confirm("Mark this IUP as completed? The player has improved in these areas.")) {
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/players/${playerId}/iup/complete`, {
        method: "PATCH",
      })

      if (res.ok) {
        const data = await res.json()
        setIup(data)
        alert("IUP marked as completed")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to complete IUP")
      }
    } catch (error) {
      console.error("Error completing IUP:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleExtend = async () => {
    if (!confirm("Extend this IUP? A new plan will be created based on the current one.")) {
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/players/${playerId}/iup/extend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whats,
          hows,
          followUp: followUp || null,
          durationDays,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setIup(data)
        setShowForm(false)
        alert("IUP extended successfully")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to extend IUP")
      }
    } catch (error) {
      console.error("Error extending IUP:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-600 text-white">Completed</Badge>
      case "EXTENDED":
        return <Badge className="bg-yellow-600 text-white">Extended</Badge>
      default:
        return <Badge className="bg-blue-600 text-white">Active</Badge>
    }
  }

  const getDaysRemaining = () => {
    if (!iup?.endDate) return null
    const end = new Date(iup.endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return <div className="text-center py-8">Loading IUP...</div>
  }

  const isActive = iup?.status === "ACTIVE"
  const daysRemaining = getDaysRemaining()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Individual Development Plan (IUP)</CardTitle>
          {canEdit && (
            <div className="flex space-x-2">
              {iup && isActive && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleComplete}
                    disabled={saving}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                  >
                    ✓ Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExtend}
                    disabled={saving}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                  >
                    ↻ Extend Plan
                  </Button>
                </>
              )}
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : iup ? "Edit" : "Create IUP"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && canEdit ? (
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* What/How Sections */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Areas to Improve (What)</Label>
              {whats.map((what, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Area {index + 1}</Label>
                    {whats.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveWhat(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`what-${index}`}>What needs improvement? *</Label>
                    <select
                      id={`what-${index}`}
                      value={what}
                      onChange={(e) => handleWhatChange(index, e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select area...</option>
                      {IUP_WHAT_OPTIONS.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  {what && (
                    <div>
                      <Label htmlFor={`how-${index}`}>How to improve? *</Label>
                      <select
                        id={`how-${index}`}
                        value={hows[index] || ""}
                        onChange={(e) => handleHowChange(index, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select method...</option>
                        {IUP_HOW_OPTIONS.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {hows[index] && (
                        <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                          {hows[index]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {whats.length < MAX_WHAT_SELECTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddWhat}
                >
                  + Add Another Area
                </Button>
              )}
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (days) *</Label>
              <select
                id="duration"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {IUP_DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up Comment */}
            <div>
              <Label htmlFor="followUp">Follow-up Comment</Label>
              <Textarea
                id="followUp"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Additional notes or comments..."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : iup?.id ? "Update IUP" : "Create IUP"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  if (iup) {
                    setWhats(iup.whats || [])
                    setHows(iup.hows || [])
                    setFollowUp(iup.followUp || "")
                    setDurationDays(iup.durationDays || 60)
                  } else {
                    setWhats([])
                    setHows([])
                    setFollowUp("")
                    setDurationDays(60)
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : iup ? (
          <div className="space-y-4">
            {/* Status and Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusBadge(iup.status)}
                {iup.author && (
                  <span className="text-sm text-gray-600">
                    Created by {iup.author.name || iup.author.email}
                  </span>
                )}
              </div>
              {iup.startDate && (
                <span className="text-sm text-gray-600">
                  Started: {format(new Date(iup.startDate), "MMM d, yyyy")}
                </span>
              )}
            </div>

            {/* Duration Progress */}
            {isActive && daysRemaining !== null && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Duration completed"}
                  </span>
                </div>
                {iup.durationDays && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((iup.durationDays - daysRemaining) / iup.durationDays) * 100))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* What/How Display */}
            <div className="space-y-4">
              {iup.whats.map((what, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-2">
                    Area {index + 1}: {what}
                  </div>
                  {iup.hows[index] && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">
                      <span className="font-medium">How: </span>
                      {iup.hows[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Follow-up Comment */}
            {iup.followUp && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="font-semibold mb-2 block">Follow-up Comment</Label>
                <p className="text-sm whitespace-pre-wrap">{iup.followUp}</p>
              </div>
            )}

            {/* Completion/Extension Info */}
            {iup.completedAt && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Completed on {format(new Date(iup.completedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            )}
            {iup.extendedAt && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ↻ Extended on {format(new Date(iup.extendedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No IUP created yet</p>
            {canEdit && (
              <Button onClick={() => setShowForm(true)}>Create IUP</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}











