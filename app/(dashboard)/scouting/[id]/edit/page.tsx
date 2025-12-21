"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ScoutedPlayerForm } from "@/components/forms/scouted-player-form"

export default function EditScoutedPlayerPage() {
  const params = useParams()
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  const fetchPlayer = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scouting/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlayer(data)
      }
    } catch (error) {
      console.error("Error fetching scouted player:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Scouted Player</h1>
        <p className="text-muted-foreground">Update scouted player information</p>
      </div>
      <ScoutedPlayerForm scoutedPlayer={player} />
    </div>
  )
}



