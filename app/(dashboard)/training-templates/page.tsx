"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function TrainingTemplatesPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const user = session?.user as any

  useEffect(() => {
    fetchTemplates()
  }, [selectedTeam?.id])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const res = await fetch(`/api/training-templates?${params.toString()}`)
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(templateId: string) {
    if (!confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/training-templates/${templateId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      alert("An error occurred. Please try again.")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Session Templates</h1>
          <p className="text-muted-foreground">Create and manage reusable training session plans</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href="/training-templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </Link>
        )}
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No templates found</p>
            {(user?.role === "ADMIN" || user?.role === "COACH") && (
              <Link href="/training-templates/new">
                <Button>Create Your First Template</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  {(user?.role === "ADMIN" || user?.role === "COACH") && (
                    <div className="flex space-x-2">
                      <Link href={`/training-templates/${template.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {template.parts?.length || 0} parts configured
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created by {template.author?.name || template.author?.email || "Unknown"} on{" "}
                    {format(new Date(template.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}









