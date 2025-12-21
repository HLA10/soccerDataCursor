"use client"

import { TemplateForm } from "@/components/training/template-form"

export default function NewTemplatePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Training Template</h1>
        <p className="text-muted-foreground">Create a reusable training session plan template</p>
      </div>
      <TemplateForm />
    </div>
  )
}









