"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TemplateForm } from "@/components/training/template-form"

export default function EditTemplatePage() {
  const params = useParams()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/training-templates/${params.id}`)
        const data = await res.json()
        setTemplate(data)
      } catch (error) {
        console.error("Error fetching template:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!template) {
    return <div className="text-center py-8">Template not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Training Template</h1>
        <p className="text-muted-foreground">Update your training session plan template</p>
      </div>
      <TemplateForm template={template} />
    </div>
  )
}









