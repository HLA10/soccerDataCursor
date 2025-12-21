"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import { Search, Calendar, MapPin, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export default function TrainingsPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const user = session?.user as any

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTrainings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredTrainings.map((t) => t.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} training(s)?`)) return

    setDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/trainings/${id}`, { method: "DELETE" })
        )
      )
      setSelectedIds(new Set())
      fetchTrainings()
    } catch (error) {
      console.error("Error deleting trainings:", error)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchTrainings()
  }, [selectedTeam?.id])

  // Refresh trainings when page becomes visible or regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTrainings()
      }
    }
    
    const handleFocus = () => {
      fetchTrainings()
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [selectedTeam?.id])

  async function fetchTrainings() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const res = await fetch(`/api/trainings?${params.toString()}`)
      if (!res.ok) {
        console.error("Error fetching trainings:", res.status, res.statusText)
        setTrainings([])
        return
      }
      const data = await res.json()
      setTrainings(data || [])
    } catch (error) {
      console.error("Error fetching trainings:", error)
      setTrainings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainings = trainings
    .filter((training) => {
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
    .sort((a, b) => {
      // Sort by date ascending, then by day of week
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage)
  const paginatedTrainings = filteredTrainings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filters change
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
          <h1 className="text-xl font-semibold">Trainings</h1>
          <p className="text-xs text-muted-foreground">View and manage all training sessions</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <div className="flex items-center space-x-2">
            {selectedIds.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected} disabled={deleting}>
                {deleting ? "Deleting..." : `Delete (${selectedIds.size})`}
              </Button>
            )}
            <Link href="/trainings/new">
              <Button>New Training Session</Button>
            </Link>
          </div>
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

      {/* Trainings Chart/Table */}
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
        <Card>
          <CardHeader>
            <CardTitle>Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {(user?.role === "ADMIN" || user?.role === "COACH") && (
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === filteredTrainings.length && filteredTrainings.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Players Attending</span>
                      </div>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrainings.map((training) => {
                    const attendedCount = training.attendance?.filter((a: any) => a.attended).length || 0
                    const totalCount = training.attendance?.length || 0
                    const dayName = format(new Date(training.date), "EEEE") // Day name (Monday, Tuesday, etc.)
                    const dayDate = format(new Date(training.date), "MMM d, yyyy") // Date

                    return (
                      <TableRow key={training.id} className="hover:bg-gray-50">
                        {(user?.role === "ADMIN" || user?.role === "COACH") && (
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(training.id)}
                              onCheckedChange={() => toggleSelect(training.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <div className="font-medium">{dayName}</div>
                            <div className="text-sm text-muted-foreground">{dayDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {training.startTime}
                              {training.endTime && ` - ${training.endTime}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-semibold">{attendedCount}</span>
                            {totalCount > 0 && (
                              <span className="text-sm text-muted-foreground">
                                / {totalCount}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {training.location ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {training.location}
                                {training.field && ` • ${training.field}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {training.template ? (
                            <span className="text-sm">{training.template.name}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/trainings/bank/${training.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}

