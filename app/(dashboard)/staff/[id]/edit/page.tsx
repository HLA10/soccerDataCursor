"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { StaffForm } from "@/components/forms/staff-form"

export default function EditStaffPage() {
  const params = useParams()
  const [staff, setStaff] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(`/api/staff/${params.id}`)
        const data = await res.json()
        setStaff(data)
      } catch (error) {
        console.error("Error fetching staff:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!staff) {
    return <div className="text-center py-8">Staff not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StaffForm staff={staff} />
    </div>
  )
}


