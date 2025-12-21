"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CompetitionForm } from "@/components/forms/competition-form"

export default function EditCompetitionPage() {
  const params = useParams()
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCompetition()
    }
  }, [params.id])

  const fetchCompetition = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/competitions/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setCompetition(data)
      }
    } catch (error) {
      console.error("Error fetching competition:", error)
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
        <h1 className="text-3xl font-bold">Edit Competition</h1>
        <p className="text-muted-foreground">Update competition information</p>
      </div>
      <CompetitionForm competition={competition} />
    </div>
  )
}



