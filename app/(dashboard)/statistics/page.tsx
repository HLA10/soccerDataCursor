"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"
import Link from "next/link"

interface Game {
  id: string
  date: string
  opponent: string
  venue: string
  competition: string
  score: string | null
  stats?: GameStat[]
}

interface GameStat {
  id: string
  playerId: string
  gameId: string
  minutes: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  player?: {
    id: string
    name: string
  }
}

interface Player {
  id: string
  name: string
  position: string
  jerseyNumber: number | null
}

interface TeamStats {
  games: number
  wins: number
  losses: number
  draws: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

interface PlayerStat {
  id: string
  name: string
  games: number
  goals: number
  assists: number
  minutes: number
  yellow: number
  red: number
}

export default function StatisticsPage() {
  const { data: session } = useSession()
  const { selectedTeam } = useTeam()
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const [competitionType, setCompetitionType] = useState("all")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [playerSearch, setPlayerSearch] = useState("")

  useEffect(() => {
    async function fetchData() {
      if (!selectedTeam?.id) {
        setGames([])
        setPlayers([])
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        params.append("teamId", selectedTeam.id)

        // Fetch games (always team-specific)
        const gamesRes = await fetch(`/api/games?${params.toString()}`)
        const gamesData = await gamesRes.json()

        // Fetch players - if searching, get all players matching search, otherwise get team players
        let playersRes
        if (playerSearch.trim()) {
          // Search all players in database
          const searchParams = new URLSearchParams()
          searchParams.append("search", playerSearch.trim())
          playersRes = await fetch(`/api/players?${searchParams.toString()}`)
        } else {
          // Get team players
          playersRes = await fetch(`/api/players?${params.toString()}`)
        }
        const playersData = await playersRes.json()

        // Fetch stats for each game
        const gamesWithStats = await Promise.all(
          gamesData.map(async (game: Game) => {
            try {
              const statsRes = await fetch(`/api/games/${game.id}/stats`)
              const stats = await statsRes.json()
              return { ...game, stats }
            } catch {
              return { ...game, stats: [] }
            }
          })
        )

        setGames(gamesWithStats)
        setPlayers(playersData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTeam, playerSearch])

  // Parse score string to extract goals (e.g., "2-1" -> { for: 2, against: 1 })
  const parseScore = (score: string | null): { for: number; against: number } => {
    if (!score) return { for: 0, against: 0 }
    const parts = score.split("-").map((s) => parseInt(s.trim()) || 0)
    return { for: parts[0] || 0, against: parts[1] || 0 }
  }

  // Filter games by time period
  const filteredByPeriod = useMemo(() => {
    if (period === "all") return games

    const now = new Date()

    return games.filter((game) => {
      const d = new Date(game.date)

      if (period === "week") {
        const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        return d >= weekAgo
      }

      if (period === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return d >= monthAgo
      }

      if (period === "year") {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        return d >= yearAgo
      }

      if (period === "custom" && customFrom && customTo) {
        const from = new Date(customFrom)
        const to = new Date(customTo)
        to.setHours(23, 59, 59, 999) // Include the entire end date
        return d >= from && d <= to
      }

      return true
    })
  }, [games, period, customFrom, customTo])

  // Filter by competition type
  const filteredGames = useMemo(() => {
    if (competitionType === "all") return filteredByPeriod
    return filteredByPeriod.filter((game) => {
      const comp = game.competition.toLowerCase()
      return comp.includes(competitionType.toLowerCase())
    })
  }, [filteredByPeriod, competitionType])

  // Calculate team statistics
  const teamStats = useMemo((): TeamStats => {
    const stats: TeamStats = {
      games: filteredGames.length,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }

    filteredGames.forEach((game) => {
      const score = parseScore(game.score)
      stats.goalsFor += score.for
      stats.goalsAgainst += score.against

      if (score.for > score.against) stats.wins++
      else if (score.for < score.against) stats.losses++
      else if (score.for > 0 || score.against > 0) stats.draws++
    })

    stats.goalDifference = stats.goalsFor - stats.goalsAgainst

    return stats
  }, [filteredGames])

  // Calculate player statistics
  const playerStats = useMemo((): PlayerStat[] => {
    const statsMap = new Map<string, PlayerStat>()

    // Initialize all players
    players.forEach((player) => {
      statsMap.set(player.id, {
        id: player.id,
        name: player.name,
        games: 0,
        goals: 0,
        assists: 0,
        minutes: 0,
        yellow: 0,
        red: 0,
      })
    })

    // Aggregate stats from filtered games
    filteredGames.forEach((game) => {
      if (!game.stats) return

      game.stats.forEach((stat) => {
        const playerStat = statsMap.get(stat.playerId)
        if (!playerStat) return

        playerStat.games++
        playerStat.goals += stat.goals || 0
        playerStat.assists += stat.assists || 0
        playerStat.minutes += stat.minutes || 0
        playerStat.yellow += stat.yellowCards || 0
        playerStat.red += stat.redCards || 0
      })
    })

    // Sort by goals (descending), then assists, then games
    return Array.from(statsMap.values()).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals
      if (b.assists !== a.assists) return b.assists - a.assists
      return b.games - a.games
    })
  }, [filteredGames, players])

  // Filter player statistics by search query
  const filteredPlayerStats = useMemo(() => {
    if (!playerSearch.trim()) return playerStats
    
    const searchLower = playerSearch.toLowerCase()
    return playerStats.filter(player => 
      player.name.toLowerCase().includes(searchLower)
    )
  }, [playerStats, playerSearch])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Team Statistics</h1>
        <p className="text-muted-foreground">View team and player performance statistics</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Filter */}
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {period === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Competition Filter */}
            <div className="space-y-2">
              <Label htmlFor="competition">Competition Type</Label>
              <select
                id="competition"
                value={competitionType}
                onChange={(e) => setCompetitionType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Competitions</option>
                <option value="league">League</option>
                <option value="tournament">Tournament</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Team Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.games}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Games</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.wins}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Wins</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.draws}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Draws</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.losses}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Losses</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.goalsFor}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Goals For</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">{teamStats.goalsAgainst}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Goals Against</div>
            </div>
            <div className="text-center p-3 border rounded-md bg-background">
              <div className="text-xl font-semibold text-foreground">
                {teamStats.goalDifference > 0 ? "+" : ""}
                {teamStats.goalDifference}
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">Goal Difference</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Player Statistics</CardTitle>
            <div className="w-64">
              <Input
                placeholder="Search players..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Minutes</TableHead>
                  <TableHead className="text-center">Yellow Cards</TableHead>
                  <TableHead className="text-center">Red Cards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayerStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {playerSearch ? "No players found matching your search" : "No player statistics available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayerStats.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <Link href={`/players/${player.id}`} className="hover:underline text-primary">
                          {player.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{player.games}</TableCell>
                      <TableCell className="text-center font-semibold">{player.goals}</TableCell>
                      <TableCell className="text-center">{player.assists}</TableCell>
                      <TableCell className="text-center">{player.minutes}</TableCell>
                      <TableCell className="text-center">{player.yellow}</TableCell>
                      <TableCell className="text-center">{player.red}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



