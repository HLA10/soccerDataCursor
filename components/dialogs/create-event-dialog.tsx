"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isEmoji } from "@/lib/logo-utils"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ACTIVATION_TYPES,
  ACTIVATION_TYPE_LABELS,
  EXERCISE_TYPES,
  EXERCISE_TYPE_LABELS,
  BALL_OPTIONS,
  CLASSIFICATION_LEVEL_LABELS,
  TRAINING_STYLE_LABELS,
} from "@/lib/training-constants"

interface CreateEventDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultEventType?: "game" | "training" | null
}

export function CreateEventDialog({ open, onClose, onSuccess, defaultEventType }: CreateEventDialogProps) {
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [eventType, setEventType] = useState<"game" | "training" | null>(defaultEventType || null)
  const [loading, setLoading] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "biweekly">("weekly")
  const [recurringCount, setRecurringCount] = useState(10)
  const [recurringDay, setRecurringDay] = useState(1) // 0=Sun, 1=Mon, etc.
  const [opponents, setOpponents] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeamForGame, setSelectedTeamForGame] = useState<any>(null)
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [opponentTeams, setOpponentTeams] = useState<any[]>([])
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<any>(null)
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)
  const [createAnotherGame, setCreateAnotherGame] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  
  // Game form data
  const [gameData, setGameData] = useState({
    date: "",
    time: "",
    teamId: "",
    opponent: "",
    opponentId: "",
    opponentTeamId: "",
    venue: "",
    field: "",
    competition: "",
    competitionId: "",
    duration: "",
    isHome: false,
  })

  useEffect(() => {
    if (open && defaultEventType) {
      setEventType(defaultEventType)
      if (defaultEventType === "game") {
        fetchOpponents()
        fetchCompetitions()
        fetchTeams()
      }
    } else if (!open) {
      // Reset when dialog closes
      setEventType(null)
    }
  }, [open, defaultEventType])

  useEffect(() => {
    if (open && eventType === "game") {
      fetchOpponents()
      fetchCompetitions()
      fetchTeams()
    } else if (open && eventType === "training") {
      fetchTemplates()
    }
  }, [open, eventType])

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedTeam?.id) params.append("teamId", selectedTeam.id)
      const res = await fetch(`/api/training-templates?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTemplates(data || [])
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      setTemplates([])
    }
  }

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId)
      setSelectedTemplate(template || null)
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId, templates])

  useEffect(() => {
    // Set default team from context if available
    if (open && eventType === "game" && selectedTeam && !gameData.teamId) {
      const team = teams.find((t) => t.id === selectedTeam.id)
      if (team) {
        setSelectedTeamForGame(team)
        setGameData({ ...gameData, teamId: team.id })
      }
    }
  }, [open, eventType, teams, selectedTeam])

  const fetchOpponents = async () => {
    try {
      const res = await fetch("/api/opponents")
      if (res.ok) {
        const data = await res.json()
        setOpponents(data)
      }
    } catch (error) {
      console.error("Error fetching opponents:", error)
    }
  }

  const fetchCompetitions = async () => {
    try {
      const res = await fetch("/api/competitions")
      if (res.ok) {
        const data = await res.json()
        setCompetitions(data)
      }
    } catch (error) {
      console.error("Error fetching competitions:", error)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
        // Set default team from context if available
        if (selectedTeam && !gameData.teamId) {
          const team = data.find((t: any) => t.id === selectedTeam.id)
          if (team) {
            setSelectedTeamForGame(team)
            setGameData({ ...gameData, teamId: team.id })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const fetchOpponentTeams = async (opponentId: string) => {
    try {
      const res = await fetch(`/api/opponents/${opponentId}/teams`)
      if (res.ok) {
        const data = await res.json()
        setOpponentTeams(data)
      } else {
        setOpponentTeams([])
      }
    } catch (error) {
      console.error("Error fetching opponent teams:", error)
      setOpponentTeams([])
    }
  }

  // Training form data
  const [trainingData, setTrainingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    duration: "",
    location: "",
    field: "",
    gathering: "",
    notes: "",
  })

  if (!open) return null

  const handleCreateGame = async () => {
    if (!gameData.date || !gameData.time || !gameData.venue || (!gameData.competition && !gameData.competitionId)) {
      alert("Please fill in all required fields")
      return
    }

    if (!gameData.teamId) {
      alert("Please select your team")
      return
    }

    if (!gameData.opponent && !gameData.opponentId) {
      alert("Please select or enter an opponent")
      return
    }

    setLoading(true)
    try {
      const dates = isRecurring 
        ? getRecurringDates(gameData.date, recurringFrequency, recurringCount, recurringDay)
        : [gameData.date]
      
      for (const date of dates) {
        const dateTime = new Date(`${date}T${gameData.time}`)
        await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateTime.toISOString(),
            opponent: gameData.opponent || null,
            opponentId: gameData.opponentId || null,
            venue: gameData.venue,
            field: gameData.field || null,
            competition: gameData.competition || null,
            competitionId: gameData.competitionId || null,
            duration: gameData.duration ? parseInt(gameData.duration) : null,
            isHome: gameData.isHome,
            teamId: gameData.teamId || selectedTeam?.id,
          }),
        })
      }
      
      router.refresh()
      
      if (createAnotherGame) {
        // Reset form but keep dialog open
        setGameData({
          date: "",
          time: "",
          teamId: "",
          opponent: "",
          opponentId: "",
          opponentTeamId: "",
          venue: "",
          field: "",
          competition: "",
          competitionId: "",
          duration: "",
          isHome: false,
        })
        setSelectedTeamForGame(null)
        setSelectedOpponent(null)
        setSelectedOpponentTeam(null)
        setOpponentTeams([])
        setSelectedCompetition(null)
        setIsRecurring(false)
        setRecurringFrequency("weekly")
        setRecurringCount(10)
        setRecurringDay(1)
        // Refresh lists in case new opponent/competition was created
        fetchOpponents()
        fetchCompetitions()
        if (onSuccess) {
          onSuccess() // Refresh calendar even when creating another
        }
      } else {
        if (onSuccess) {
          onSuccess()
        }
        onClose()
        resetForms()
      }
    } catch (error) {
      console.error("Error creating game:", error)
      alert("Failed to create game")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTraining = async (createAnother: boolean = false) => {
    // Validation
    if (!trainingData.date || !trainingData.startTime) {
      alert("Please fill in date and start time")
      return
    }

    if (!selectedTeam?.id) {
      alert("Please select a team first")
      return
    }

    setLoading(true)
    
    try {
      // Get dates to create
      const dates = isRecurring
        ? getRecurringDates(trainingData.date, recurringFrequency, recurringCount, recurringDay)
        : [trainingData.date]

      // Generate seriesId for recurring trainings
      const seriesId = dates.length > 1
        ? `series-${Date.now()}-${Math.random().toString(36).slice(2)}`
        : null

      const createdTrainings = []
      const errors: string[] = []

      // Create each training session
      for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i]
        
        try {
          // Use the same approach as games - combine date and time into ISO string
          // dateStr is in format "YYYY-MM-DD", startTime is in format "HH:mm"
          const dateTime = new Date(`${dateStr}T${trainingData.startTime}`)
          
          const requestBody: any = {
            date: dateTime.toISOString(), // Full ISO datetime string like games use
            startTime: trainingData.startTime,
            teamId: selectedTeam.id,
          }

          // Add optional fields only if they have values
          if (trainingData.endTime) requestBody.endTime = trainingData.endTime
          if (trainingData.duration) requestBody.duration = parseInt(trainingData.duration) || null
          if (trainingData.location) requestBody.location = trainingData.location
          if (trainingData.field) requestBody.field = trainingData.field
          if (trainingData.gathering) requestBody.gathering = trainingData.gathering
          if (trainingData.notes) requestBody.notes = trainingData.notes
          if (seriesId) requestBody.seriesId = seriesId
          if (selectedTemplateId) requestBody.templateId = selectedTemplateId

          console.log(`Creating training ${i + 1}/${dates.length}:`, requestBody)
          console.log(`Date breakdown: dateStr=${dateStr}, startTime=${trainingData.startTime}, combined=${dateTime.toISOString()}`)

          const res = await fetch("/api/trainings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          })
          
          const responseData = await res.json()
          
          if (!res.ok) {
            const errorMsg = responseData.error || `Failed to create training ${i + 1} (Status: ${res.status})`
            errors.push(errorMsg)
            console.error(`Error creating training ${i + 1}:`, responseData)
            continue // Skip to next training
          }
          
          createdTrainings.push(responseData)
          console.log(`Training ${i + 1} created successfully:`, responseData.id)
        } catch (err: any) {
          const errorMsg = err?.message || `Failed to create training ${i + 1}`
          errors.push(errorMsg)
          console.error(`Error creating training ${i + 1}:`, err)
        }
      }
      
      // Show results
      if (errors.length > 0 && createdTrainings.length === 0) {
        // All failed
        alert(`Failed to create training sessions:\n\n${errors.join('\n')}`)
      } else if (errors.length > 0) {
        // Some succeeded, some failed
        alert(
          `Created ${createdTrainings.length} training session(s) successfully.\n\n` +
          `Failed to create ${errors.length} session(s):\n${errors.join('\n')}`
        )
      } else {
        // All succeeded
        if (createdTrainings.length === 1) {
          alert("Training session created successfully!")
        } else {
          alert(`${createdTrainings.length} training sessions created successfully!`)
        }
      }
      
      // Refresh if any were created
      if (createdTrainings.length > 0) {
        router.refresh()
        if (onSuccess) {
          onSuccess()
        }
      }
      
      // Close or reset based on createAnother flag
      if (createAnother && createdTrainings.length > 0) {
        // Reset form but keep dialog open
        setTrainingData({
          date: "",
          startTime: "",
          endTime: "",
          duration: "",
          location: "",
          field: "",
          gathering: "",
          notes: "",
        })
        setIsRecurring(false)
        setRecurringFrequency("weekly")
        setRecurringCount(10)
        setRecurringDay(1)
      } else if (createdTrainings.length > 0) {
        // Close dialog
        onClose()
        resetForms()
      }
    } catch (error: any) {
      console.error("Unexpected error creating training:", error)
      alert(`Unexpected error: ${error?.message || error?.toString() || "Unknown error"}\n\nPlease check the browser console for details.`)
    } finally {
      setLoading(false)
    }
  }

  const getRecurringDates = (startDate: string, frequency: "weekly" | "biweekly", count: number, dayOfWeek: number): string[] => {
    const dates: string[] = []
    const start = new Date(startDate)
    const weekInterval = frequency === "biweekly" ? 2 : 1
    
    // Find the first occurrence of the target day on or after the start date
    const targetDay = dayOfWeek
    const currentDay = start.getDay()
    const daysUntilTarget = (targetDay - currentDay + 7) % 7
    if (daysUntilTarget > 0) {
      start.setDate(start.getDate() + daysUntilTarget)
    }
    
    for (let i = 0; i < count; i++) {
      const sessionDate = new Date(start)
      sessionDate.setDate(sessionDate.getDate() + (i * 7 * weekInterval))
      dates.push(sessionDate.toISOString().split('T')[0])
    }
    
    return dates
  }

  const resetForms = () => {
    setEventType(null)
    setIsRecurring(false)
    setRecurringFrequency("weekly")
    setRecurringCount(10)
    setRecurringDay(1)
    setSelectedTeamForGame(null)
    setSelectedOpponent(null)
    setSelectedOpponentTeam(null)
    setOpponentTeams([])
    setSelectedCompetition(null)
    setCreateAnotherGame(false)
    setGameData({
      date: "",
      time: "",
      teamId: "",
      opponent: "",
      opponentId: "",
      opponentTeamId: "",
      venue: "",
      field: "",
      competition: "",
      competitionId: "",
      duration: "",
      isHome: false,
    })
    setTrainingData({
      date: "",
      startTime: "",
      endTime: "",
      duration: "",
      location: "",
      field: "",
      gathering: "",
      notes: "",
    })
    setSelectedTemplateId("")
    setSelectedTemplate(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Event</CardTitle>
          <CardDescription className="text-gray-600 mt-1">Schedule a new game or training session for your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {!eventType ? (
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setEventType("game")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 text-left transition-all hover:border-purple-500 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 group-hover:from-purple-600 group-hover:to-purple-800 transition-all shadow-lg">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Match</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1">Competitive fixture</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">Schedule a competitive match, tournament game, or league fixture with opponent details and venue information.</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setEventType("training")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 text-left transition-all hover:border-blue-500 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 group-hover:from-blue-600 group-hover:to-blue-800 transition-all shadow-lg">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Training Session</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1">Practice & development</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">Schedule a practice session with location, duration, and training focus details for player development.</p>
                </div>
              </button>
            </div>
          ) : eventType === "game" ? (
            <div className="space-y-6">
              <div className="pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
                <p className="text-sm text-gray-500 mt-1">Enter information about the competitive fixture</p>
              </div>

              {/* Team vs Opponent Display */}
              <div className="mb-6 p-6 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white shadow-sm">
                <div className="flex items-center justify-center space-x-6">
                  {/* Your Team */}
                  <div className="flex-1">
                    <Label htmlFor="your-team" className="text-xs text-gray-500 mb-2 block">Your Team *</Label>
                    <select
                      id="your-team"
                      value={gameData.teamId}
                      onChange={(e) => {
                        const teamId = e.target.value
                        const team = teams.find((t) => t.id === teamId)
                        setSelectedTeamForGame(team || null)
                        setGameData({ ...gameData, teamId: teamId })
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mb-3"
                      required
                    >
                      <option value="">Select your team...</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.code ? `(${team.code})` : ""}
                        </option>
                      ))}
                    </select>
                    {selectedTeamForGame && (
                      <div className="flex items-center space-x-3">
                        {selectedTeamForGame.logo ? (
                          <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
                            <img
                              src={selectedTeamForGame.logo}
                              alt={selectedTeamForGame.name}
                              className="w-full h-full object-contain p-1"
                              style={{ aspectRatio: "1/1" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                // Show fallback
                                const fallback = e.currentTarget.parentElement?.querySelector('.team-fallback')
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = "flex"
                                }
                              }}
                            />
                            <div className="team-fallback w-16 h-16 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md absolute inset-0" style={{ display: "none" }}>
                              <span className="text-2xl font-bold text-gray-700">
                                {selectedTeamForGame.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                            <span className="text-2xl font-bold text-gray-700">
                              {selectedTeamForGame.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-base text-gray-900">{selectedTeamForGame.name}</p>
                          {selectedTeamForGame.code && (
                            <p className="text-sm text-gray-500">{selectedTeamForGame.code}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* VS */}
                  <div className="px-6">
                    <span className="text-3xl font-bold text-gray-600">VS</span>
                  </div>
                  
                  {/* Opponent Team */}
                  <div className="flex-1">
                    <Label htmlFor="opponent" className="text-xs text-gray-500 mb-2 block">Opponent *</Label>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <select
                          id="opponent"
                          value={gameData.opponentId}
                          onChange={async (e) => {
                            const opponentId = e.target.value
                            const opponent = opponents.find((o) => o.id === opponentId)
                            setSelectedOpponent(opponent || null)
                            setSelectedOpponentTeam(null)
                            setGameData({
                              ...gameData,
                              opponentId: opponentId,
                              opponent: opponent ? opponent.name : "",
                              opponentTeamId: "",
                            })
                            // Fetch teams for this opponent
                            if (opponentId) {
                              await fetchOpponentTeams(opponentId)
                            } else {
                              setOpponentTeams([])
                            }
                          }}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Select opponent...</option>
                          {opponents.map((opponent) => (
                            <option key={opponent.id} value={opponent.id}>
                              {opponent.name}
                            </option>
                          ))}
                        </select>
                        <Link
                          href="/opponents/new"
                          target="_blank"
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                          title="Add new opponent (opens in new tab)"
                        >
                          +
                        </Link>
                      </div>
                      {!gameData.opponentId && (
                        <Input
                          placeholder="Or enter opponent name manually"
                          value={gameData.opponent}
                          onChange={(e) => setGameData({ ...gameData, opponent: e.target.value, opponentId: "" })}
                        />
                      )}
                    </div>
                    {selectedOpponent && (
                      <div className="flex items-center space-x-3">
                        <div className="text-right flex-1">
                          <p className="font-bold text-base text-gray-900">{selectedOpponent.name}</p>
                          {selectedOpponent.location && (
                            <p className="text-sm text-gray-500">{selectedOpponent.location}</p>
                          )}
                        </div>
                        {selectedOpponent.logo ? (
                          <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
                            <img
                              src={selectedOpponent.logo}
                              alt={selectedOpponent.name}
                              className="w-full h-full object-contain p-1"
                              style={{ aspectRatio: "1/1" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                            <span className="text-2xl font-bold text-gray-700">
                              {selectedOpponent.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="game-date">Date *</Label>
                  <Input
                    id="game-date"
                    type="date"
                    value={gameData.date}
                    onChange={(e) => setGameData({ ...gameData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="game-time">Time *</Label>
                  <Input
                    id="game-time"
                    type="time"
                    value={gameData.time}
                    onChange={(e) => setGameData({ ...gameData, time: e.target.value })}
                    required
                  />
                </div>
                {selectedOpponent && opponentTeams.length > 0 && (
                  <div className="col-span-2">
                    <Label htmlFor="opponentTeam">Opponent Age Group / Team (Optional)</Label>
                    <select
                      id="opponentTeam"
                      value={gameData.opponentTeamId}
                      onChange={(e) => {
                        const teamId = e.target.value
                        const team = opponentTeams.find((t) => t.id === teamId)
                        setSelectedOpponentTeam(team || null)
                        setGameData({
                          ...gameData,
                          opponentTeamId: teamId,
                        })
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select age group...</option>
                      {opponentTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.age ? `(${team.age})` : ""} - {team.gender === "MALE" ? "Male" : team.gender === "FEMALE" ? "Female" : "Mixed"}
                        </option>
                      ))}
                    </select>
                    {selectedOpponentTeam && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                        {selectedOpponentTeam.teamColor && (
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: selectedOpponentTeam.teamColor }}
                          />
                        )}
                        {selectedOpponentTeam.homeField && (
                          <span>• {selectedOpponentTeam.homeField}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={gameData.venue}
                    onChange={(e) => setGameData({ ...gameData, venue: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="field">Field</Label>
                  <Input
                    id="field"
                    value={gameData.field}
                    onChange={(e) => setGameData({ ...gameData, field: e.target.value })}
                    placeholder="Field 1, Field A, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="competition">Competition *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <select
                        id="competition"
                        value={gameData.competitionId}
                        onChange={(e) => {
                          const competitionId = e.target.value
                          const competition = competitions.find((c) => c.id === competitionId)
                          setSelectedCompetition(competition || null)
                          setGameData({
                            ...gameData,
                            competitionId: competitionId,
                            competition: competition ? competition.name : "",
                          })
                        }}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select competition or enter manually...</option>
                        {competitions.map((competition) => (
                          <option key={competition.id} value={competition.id}>
                            {competition.name} ({competition.season})
                          </option>
                        ))}
                      </select>
                      <Link
                        href="/competitions/new"
                        target="_blank"
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        title="Add new competition (opens in new tab)"
                      >
                        +
                      </Link>
                    </div>
                    {!gameData.competitionId && (
                      <Input
                        placeholder="Or enter competition name manually"
                        value={gameData.competition}
                        onChange={(e) => setGameData({ ...gameData, competition: e.target.value, competitionId: "" })}
                      />
                    )}
                    {selectedCompetition && (
                      <div className="flex items-center space-x-3 p-3 border rounded bg-gray-50">
                        {selectedCompetition.logo && (
                          <div className="flex-shrink-0">
                            {isEmoji(selectedCompetition.logo) ? (
                              <div className="w-12 h-12 flex items-center justify-center text-2xl">
                                {selectedCompetition.logo}
                              </div>
                            ) : (
                              <div className="relative w-12 h-12">
                                <img
                                  src={selectedCompetition.logo}
                                  alt={selectedCompetition.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{selectedCompetition.name}</p>
                          <p className="text-xs text-gray-500">
                            {selectedCompetition.type.replace("_", " ")} • {selectedCompetition.season}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="game-duration">Duration (minutes)</Label>
                  <Input
                    id="game-duration"
                    type="number"
                    value={gameData.duration}
                    onChange={(e) => setGameData({ ...gameData, duration: e.target.value })}
                    placeholder="90"
                  />
                </div>
                <div>
                  <Label>Home / Away *</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="homeAway"
                        checked={gameData.isHome === true}
                        onChange={() => setGameData({ ...gameData, isHome: true })}
                        className="rounded"
                      />
                      <span>Home</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="homeAway"
                        checked={gameData.isHome === false}
                        onChange={() => setGameData({ ...gameData, isHome: false })}
                        className="rounded"
                      />
                      <span>Away</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="recurring-game"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="recurring-game" className="text-base font-semibold cursor-pointer">
                    Recurring Event
                  </Label>
                </div>
                
                {isRecurring && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <Label htmlFor="recurringDay-game">Day of Week</Label>
                      <select
                        id="recurringDay-game"
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(parseInt(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={0}>Sunday</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="frequency-game">Repeat Every</Label>
                      <select
                        id="frequency-game"
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as "weekly" | "biweekly")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="weekly">Week</option>
                        <option value="biweekly">2 Weeks</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="count-game">Number of Events</Label>
                      <Input
                        id="count-game"
                        type="number"
                        min="2"
                        max="52"
                        value={recurringCount}
                        onChange={(e) => setRecurringCount(parseInt(e.target.value) || 2)}
                      />
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      This will create {recurringCount} events every {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][recurringDay]}{recurringFrequency === "biweekly" ? " (every 2 weeks)" : ""}, starting from {gameData.date || "the selected date"}.
                    </div>
                  </div>
                )}
              </div>

              {/* Create Another Checkbox */}
              <div className="flex items-center space-x-2 pt-4 border-t mt-6">
                <input
                  type="checkbox"
                  id="createAnotherGame"
                  checked={createAnotherGame}
                  onChange={(e) => setCreateAnotherGame(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="createAnotherGame" className="text-sm font-normal cursor-pointer">
                  Create another game after saving
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Training Session Details</h3>
                <p className="text-sm text-gray-500 mt-1">Enter information about the practice session</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="training-date">Date *</Label>
                  <Input
                    id="training-date"
                    type="date"
                    value={trainingData.date}
                    onChange={(e) => setTrainingData({ ...trainingData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start-time">Start Time *</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={trainingData.startTime}
                    onChange={(e) => setTrainingData({ ...trainingData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={trainingData.endTime}
                    onChange={(e) => setTrainingData({ ...trainingData, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="training-duration">Duration (minutes)</Label>
                  <Input
                    id="training-duration"
                    type="number"
                    value={trainingData.duration}
                    onChange={(e) => setTrainingData({ ...trainingData, duration: e.target.value })}
                    placeholder="90"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={trainingData.location}
                    onChange={(e) => setTrainingData({ ...trainingData, location: e.target.value })}
                    placeholder="Training field, gym, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="training-field">Field</Label>
                  <Input
                    id="training-field"
                    value={trainingData.field}
                    onChange={(e) => setTrainingData({ ...trainingData, field: e.target.value })}
                    placeholder="Field 1, Field A, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="gathering">Gathering Location</Label>
                  <Input
                    id="gathering"
                    value={trainingData.gathering}
                    onChange={(e) => setTrainingData({ ...trainingData, gathering: e.target.value })}
                    placeholder="Where players meet before training"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="training-notes">Notes</Label>
                <Textarea
                  id="training-notes"
                  value={trainingData.notes}
                  onChange={(e) => setTrainingData({ ...trainingData, notes: e.target.value })}
                  placeholder="Training focus, drills, etc."
                  rows={3}
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="recurring-training"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="recurring-training" className="text-base font-semibold cursor-pointer">
                    Recurring Training
                  </Label>
                </div>
                
                {isRecurring && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <Label htmlFor="recurringDay-training">Day of Week</Label>
                      <select
                        id="recurringDay-training"
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(parseInt(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={0}>Sunday</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="frequency-training">Repeat Every</Label>
                      <select
                        id="frequency-training"
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as "weekly" | "biweekly")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="weekly">Week</option>
                        <option value="biweekly">2 Weeks</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="count-training">Number of Sessions</Label>
                      <Input
                        id="count-training"
                        type="number"
                        min="2"
                        max="52"
                        value={recurringCount}
                        onChange={(e) => setRecurringCount(parseInt(e.target.value) || 2)}
                      />
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      This will create {recurringCount} training sessions every {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][recurringDay]}{recurringFrequency === "biweekly" ? " (every 2 weeks)" : ""}, starting from {trainingData.date || "the selected date"}.
                    </div>
                  </div>
                )}
              </div>

              {/* Template Selection */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Session Plan Template</Label>
                  <Link href="/training-templates/new" target="_blank" className="text-sm text-primary hover:underline">
                    Create New Template
                  </Link>
                </div>
                <div>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">No template (create basic training)</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-2">{selectedTemplate.name}</h4>
                      {selectedTemplate.description && (
                        <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.description}</p>
                      )}
                      <div className="space-y-2">
                        {selectedTemplate.parts?.map((part: any) => (
                          <div key={part.partNumber} className="text-sm">
                            <span className="font-medium">Part {part.partNumber}:</span>{" "}
                            {part.partNumber === 1
                              ? ACTIVATION_TYPE_LABELS[part.partType] || part.partType
                              : EXERCISE_TYPE_LABELS[part.partType] || part.partType}
                            {part.duration && ` (${part.duration} min)`}
                            {part.classificationLevel && ` - ${CLASSIFICATION_LEVEL_LABELS[part.classificationLevel]}`}
                            {part.classificationStyle && ` - ${TRAINING_STYLE_LABELS[part.classificationStyle]}`}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Template parts will be automatically added to this training session
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between items-center border-t bg-gray-50 px-6 py-4">
          <div className="flex space-x-2">
            {eventType && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEventType(null)}
                disabled={loading}
                className="border-gray-300 hover:bg-gray-100"
              >
                ← Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForms()
                onClose()
              }}
              disabled={loading}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
          <div className="flex space-x-2">
            {eventType && (
              <>
                {eventType === "training" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCreateTraining(true)}
                    disabled={loading}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    {loading ? "Creating..." : "Save and Create Another"}
                  </Button>
                )}
                {eventType === "game" && (
                  <Button 
                    onClick={handleCreateGame} 
                    disabled={loading}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 shadow-md"
                  >
                    {loading ? "Creating..." : "Create Match"}
                  </Button>
                )}
                {eventType === "training" && (
                  <Button 
                    onClick={() => handleCreateTraining(false)} 
                    disabled={loading}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 shadow-md"
                  >
                    {loading ? "Creating..." : "Create Training"}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

