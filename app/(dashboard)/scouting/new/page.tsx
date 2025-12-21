"use client"

import { ScoutedPlayerForm } from "@/components/forms/scouted-player-form"

export default function NewScoutedPlayerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Scouted Player</h1>
        <p className="text-muted-foreground">Track a talented player from an opposing team</p>
      </div>
      <ScoutedPlayerForm />
    </div>
  )
}



