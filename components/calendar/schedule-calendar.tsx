"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ScheduleCalendarProps {
  games: any[]
  trainings: any[]
  tournaments?: any[]
  view: "week" | "month" | "year"
  onViewChange: (view: "week" | "month" | "year") => void
}

export function ScheduleCalendar({ games = [], trainings = [], tournaments = [], view, onViewChange }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Debug: Log events received (only in development)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('📅 Calendar Events:', {
        games: games?.length || 0,
        trainings: trainings?.length || 0,
        tournaments: tournaments?.length || 0,
        currentView: view,
        currentMonth: format(currentDate, 'MMMM yyyy'),
        sampleGame: games?.[0] ? { id: games[0].id, date: games[0].date, opponent: games[0].opponent } : null,
        sampleTraining: trainings?.[0] ? { id: trainings[0].id, date: trainings[0].date, startTime: trainings[0].startTime } : null,
        sampleTournament: tournaments?.[0] ? { id: tournaments[0].id, startDate: tournaments[0].startDate, name: tournaments[0].name } : null
      })
    }
  }, [games, trainings, tournaments, view, currentDate])

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "week") {
      setCurrentDate((prev) => (direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)))
    } else if (view === "month") {
      setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
    } else {
      setCurrentDate((prev) => (direction === "prev" ? subYears(prev, 1) : addYears(prev, 1)))
    }
  }

  const getEventsForDate = (date: Date) => {
    if (!games || !trainings) {
      return { games: [], trainings: [], tournaments: [] }
    }
    
    // Normalize the target date to start of day for comparison
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    
    const dayEvents = {
      games: (games || []).filter((game) => {
        if (!game?.date) return false
        try {
          const gameDate = new Date(game.date)
          gameDate.setHours(0, 0, 0, 0)
          // Compare year, month, and day directly
          return gameDate.getFullYear() === targetYear &&
                 gameDate.getMonth() === targetMonth &&
                 gameDate.getDate() === targetDay
        } catch (e) {
          console.error('Error parsing game date:', game.date, e)
          return false
        }
      }),
      trainings: (trainings || []).filter((training) => {
        if (!training?.date) return false
        try {
          const trainingDate = new Date(training.date)
          trainingDate.setHours(0, 0, 0, 0)
          // Compare year, month, and day directly
          return trainingDate.getFullYear() === targetYear &&
                 trainingDate.getMonth() === targetMonth &&
                 trainingDate.getDate() === targetDay
        } catch (e) {
          console.error('Error parsing training date:', training.date, e)
          return false
        }
      }),
      tournaments: (tournaments || []).filter((tournament) => {
        if (!tournament?.startDate) return false
        try {
          const tournamentDate = new Date(tournament.startDate)
          tournamentDate.setHours(0, 0, 0, 0)
          // Compare year, month, and day directly
          return tournamentDate.getFullYear() === targetYear &&
                 tournamentDate.getMonth() === targetMonth &&
                 tournamentDate.getDate() === targetDay
        } catch (e) {
          console.error('Error parsing tournament date:', tournament.startDate, e)
          return false
        }
      }),
    }
    return dayEvents
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const events = getEventsForDate(day)
          const isToday = isSameDay(day, new Date())
          return (
            <Card key={day.toISOString()} className={`${isToday ? "border-2 border-blue-500" : ""}`}>
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  {format(day, "EEE")}
                </div>
                <div className={`text-lg font-bold mb-2 ${isToday ? "text-blue-600" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {events.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200 transition-colors font-medium"
                      title={`${game.opponent || 'Game'}${game.field ? ` - Field: ${game.field}` : ""}${game.duration ? ` - ${game.duration}min` : ""} - ${game.venue || ''}`}
                    >
                        {game.opponent || 'Game'}
                      {game.field && ` (${game.field})`}
                    </Link>
                  ))}
                  {events.trainings.map((training) => (
                    <Link
                      key={training.id}
                      href={`/trainings/${training.id}`}
                      className="block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors font-medium"
                      title={`Training ${training.startTime || ''}${training.endTime ? `-${training.endTime}` : ""}${training.duration ? ` (${training.duration}min)` : ""}${training.location ? ` - ${training.location}` : ""}${training.field ? ` - Field: ${training.field}` : ""}${training.gathering ? ` - Gather: ${training.gathering}` : ""}`}
                    >
                        {training.startTime || 'Training'}
                      {training.field && ` (${training.field})`}
                    </Link>
                  ))}
                  {events.tournaments.map((tournament) => (
                    <Link
                      key={tournament.id}
                      href={`/tournaments/${tournament.id}`}
                      className="block text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-medium"
                      title={`${tournament.name}${tournament.type ? ` - ${tournament.type}` : ""}${tournament.endDate ? ` (${format(new Date(tournament.endDate), 'MMM d')})` : ""}`}
                    >
                      {tournament.name || 'Tournament'}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const events = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = format(day, "M") === format(currentDate, "M")
            return (
              <Card
                key={day.toISOString()}
                className={`min-h-24 ${isToday ? "border-2 border-blue-500" : ""} ${
                  !isCurrentMonth ? "opacity-50" : ""
                }`}
              >
                <CardContent className="p-2">
                  <div className={`text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1 min-h-[40px]">
                    {events.games.slice(0, 2).map((game) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className="block text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate hover:bg-purple-200 font-medium mb-1"
                        title={`${game.opponent}${game.field ? ` - Field: ${game.field}` : ""}${game.duration ? ` - ${game.duration}min` : ""} - ${game.venue}`}
                      >
                        {game.opponent || 'Game'}
                      </Link>
                    ))}
                    {events.trainings.slice(0, 2).map((training) => (
                      <Link
                        key={training.id}
                        href={`/trainings/${training.id}`}
                        className="block text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate hover:bg-blue-200 font-medium mb-1"
                        title={`Training ${training.startTime}${training.duration ? ` (${training.duration}min)` : ""}${training.location ? ` - ${training.location}` : ""}${training.field ? ` - Field: ${training.field}` : ""}`}
                      >
                        {training.startTime || 'Training'}
                      </Link>
                    ))}
                    {events.tournaments.slice(0, 2).map((tournament) => (
                      <Link
                        key={tournament.id}
                        href={`/tournaments/${tournament.id}`}
                        className="block text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded truncate hover:bg-orange-200 font-medium mb-1"
                        title={`${tournament.name}${tournament.type ? ` - ${tournament.type}` : ""}${tournament.endDate ? ` (${format(new Date(tournament.endDate), 'MMM d')})` : ""}`}
                      >
                        {tournament.name || 'Tournament'}
                      </Link>
                    ))}
                    {(events.games.length + events.trainings.length + events.tournaments.length) > 6 && (
                      <div className="text-xs text-gray-500">
                        +{events.games.length + events.trainings.length + events.tournaments.length - 6} more
                      </div>
                    )}
                    {events.games.length === 0 && events.trainings.length === 0 && events.tournaments.length === 0 && (
                      <div className="text-xs text-gray-300">-</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), i, 1)
      return {
        month: monthDate,
        name: format(monthDate, "MMMM"),
        games: (games || []).filter((game) => {
          if (!game?.date) return false
          const gameDate = new Date(game.date)
          return gameDate.getFullYear() === currentDate.getFullYear() && gameDate.getMonth() === i
        }),
        trainings: (trainings || []).filter((training) => {
          if (!training?.date) return false
          const trainingDate = new Date(training.date)
          return trainingDate.getFullYear() === currentDate.getFullYear() && trainingDate.getMonth() === i
        }),
        tournaments: (tournaments || []).filter((tournament) => {
          if (!tournament?.startDate) return false
          const tournamentDate = new Date(tournament.startDate)
          return tournamentDate.getFullYear() === currentDate.getFullYear() && tournamentDate.getMonth() === i
        }),
      }
    })

    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((month) => (
          <Card key={month.name}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">{month.name}</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-blue-600">Games: {month.games.length}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-600">Trainings: {month.trainings.length}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-orange-600">Tournaments: {month.tournaments.length}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total: {month.games.length + month.trainings.length + month.tournaments.length} events
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            ←
          </Button>
          <h2 className="text-xl font-bold">
            {view === "week"
              ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")}`
              : view === "month"
              ? format(currentDate, "MMMM yyyy")
              : format(currentDate, "yyyy")}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            →
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("week")}
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("month")}
          >
            Month
          </Button>
          <Button
            variant={view === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {(games.length > 0 || trainings.length > 0 || tournaments.length > 0) && (
        <div className="text-xs text-gray-500 mb-2">
          Showing {games.length} game(s), {trainings.length} training(s), and {tournaments.length} tournament(s) for {format(currentDate, "MMMM yyyy")}
        </div>
      )}

      <div className="mt-4">
        {view === "week" && renderWeekView()}
        {view === "month" && renderMonthView()}
        {view === "year" && renderYearView()}
      </div>
    </div>
  )
}

