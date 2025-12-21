"use client"

import { TrainingForm } from "@/components/forms/training-form"

export default function NewTrainingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Training Session</h1>
        <p className="text-muted-foreground">Create a new training session with optional template</p>
      </div>
      <TrainingForm />
    </div>
  )
}





