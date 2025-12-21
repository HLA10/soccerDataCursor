"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PdfViewer } from "@/components/training/pdf-viewer"
import { PartsRegistrationForm } from "@/components/training/parts-registration-form"
import {
  ACTIVATION_TYPE_LABELS,
  EXERCISE_TYPE_LABELS,
  CLASSIFICATION_LEVEL_LABELS,
  TRAINING_STYLE_LABELS,
} from "@/lib/training-constants"
import { Upload } from "lucide-react"

interface SessionPlanSectionProps {
  trainingId: string
  training: any
  canEdit: boolean
  onUpdate?: () => void
}

export function SessionPlanSection({
  trainingId,
  training,
  canEdit,
  onUpdate,
}: SessionPlanSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !canEdit) return

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/trainings/${trainingId}/upload-session-plan`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        if (onUpdate) onUpdate()
        alert("PDF uploaded successfully")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to upload PDF")
      }
    } catch (error) {
      console.error("Error uploading PDF:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  async function handleDeletePdf() {
    if (!canEdit || !confirm("Are you sure you want to delete this PDF?")) return

    try {
      setDeleting(true)
      const res = await fetch(`/api/trainings/${trainingId}/upload-session-plan`, {
        method: "DELETE",
      })

      if (res.ok) {
        if (onUpdate) onUpdate()
        alert("PDF deleted successfully")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete PDF")
      }
    } catch (error) {
      console.error("Error deleting PDF:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Session Plan PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {training.sessionPlanPdf ? (
            <div className="space-y-4">
              <PdfViewer
                filePath={training.sessionPlanPdf}
                fileName="Session Plan"
                onDelete={canEdit ? handleDeletePdf : undefined}
                canDelete={canEdit && !deleting}
              />
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">No PDF uploaded</p>
              {canEdit && (
                <div>
                  <Label
                    htmlFor="pdf-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload PDF"}
                  </Label>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts Registration Section */}
      <PartsRegistrationForm
        trainingId={trainingId}
        initialParts={training.parts || []}
        canEdit={canEdit}
        onUpdate={onUpdate}
      />
    </div>
  )
}

