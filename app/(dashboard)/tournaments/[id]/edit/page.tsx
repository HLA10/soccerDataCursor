"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TournamentForm } from "@/components/forms/tournament-form"

export default function EditTournamentPage() {
  const params = useParams()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await fetch(`/api/tournaments/${params.id}`)
        const data = await res.json()
        setTournament(data)
      } catch (error) {
        console.error("Error fetching tournament:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <TournamentForm tournament={tournament} />
    </div>
  )
}




