"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface Part {
  partNumber: number
  partType?: string
  withBall?: boolean
  duration?: number
  classificationLevel?: string
  classificationStyle?: string
}

interface PartsRegistrationFormProps {
  trainingId: string
  initialParts?: Part[]
  canEdit: boolean
  onUpdate?: () => void
}

export function PartsRegistrationForm({
  trainingId,
  initialParts = [],
  canEdit,
  onUpdate,
}: PartsRegistrationFormProps) {
  const [parts, setParts] = useState<Part[]>(
    initialParts.length > 0
      ? initialParts
      : [
          { partNumber: 1 },
          { partNumber: 2 },
          { partNumber: 3 },
          { partNumber: 4 },
        ]
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialParts.length > 0) {
      const defaultParts = [
        { partNumber: 1 },
        { partNumber: 2 },
        { partNumber: 3 },
        { partNumber: 4 },
      ]
      const merged = defaultParts.map((defaultPart) => {
        const loaded = initialParts.find((p) => p.partNumber === defaultPart.partNumber)
        return loaded || defaultPart
      })
      setParts(merged)
    }
  }, [initialParts])

  const handlePartChange = (
    partNumber: number,
    field: keyof Part,
    value: any
  ) => {
    setParts((prev) =>
      prev.map((p) =>
        p.partNumber === partNumber ? { ...p, [field]: value } : p
      )
    )
  }

  async function handleSave() {
    if (!canEdit) return

    try {
      setSaving(true)
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

      const res = await fetch(`/api/trainings/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: partsData,
        }),
      })

      if (res.ok) {
        if (onUpdate) onUpdate()
        alert("Parts saved successfully!")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save parts")
      }
    } catch (error) {
      console.error("Error saving parts:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Register Session Parts</CardTitle>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Parts"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {parts.map((part) => (
          <div key={part.partNumber} className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Part {part.partNumber}</h4>

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
                    disabled={!canEdit}
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
                    disabled={!canEdit}
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
              <div>
                <Label>Exercise Type</Label>
                <select
                  value={part.partType || ""}
                  onChange={(e) =>
                    handlePartChange(part.partNumber, "partType", e.target.value || undefined)
                  }
                  disabled={!canEdit}
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
                disabled={!canEdit}
                placeholder="Duration in minutes"
              />
            </div>

            <div>
              <Label>Classification Level</Label>
              <select
                value={part.classificationLevel || ""}
                onChange={(e) =>
                  handlePartChange(part.partNumber, "classificationLevel", e.target.value || undefined)
                }
                disabled={!canEdit}
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
                  handlePartChange(part.partNumber, "classificationStyle", e.target.value || undefined)
                }
                disabled={!canEdit}
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
  )
}









