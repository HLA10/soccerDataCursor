"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ACTIVATION_TYPES,
  ACTIVATION_TYPE_LABELS,
  EXERCISE_TYPES,
  EXERCISE_TYPE_LABELS,
  BALL_OPTIONS,
  CLASSIFICATION_LEVELS,
  CLASSIFICATION_LEVEL_LABELS,
  TRAINING_STYLES,
  TRAINING_STYLE_LABELS,
} from "@/lib/training-constants"
import { useTeam } from "@/contexts/team-context"

interface TemplatePart {
  partNumber: number
  partType?: string
  withBall?: boolean
  duration?: number
  classificationLevel?: string
  classificationStyle?: string
}

interface TemplateFormProps {
  template?: {
    id: string
    name: string
    description?: string
    parts: TemplatePart[]
  }
  onSuccess?: () => void
}

export function TemplateForm({ template, onSuccess }: TemplateFormProps) {
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")
  const [parts, setParts] = useState<TemplatePart[]>(
    template?.parts || [
      { partNumber: 1 },
      { partNumber: 2 },
      { partNumber: 3 },
      { partNumber: 4 },
    ]
  )

  const handlePartChange = (
    partNumber: number,
    field: keyof TemplatePart,
    value: any
  ) => {
    setParts((prev) =>
      prev.map((p) =>
        p.partNumber === partNumber ? { ...p, [field]: value } : p
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = template
        ? `/api/training-templates/${template.id}`
        : "/api/training-templates"
      const method = template ? "PUT" : "POST"

      // Filter out parts with no type selected
      const partsData = parts
        .filter((p) => p.partType)
        .map((p) => ({
          partNumber: p.partNumber,
          partType: p.partType,
          withBall: p.partNumber === 1 ? p.withBall : undefined,
          duration: p.duration || undefined,
          classificationLevel: p.classificationLevel || undefined,
          classificationStyle: p.classificationStyle || undefined,
        }))

      if (!selectedTeam?.id) {
        alert("No team selected. Please select a team from the sidebar dropdown.")
        setLoading(false)
        return
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          teamId: selectedTeam.id,
          parts: partsData,
        }),
      })

      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/training-templates")
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!selectedTeam?.id && (
        <div className="p-3 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200">
          Please select a team from the sidebar dropdown before creating a template.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Monday Technical Session"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this template"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Parts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {parts.map((part) => (
            <div key={part.partNumber} className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Part {part.partNumber}</h3>

              {part.partNumber === 1 ? (
                // Part 1: Activation
                <>
                  <div>
                    <Label>Activation Type</Label>
                    <select
                      value={part.partType || ""}
                      onChange={(e) =>
                        handlePartChange(part.partNumber, "partType", e.target.value || undefined)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select activation type...</option>
                      {ACTIVATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {ACTIVATION_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>With Ball</Label>
                    <select
                      value={part.withBall === undefined ? "" : part.withBall ? "true" : "false"}
                      onChange={(e) =>
                        handlePartChange(
                          part.partNumber,
                          "withBall",
                          e.target.value === "" ? undefined : e.target.value === "true"
                        )
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select...</option>
                      {BALL_OPTIONS.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                // Parts 2-4: Exercise types
                <>
                  <div>
                    <Label>Exercise Type</Label>
                    <select
                      value={part.partType || ""}
                      onChange={(e) =>
                        handlePartChange(part.partNumber, "partType", e.target.value || undefined)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select exercise type...</option>
                      {EXERCISE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {EXERCISE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={part.duration || ""}
                  onChange={(e) =>
                    handlePartChange(
                      part.partNumber,
                      "duration",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Duration in minutes"
                />
              </div>

              <div>
                <Label>Classification Level</Label>
                <select
                  value={part.classificationLevel || ""}
                  onChange={(e) =>
                    handlePartChange(
                      part.partNumber,
                      "classificationLevel",
                      e.target.value || undefined
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select level...</option>
                  {CLASSIFICATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {CLASSIFICATION_LEVEL_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Classification Style</Label>
                <select
                  value={part.classificationStyle || ""}
                  onChange={(e) =>
                    handlePartChange(
                      part.partNumber,
                      "classificationStyle",
                      e.target.value || undefined
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select style...</option>
                  {TRAINING_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {TRAINING_STYLE_LABELS[style]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  )
}


