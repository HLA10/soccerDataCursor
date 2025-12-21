"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTeam } from "@/contexts/team-context"
import {
  ACTIVATION_TYPE_LABELS,
  EXERCISE_TYPE_LABELS,
  CLASSIFICATION_LEVEL_LABELS,
  TRAINING_STYLE_LABELS,
} from "@/lib/training-constants"
import Link from "next/link"

interface TrainingFormProps {
  training?: any
  onSuccess?: () => void
}

export function TrainingForm({ training, onSuccess }: TrainingFormProps) {
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(training?.templateId || "")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    date: training?.date ? new Date(training.date).toISOString().split('T')[0] : "",
    startTime: training?.startTime || "",
    endTime: training?.endTime || "",
    duration: training?.duration?.toString() || "",
    location: training?.location || "",
    field: training?.field || "",
    gathering: training?.gathering || "",
    notes: training?.notes || "",
  })
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "biweekly">("weekly")
  const [recurringCount, setRecurringCount] = useState(10)
  const [recurringDay, setRecurringDay] = useState(1) // 0=Sun, 1=Mon, etc.

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const params = new URLSearchParams()
        if (selectedTeam?.id) params.append("teamId", selectedTeam.id)
        const res = await fetch(`/api/training-templates?${params.toString()}`)
        if (!res.ok) {
          console.error("Failed to fetch templates:", res.status, res.statusText)
          return
        }
        const data = await res.json()
        setTemplates(data || [])
      } catch (error) {
        console.error("Error fetching templates:", error)
        // Set empty array on error so form still works
        setTemplates([])
      }
    }
    fetchTemplates()
  }, [selectedTeam])

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId)
      setSelectedTemplate(template || null)
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId, templates])

  useEffect(() => {
    if (training?.template) {
      setSelectedTemplate(training.template)
      setSelectedTemplateId(training.templateId || "")
    }
  }, [training])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedTeam?.id) {
        alert("No team selected. Please select a team from the sidebar dropdown.")
        setLoading(false)
        return
      }

      const url = training ? `/api/trainings/${training.id}` : "/api/trainings"
      const method = training ? "PUT" : "POST"

      const requestBody: any = {
        ...formData,
        teamId: selectedTeam.id,
        templateId: selectedTemplateId || null,
      }

      // Add recurring config if enabled (only for new trainings)
      if (!training && isRecurring) {
        requestBody.recurring = {
          frequency: recurringFrequency,
          count: recurringCount,
          dayOfWeek: recurringDay,
        }
      }

      console.log("Submitting training:", requestBody)

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseData = await res.json()

      if (res.ok) {
        console.log("Training saved successfully:", responseData)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(training ? `/trainings/bank/${training.id}` : "/trainings/bank")
        }
      } else {
        console.error("Error response:", responseData)
        alert(responseData.error || "Failed to save training")
      }
    } catch (error: any) {
      console.error("Error saving training:", error)
      alert(error.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{training ? "Edit Training Session" : "New Training Session"}</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedTeam?.id && (
          <div className="mb-4 p-3 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200">
            Please select a team from the sidebar dropdown before creating a training session.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="90"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Training field, gym, etc."
              />
            </div>
            <div>
              <Label htmlFor="field">Field</Label>
              <Input
                id="field"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                placeholder="Field 1, Field A, etc."
              />
            </div>
            <div>
              <Label htmlFor="gathering">Gathering Location</Label>
              <Input
                id="gathering"
                value={formData.gathering}
                onChange={(e) => setFormData({ ...formData, gathering: e.target.value })}
                placeholder="Where players meet before training"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Training focus, drills, etc."
              rows={3}
            />
          </div>

          {/* Recurring Options - Only show for new trainings */}
          {!training && (
            <div className="border-t pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="recurring" className="text-base font-semibold cursor-pointer">
                  Recurring Training
                </Label>
              </div>
              
              {isRecurring && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <Label htmlFor="recurringDay">Day of Week</Label>
                    <select
                      id="recurringDay"
                      value={recurringDay}
                      onChange={(e) => setRecurringDay(parseInt(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                      <option value={0}>Sunday</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Repeat Every</Label>
                    <select
                      id="frequency"
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as "weekly" | "biweekly")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="weekly">Week</option>
                      <option value="biweekly">2 Weeks</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="count">Number of Sessions</Label>
                    <Input
                      id="count"
                      type="number"
                      min="2"
                      max="52"
                      value={recurringCount}
                      onChange={(e) => setRecurringCount(parseInt(e.target.value) || 2)}
                    />
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    This will create {recurringCount} training sessions every {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][recurringDay]}{recurringFrequency === "biweekly" ? " (every 2 weeks)" : ""}, starting from {formData.date || "the selected date"}.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Session Plan Template</Label>
              <Link href="/training-templates/new" className="text-sm text-primary hover:underline">
                Create New Template
              </Link>
            </div>
            <div>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">No template (create basic training)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2">{selectedTemplate.name}</h4>
                  {selectedTemplate.description && (
                    <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.description}</p>
                  )}
                  <div className="space-y-2">
                    {selectedTemplate.parts?.map((part: any) => (
                      <div key={part.partNumber} className="text-sm">
                        <span className="font-medium">Part {part.partNumber}:</span>{" "}
                        {part.partNumber === 1
                          ? ACTIVATION_TYPE_LABELS[part.partType] || part.partType
                          : EXERCISE_TYPE_LABELS[part.partType] || part.partType}
                        {part.duration && ` (${part.duration} min)`}
                        {part.classificationLevel && ` - ${CLASSIFICATION_LEVEL_LABELS[part.classificationLevel]}`}
                        {part.classificationStyle && ` - ${TRAINING_STYLE_LABELS[part.classificationStyle]}`}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Template parts will be automatically added to this training session
                  </p>
                </div>
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

