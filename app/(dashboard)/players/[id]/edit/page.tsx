"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PlayerForm } from "@/components/forms/player-form"

export default function EditPlayerPage() {
  const params = useParams()
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/players/${params.id}`)
        const data = await res.json()
        setPlayer(data)
      } catch (error) {
        console.error("Error fetching player:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!player) {
    return <div className="text-center py-8">Player not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PlayerForm player={player} />
    </div>
  )
}

