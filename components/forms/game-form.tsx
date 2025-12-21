"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/ui/star-rating"
import { useTeam } from "@/contexts/team-context"

interface GameFormProps {
  game?: any
  onSuccess?: () => void
}

export function GameForm({ game, onSuccess }: GameFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedTeam, teams } = useTeam()
  const [loading, setLoading] = useState(false)
  const [opponents, setOpponents] = useState<any[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [selectedTeamForGame, setSelectedTeamForGame] = useState<any>(null)
  const [opponentSearch, setOpponentSearch] = useState("")
  const [showOpponentResults, setShowOpponentResults] = useState(false)
  
  const [formData, setFormData] = useState({
    date: game?.date
      ? new Date(game.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    opponent: game?.opponent || "",
    opponentId: game?.opponentId || "",
    venue: game?.venue || "",
    competition: game?.competition || "",
    score: game?.score || "",
    isHome: game?.isHome !== undefined ? game.isHome : null,
    rating: game?.rating || null,
    teamId: game?.teamId || "",
  })

  // Fetch opponents and teams with logos
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch opponents
        const opponentsRes = await fetch("/api/opponents")
        if (opponentsRes.ok) {
          const opponentsData = await opponentsRes.json()
          setOpponents(opponentsData)
        }
        
        // Fetch teams with logos (if not already in context)
        if (teams.length === 0 || !teams.some(t => t.logo !== undefined)) {
          const teamsRes = await fetch("/api/teams")
          if (teamsRes.ok) {
            const teamsData = await teamsRes.json()
            // Update selectedTeamForGame if we have team data
            if (selectedTeam && teamsData.length > 0) {
              const fullTeamData = teamsData.find((t: any) => t.id === selectedTeam.id)
              if (fullTeamData) {
                setSelectedTeamForGame(fullTeamData)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  // Auto-select opponent from URL parameter (when returning from opponent creation)
  useEffect(() => {
    const opponentId = searchParams?.get("opponentId")
    if (opponentId && !game && !selectedOpponent) {
      // Fetch the opponent by ID and auto-select it
      async function fetchAndSelectOpponent() {
        try {
          const res = await fetch(`/api/opponents/${opponentId}`)
          if (res.ok) {
            const opponentData = await res.json()
            setSelectedOpponent(opponentData)
            setOpponentSearch(opponentData.name)
            setFormData(prev => ({
              ...prev,
              opponentId: opponentData.id,
              opponent: opponentData.name,
            }))
            // Clear the URL parameter
            router.replace("/games/new", { scroll: false })
          }
        } catch (error) {
          console.error("Error fetching opponent:", error)
        }
      }
      fetchAndSelectOpponent()
    }
  }, [searchParams, game, selectedOpponent, router])

  // Set selected team and opponent when game data is loaded
  useEffect(() => {
    if (game) {
      if (game.team) {
        setSelectedTeamForGame(game.team)
      }
      if (game.opponentClub) {
        setSelectedOpponent(game.opponentClub)
        setOpponentSearch(game.opponentClub.name)
        setFormData(prev => ({ ...prev, opponentId: game.opponentClub.id }))
      }
    } else if (selectedTeam) {
      // For new games, use selected team from context
      setSelectedTeamForGame(selectedTeam)
      setFormData(prev => ({ ...prev, teamId: selectedTeam.id }))
    }
  }, [game, selectedTeam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = game ? `/api/games/${game.id}` : "/api/games"
      const method = game ? "PUT" : "POST"

      const submitData = {
        ...formData,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/games")
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save game")
      }
    } catch (error) {
      console.error("Error saving game:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle>{game ? "Edit Game" : "Add Game"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="team">Your Team *</Label>
              <select
                id="team"
                value={formData.teamId}
                onChange={async (e) => {
                  const teamId = e.target.value
                  // Try to find team in context first
                  let team = teams.find((t) => t.id === teamId)
                  // If not found or missing logo, fetch from API
                  if (!team || !team.logo) {
                    try {
                      const res = await fetch("/api/teams")
                      if (res.ok) {
                        const teamsData = await res.json()
                        team = teamsData.find((t: any) => t.id === teamId)
                      }
                    } catch (error) {
                      console.error("Error fetching team:", error)
                    }
                  }
                  setSelectedTeamForGame(team || null)
                  setFormData({ ...formData, teamId: teamId })
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select your team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} {team.code ? `(${team.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="opponent">Opponent *</Label>
              <div className="relative space-y-2">
                <Input
                  id="opponent"
                  type="text"
                  placeholder="Search for opponent or enter name manually..."
                  value={selectedOpponent ? selectedOpponent.name : opponentSearch}
                  onChange={(e) => {
                    const searchValue = e.target.value
                    setOpponentSearch(searchValue)
                    setShowOpponentResults(true)
                    
                    // Clear selection if user is typing
                    if (selectedOpponent && searchValue !== selectedOpponent.name) {
                      setSelectedOpponent(null)
                      setFormData({
                        ...formData,
                        opponentId: "",
                        opponent: searchValue,
                      })
                    } else if (!selectedOpponent) {
                      setFormData({
                        ...formData,
                        opponent: searchValue,
                        opponentId: "",
                      })
                    }
                  }}
                  onFocus={() => setShowOpponentResults(true)}
                  onBlur={() => {
                    // Delay hiding results to allow click on result
                    setTimeout(() => setShowOpponentResults(false), 200)
                  }}
                  required={!formData.opponentId}
                  className="w-full"
                />
                {showOpponentResults && opponentSearch && !selectedOpponent && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {opponents
                      .filter((opponent) =>
                        opponent.name.toLowerCase().includes(opponentSearch.toLowerCase())
                      )
                      .map((opponent) => (
                        <div
                          key={opponent.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setSelectedOpponent(opponent)
                            setOpponentSearch(opponent.name)
                            setFormData({
                              ...formData,
                              opponentId: opponent.id,
                              opponent: opponent.name,
                            })
                            setShowOpponentResults(false)
                          }}
                        >
                          {opponent.logo && (
                            <img
                              src={opponent.logo}
                              alt={opponent.name}
                              className="w-8 h-8 rounded-full object-contain border border-gray-200 bg-white"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{opponent.name}</p>
                            {opponent.location && (
                              <p className="text-xs text-gray-500">{opponent.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    {opponents.filter((opponent) =>
                      opponent.name.toLowerCase().includes(opponentSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No opponents found. You can enter a custom name.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Link 
                  href="/opponents/new?returnTo=/games/new" 
                  className="text-sm text-primary hover:underline"
                >
                  Create a new opponent
                </Link>
              </div>
            </div>
          <div>
            <Label htmlFor="isHome">Home/Away *</Label>
            <select
              id="isHome"
              value={formData.isHome !== null ? (formData.isHome ? 'home' : 'away') : ''}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  isHome: e.target.value === 'home' ? true : e.target.value === 'away' ? false : null 
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select...</option>
              <option value="home">Home</option>
              <option value="away">Away</option>
            </select>
          </div>
          <div>
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="competition">Competition *</Label>
            <Input
              id="competition"
              value={formData.competition}
              onChange={(e) =>
                setFormData({ ...formData, competition: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              value={formData.score}
              onChange={(e) =>
                setFormData({ ...formData, score: e.target.value })
              }
              placeholder="e.g., 2-1"
            />
          </div>
          <div>
            <Label htmlFor="rating">Game Rating (1-5 stars)</Label>
            <div className="mt-2">
              <StarRating
                value={formData.rating}
                onChange={(value) =>
                  setFormData({ ...formData, rating: value })
                }
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
