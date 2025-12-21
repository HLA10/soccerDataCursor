"use client"

import { CompetitionForm } from "@/components/forms/competition-form"

export default function NewCompetitionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Competition</h1>
        <p className="text-muted-foreground">
          Create a new cup, tournament, friendly game, or match camp
        </p>
      </div>
      <CompetitionForm />
    </div>
  )
}



