"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import { Search, Calendar, MapPin } from "lucide-react"

export default function TrainingBankPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const user = session?.user as any

  useEffect(() => {
    fetchTrainings()
  }, [selectedTeam?.id])

  async function fetchTrainings() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const res = await fetch(`/api/trainings?${params.toString()}`)
      const data = await res.json()
      setTrainings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching trainings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      !searchTerm ||
      training.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.template?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate =
      !dateFilter ||
      format(new Date(training.date), "yyyy-MM-dd") === dateFilter

    return matchesSearch && matchesDate
  })

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage)
  const paginatedTrainings = filteredTrainings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Bank</h1>
          <p className="text-muted-foreground">View and manage all training sessions</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href="/trainings/new">
            <Button>New Training Session</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location, notes, or template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainings List */}
      {filteredTrainings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {trainings.length === 0
                ? "No training sessions found"
                : "No trainings match your filters"}
            </p>
            {(user?.role === "ADMIN" || user?.role === "COACH") && trainings.length === 0 && (
              <Link href="/trainings/new">
                <Button>Create Your First Training Session</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedTrainings.map((training) => {
              const attendedCount = training.attendance?.filter((a: any) => a.attended).length || 0
              const totalCount = training.attendance?.length || 0

              return (
                <Card key={training.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          <Link
                            href={`/trainings/bank/${training.id}`}
                            className="hover:underline text-primary"
                          >
                            Training Session
                          </Link>
                        </CardTitle>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(training.date), "MMMM d, yyyy")} • {training.startTime}
                              {training.endTime && ` - ${training.endTime}`}
                            </span>
                          </div>
                          {training.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {training.location}
                                {training.field && ` • ${training.field}`}
                              </span>
                            </div>
                          )}
                          {training.template && (
                            <div>
                              <span className="font-medium">Template:</span> {training.template.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium mb-1">
                          {attendedCount}/{totalCount} attended
                        </p>
                        {training.parts && training.parts.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {training.parts.length} parts
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {training.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{training.notes}</p>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTrainings.length)} of {filteredTrainings.length}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


