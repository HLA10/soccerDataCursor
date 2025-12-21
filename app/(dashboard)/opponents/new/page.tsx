"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { OpponentForm } from "@/components/forms/opponent-form"

function NewOpponentContent() {
  const searchParams = useSearchParams()
  const returnTo = searchParams?.get("returnTo") || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Opponent</h1>
        <p className="text-muted-foreground">Create a new opponent club or team</p>
      </div>
      <OpponentForm returnTo={returnTo} />
    </div>
  )
}

export default function NewOpponentPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <NewOpponentContent />
    </Suspense>
  )
}


