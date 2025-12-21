"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface TournamentTravelSectionProps {
  tournamentId: string
}

interface TravelTask {
  id: string
  title: string
  description?: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE"
  dueDate?: string | null
}

interface TravelPlan {
  id: string
  title?: string | null
  departureDateTime?: string | null
  arrivalDateTime?: string | null
  returnDateTime?: string | null
  departureLocation?: string | null
  arrivalLocation?: string | null
  hotelName?: string | null
  hotelAddress?: string | null
  hotelPhone?: string | null
  notes?: string | null
  tasks: TravelTask[]
  roomAssignments: {
    id: string
    roomNumber: string
    playersNames?: string | null
    notes?: string | null
  }[]
}

export function TournamentTravelSection({ tournamentId }: TournamentTravelSectionProps) {
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/tournaments/${tournamentId}/travel`)
        if (!res.ok) {
          if (res.status === 404) {
            setPlan(null)
            return
          }
          const data = await res.json()
          throw new Error(data.error || "Failed to load travel plan")
        }
        const data = await res.json()
        setPlan(data)
      } catch (err: any) {
        console.error("Error loading travel plan:", err)
        setError(err.message || "Failed to load travel plan")
      } finally {
        setLoading(false)
      }
    }

    if (tournamentId) {
      load()
    }
  }, [tournamentId])

  const handleFieldChange = (field: keyof TravelPlan, value: string) => {
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : {
            id: "",
            title: "",
            departureDateTime: null,
            arrivalDateTime: null,
            returnDateTime: null,
            departureLocation: "",
            arrivalLocation: "",
            hotelName: "",
            hotelAddress: "",
            hotelPhone: "",
            notes: "",
            tasks: [],
            roomAssignments: [],
            [field]: value,
          } as any
    )
  }

  const savePlan = async () => {
    if (!plan) {
      // Create minimal plan
      setSaving(true)
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/travel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "",
          }),
        })
        const data = await res.json()
        setPlan(data)
      } catch (err) {
        console.error("Error creating travel plan:", err)
      } finally {
        setSaving(false)
      }
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/tournaments/${tournamentId}/travel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save travel plan")
      }
      const data = await res.json()
      setPlan(data)
    } catch (err: any) {
      console.error("Error saving travel plan:", err)
      setError(err.message || "Failed to save travel plan")
    } finally {
      setSaving(false)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/travel/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add task")
      }
      const task = await res.json()
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              tasks: [...prev.tasks, task],
            }
          : prev
      )
      setNewTaskTitle("")
    } catch (err: any) {
      console.error("Error adding travel task:", err)
      setError(err.message || "Failed to add task")
    }
  }

  const toggleTaskStatus = async (task: TravelTask) => {
    const nextStatus =
      task.status === "DONE" ? "TODO" : task.status === "TODO" ? "IN_PROGRESS" : "DONE"
    try {
      const res = await fetch(`/api/travel-tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update task")
      }
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === task.id ? { ...t, status: nextStatus } : t
              ),
            }
          : prev
      )
    } catch (err: any) {
      console.error("Error updating travel task:", err)
      setError(err.message || "Failed to update task")
    }
  }

  const summaryDates = useMemo(() => {
    if (!plan) return null
    const formatOrDash = (value?: string | null) =>
      value ? format(new Date(value), "MMM d, yyyy HH:mm") : "—"
    return {
      departure: formatOrDash(plan.departureDateTime),
      arrival: formatOrDash(plan.arrivalDateTime),
      returnDate: formatOrDash(plan.returnDateTime),
    }
  }, [plan])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Loading travel plan…</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Itinerary & Hotel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs mb-1 block">Departure (date & time)</Label>
              <Input
                type="datetime-local"
                value={
                  plan?.departureDateTime
                    ? new Date(plan.departureDateTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleFieldChange("departureDateTime", e.target.value)}
              />
              <Input
                className="mt-2"
                placeholder="Departure location"
                value={plan?.departureLocation || ""}
                onChange={(e) => handleFieldChange("departureLocation", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Arrival (date & time)</Label>
              <Input
                type="datetime-local"
                value={
                  plan?.arrivalDateTime
                    ? new Date(plan.arrivalDateTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleFieldChange("arrivalDateTime", e.target.value)}
              />
              <Input
                className="mt-2"
                placeholder="Arrival location / ground transport"
                value={plan?.arrivalLocation || ""}
                onChange={(e) => handleFieldChange("arrivalLocation", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Return (date & time)</Label>
              <Input
                type="datetime-local"
                value={
                  plan?.returnDateTime
                    ? new Date(plan.returnDateTime).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleFieldChange("returnDateTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs mb-1 block">Hotel name</Label>
              <Input
                value={plan?.hotelName || ""}
                onChange={(e) => handleFieldChange("hotelName", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Hotel phone</Label>
              <Input
                value={plan?.hotelPhone || ""}
                onChange={(e) => handleFieldChange("hotelPhone", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Hotel address</Label>
              <Textarea
                rows={2}
                value={plan?.hotelAddress || ""}
                onChange={(e) => handleFieldChange("hotelAddress", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Notes</Label>
            <Textarea
              rows={3}
              placeholder="Additional information about travel, meals, meeting points, etc."
              value={plan?.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={savePlan} disabled={saving}>
              {saving ? "Saving..." : "Save itinerary"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add task (e.g. Roster finalized, passports checked, rooming list ready)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <Button type="button" onClick={addTask}>
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {plan?.tasks && plan.tasks.length > 0 ? (
              plan.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between border rounded-md px-3 py-2"
                >
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={task.status === "DONE"}
                      onCheckedChange={() => toggleTaskStatus(task)}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          task.status === "DONE" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No checklist items yet. Add tasks above to prepare your trip.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rooming (basic)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Simple rooming overview. You can record which players share rooms (free text per
            room). More advanced player linking can be added later.
          </p>
          <div className="space-y-2">
            {plan?.roomAssignments?.map((room) => (
              <div key={room.id} className="grid md:grid-cols-3 gap-2 border rounded-md p-2">
                <Input
                  placeholder="Room number"
                  defaultValue={room.roomNumber}
                  disabled
                />
                <Textarea
                  rows={2}
                  placeholder="Players in this room"
                  defaultValue={room.playersNames || ""}
                  disabled
                />
                <Textarea
                  rows={2}
                  placeholder="Notes"
                  defaultValue={room.notes || ""}
                  disabled
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            (Editing and adding rooms can be extended in a next step.)
          </p>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Travel Summary</CardTitle>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Dates & times</p>
              <p>Departure: {summaryDates?.departure}</p>
              <p>Arrival: {summaryDates?.arrival}</p>
              <p>Return: {summaryDates?.returnDate}</p>
            </div>
            <div>
              <p className="font-semibold mt-2">Hotel</p>
              <p>{plan.hotelName || "—"}</p>
              {plan.hotelAddress && <p>{plan.hotelAddress}</p>}
              {plan.hotelPhone && <p>Phone: {plan.hotelPhone}</p>}
            </div>
            <div>
              <p className="font-semibold mt-2">Checklist</p>
              {plan.tasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks recorded</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {plan.tasks.map((task) => (
                    <li key={task.id}>
                      {task.title}{" "}
                      {task.status === "DONE" && (
                        <span className="text-xs text-green-600">(done)</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}










