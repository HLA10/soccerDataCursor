"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { GameForm } from "@/components/forms/game-form"

export default function EditGamePage() {
  const params = useParams()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games/${params.id}`)
        const data = await res.json()
        setGame(data)
      } catch (error) {
        console.error("Error fetching game:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!game) {
    return <div className="text-center py-8">Game not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <GameForm game={game} />
    </div>
  )
}




