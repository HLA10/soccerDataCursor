"use client"

import { useEffect, useState } from "react"
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar"
import { useTeam } from "@/contexts/team-context"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog"

export default function CalendarPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [trainings, setTrainings] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"week" | "month" | "year">("month")
  const [showEventDialog, setShowEventDialog] = useState(false)

  const user = session?.user as any

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

      const [trainingsRes, gamesRes, tournamentsRes] = await Promise.all([
        fetch(`/api/trainings?${params.toString()}`),
        fetch(`/api/games?${params.toString()}`),
        fetch(`/api/tournaments?${params.toString()}`),
      ])

      if (!trainingsRes.ok || !gamesRes.ok || !tournamentsRes.ok) {
        console.error("Error fetching data")
        setTrainings([])
        setGames([])
        setTournaments([])
        return
      }

      const trainingsData = await trainingsRes.json()
      const gamesData = await gamesRes.json()
      const tournamentsData = await tournamentsRes.json()

      console.log("📅 Calendar Data Fetched:", {
        trainings: trainingsData?.length || 0,
        games: gamesData?.length || 0,
        tournaments: tournamentsData?.length || 0,
        team: selectedTeam?.name,
        sampleTraining: trainingsData?.[0] ? { id: trainingsData[0].id, date: trainingsData[0].date, startTime: trainingsData[0].startTime } : null,
        sampleGame: gamesData?.[0] ? { id: gamesData[0].id, date: gamesData[0].date, opponent: gamesData[0].opponent } : null,
        sampleTournament: tournamentsData?.[0] ? { id: tournamentsData[0].id, startDate: tournamentsData[0].startDate, name: tournamentsData[0].name } : null
      })

      setTrainings(Array.isArray(trainingsData) ? trainingsData : [])
      setGames(Array.isArray(gamesData) ? gamesData : [])
      setTournaments(Array.isArray(tournamentsData) ? tournamentsData : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setTrainings([])
      setGames([])
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTeam) {
      fetchData()
    }
  }, [selectedTeam])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Calendar</h1>
          <p className="text-xs text-muted-foreground">View your team's games and training sessions</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Button onClick={() => setShowEventDialog(true)}>
            Create Event
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading calendar...</div>
      ) : (
        <div className="w-full">
          <ScheduleCalendar
            games={games}
            trainings={trainings}
            tournaments={tournaments}
            view={view}
            onViewChange={setView}
          />
        </div>
      )}

      <CreateEventDialog
        open={showEventDialog}
        onClose={() => {
          setShowEventDialog(false)
        }}
        onSuccess={() => {
          fetchData() // Refresh calendar after creating event
        }}
      />
    </div>
  )
}

