"use client"

import { useEffect, useState } from "react"
import { StaffCard } from "@/components/staff/staff-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"

export default function StaffPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const user = session?.user as any

  useEffect(() => {
    async function fetchStaff() {
      try {
        const params = new URLSearchParams()
        if (selectedTeam?.id) params.append("teamId", selectedTeam.id)
        if (search) params.append("search", search)
        
        const url = params.toString() 
          ? `/api/staff?${params.toString()}`
          : "/api/staff"
        const res = await fetch(url)
        const data = await res.json()
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setStaff(data)
        } else if (data.error) {
          console.error("API Error:", data.error)
          setStaff([]) // Set empty array on error
        } else {
          setStaff([]) // Default to empty array
        }
      } catch (error) {
        console.error("Error fetching staff:", error)
        setStaff([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [search, selectedTeam])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage your team staff</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href="/staff/new">
            <Button>Add Staff</Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {!Array.isArray(staff) || staff.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {!Array.isArray(staff) 
              ? "Error loading staff. Please ensure the database migration has been run."
              : "No staff found"}
          </p>
          {!Array.isArray(staff) && (
            <p className="text-sm text-muted-foreground mt-2">
              Run: npx prisma migrate dev --name add_staff
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <StaffCard key={member.id} staff={member} />
          ))}
        </div>
      )}
    </div>
  )
}

