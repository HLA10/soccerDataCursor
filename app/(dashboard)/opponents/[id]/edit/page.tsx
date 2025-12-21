"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { OpponentForm } from "@/components/forms/opponent-form"

export default function EditOpponentPage() {
  const params = useParams()
  const [opponent, setOpponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOpponent()
    }
  }, [params.id])

  const fetchOpponent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opponents/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOpponent(data)
      }
    } catch (error) {
      console.error("Error fetching opponent:", error)
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
        <h1 className="text-3xl font-bold">Edit Opponent</h1>
        <p className="text-muted-foreground">Update opponent club information</p>
      </div>
      <OpponentForm opponent={opponent} />
    </div>
  )
}



