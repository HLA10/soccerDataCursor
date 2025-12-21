"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TrainingForm } from "@/components/forms/training-form"

export default function EditTrainingPage() {
  const params = useParams()
  const [training, setTraining] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTraining() {
      try {
        const res = await fetch(`/api/trainings/${params.id}`)
        const data = await res.json()
        setTraining(data)
      } catch (error) {
        console.error("Error fetching training:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTraining()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!training) {
    return <div className="text-center py-8">Training not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Training Session</h1>
        <p className="text-muted-foreground">Update training session details</p>
      </div>
      <TrainingForm
        training={training}
        onSuccess={() => {
          window.location.href = `/trainings/bank/${params.id}`
        }}
      />
    </div>
  )
}





