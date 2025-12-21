import { Suspense } from "react"
import { GameForm } from "@/components/forms/game-form"

function NewGameContent() {
  return (
    <div className="max-w-2xl mx-auto">
      <GameForm />
    </div>
  )
}

export default function NewGamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewGameContent />
    </Suspense>
  )
}
