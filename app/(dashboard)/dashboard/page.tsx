"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stats/stat-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { useTeam } from "@/contexts/team-context"
import { useSession } from "next-auth/react"
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog"

interface DashboardStats {
  totalPlayers: number
  totalGames: number
  totalGoals: number
  recentGames: any[]
  activeInjuries: number
  activeIllnesses: number
  wins: number
  losses: number
  draws: number
  goalsAgainst: number
  goalDifference: number
  averageAttendance: number
  topScorers: Array<{ playerId: string; name: string; goals: number }>
  topAssists: Array<{ playerId: string; name: string; assists: number }>
  recentInjuries: Array<{ playerId: string; name: string; type: string; startDate: string }>
}

export default function DashboardPage() {
  const { selectedTeam } = useTeam()
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventType, setEventType] = useState<"game" | "training" | null>(null)

  const user = session?.user as any

  useEffect(() => {
    async function fetchStats() {
      try {
        const playersUrl = selectedTeam?.id 
          ? `/api/players?teamId=${selectedTeam.id}`
          : "/api/players"
        const gamesUrl = selectedTeam?.id
          ? `/api/games?teamId=${selectedTeam.id}`
          : "/api/games"
          
        const trainingsUrl = selectedTeam?.id
          ? `/api/trainings?teamId=${selectedTeam.id}`
          : "/api/trainings"
          
        const [playersRes, gamesRes, trainingsRes] = await Promise.all([
          fetch(playersUrl),
          fetch(gamesUrl),
          fetch(trainingsUrl),
        ])

        if (!playersRes.ok || !gamesRes.ok || !trainingsRes.ok) {
          const errorDetails = {
            players: playersRes.ok ? "OK" : `Error ${playersRes.status}`,
            games: gamesRes.ok ? "OK" : `Error ${gamesRes.status}`,
            trainings: trainingsRes.ok ? "OK" : `Error ${trainingsRes.status}`,
          }
          console.error("Dashboard - API errors:", errorDetails)
          throw new Error(`Failed to fetch dashboard data: ${JSON.stringify(errorDetails)}`)
        }

        const players = await playersRes.json()
        const games = await gamesRes.json()
        const trainings = await trainingsRes.json()
        
        // Debug: Log raw games data
        console.log("Dashboard - Raw games data:", games.length, "games")
        if (games.length > 0) {
          const firstGame = games[0]
          console.log("Dashboard - First game structure:", {
            id: firstGame.id,
            opponent: firstGame.opponent || firstGame.opponentClub?.name,
            hasStats: !!firstGame.stats,
            statsType: Array.isArray(firstGame.stats) ? "array" : typeof firstGame.stats,
            statsLength: firstGame.stats?.length || 0,
            statsSample: firstGame.stats?.[0] || null
          })
        }
        
        // Process games - stats should already be included from API
        const gamesWithStats = games.map((game: any) => {
          // Ensure stats is always an array
          if (!game.stats) {
            game.stats = []
          } else if (!Array.isArray(game.stats)) {
            game.stats = []
          }
          return game
        })
        
        // Log stats summary
        const totalStats = gamesWithStats.reduce((sum: number, g: any) => sum + (g.stats?.length || 0), 0)
        console.log("Dashboard - Total stats across all games:", totalStats)

        // Debug logging
        console.log("Dashboard - Selected Team:", selectedTeam?.id || "None")
        console.log("Dashboard - Players fetched:", players.length)
        console.log("Dashboard - Games fetched:", games.length)
        console.log("Dashboard - Trainings fetched:", trainings.length)
        
        const gamesWithStatsCount = gamesWithStats.filter((g: any) => g.stats && g.stats.length > 0).length
        console.log("Dashboard - Games with stats:", gamesWithStatsCount)
        
        // Log detailed stats for each game
        gamesWithStats.forEach((game: any) => {
          if (game.stats && game.stats.length > 0) {
            const totalGoalsInGame = game.stats.reduce((sum: number, stat: any) => sum + (stat.goals || 0), 0)
            const totalAssistsInGame = game.stats.reduce((sum: number, stat: any) => sum + (stat.assists || 0), 0)
            console.log(`Game ${game.id} (${game.opponent || game.opponentClub?.name}):`, {
              statsCount: game.stats.length,
              totalGoals: totalGoalsInGame,
              totalAssists: totalAssistsInGame,
              score: game.score,
              sampleStat: game.stats[0] ? {
                playerId: game.stats[0].playerId,
                playerName: game.stats[0].player?.name,
                goals: game.stats[0].goals,
                assists: game.stats[0].assists
              } : null
            })
          }
        })

        // Calculate game statistics
        let totalGoals = 0
        let goalsAgainst = 0
        let wins = 0
        let losses = 0
        let draws = 0

        // Player stats aggregation
        const playerStatsMap = new Map<string, { goals: number; assists: number; name: string }>()

        for (const game of gamesWithStats) {
          // Calculate goals from player stats first (more accurate)
          let gameGoalsFromStats = 0
          
          // Aggregate player stats - check if stats array exists and has items
          if (game.stats && Array.isArray(game.stats) && game.stats.length > 0) {
            console.log(`Processing ${game.stats.length} stats for game ${game.id}`)
            for (const stat of game.stats) {
              if (!stat.playerId) {
                console.warn("Stat missing playerId:", stat)
                continue
              }
              
              // Ensure goals and assists are numbers
              const statGoals = Number(stat.goals) || 0
              const statAssists = Number(stat.assists) || 0
              
              // Sum goals from stats
              gameGoalsFromStats += statGoals
              
              const existing = playerStatsMap.get(stat.playerId) || {
                goals: 0,
                assists: 0,
                name: stat.player?.name || "Unknown",
              }
              existing.goals += statGoals
              existing.assists += statAssists
              // Update name if we have it
              if (stat.player?.name && existing.name === "Unknown") {
                existing.name = stat.player.name
              }
              playerStatsMap.set(stat.playerId, existing)
            }
            console.log(`Game ${game.id} - Goals from stats: ${gameGoalsFromStats}`)
          }

          // Parse score for win/loss/draw and opponent goals
          let teamGoalsFromScore = 0
          if (game.score) {
            const scoreParts = game.score.split("-")
            if (scoreParts.length === 2) {
              teamGoalsFromScore = parseInt(scoreParts[0].trim()) || 0
              const oppGoals = parseInt(scoreParts[1].trim()) || 0
              goalsAgainst += oppGoals

              // Use stats goals if available, otherwise use score
              const finalTeamGoals = gameGoalsFromStats > 0 ? gameGoalsFromStats : teamGoalsFromScore
              totalGoals += finalTeamGoals

              if (finalTeamGoals > oppGoals) wins++
              else if (finalTeamGoals < oppGoals) losses++
              else if (finalTeamGoals > 0 || oppGoals > 0) draws++
            }
          } else {
            // No score, but we might have stats
            totalGoals += gameGoalsFromStats
          }
        }

        console.log("Dashboard - Player stats map size:", playerStatsMap.size)
        console.log("Dashboard - Total goals calculated:", totalGoals)
        console.log("Dashboard - Wins:", wins, "Losses:", losses, "Draws:", draws)
        
        if (playerStatsMap.size > 0) {
          const topScorersList = Array.from(playerStatsMap.entries())
            .map(([playerId, stats]) => ({ playerId, name: stats.name, goals: stats.goals }))
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 3)
          console.log("Dashboard - Top 3 scorers:", topScorersList)
        } else {
          console.warn("Dashboard - No player stats found! Check if games have stats included.")
        }

        // Get top scorers and assist providers
        const topScorers = Array.from(playerStatsMap.entries())
          .map(([playerId, stats]) => ({
            playerId,
            name: stats.name,
            goals: stats.goals,
          }))
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 5)

        const topAssists = Array.from(playerStatsMap.entries())
          .map(([playerId, stats]) => ({
            playerId,
            name: stats.name,
            assists: stats.assists,
          }))
          .sort((a, b) => b.assists - a.assists)
          .slice(0, 5)

        // Count active injuries and illnesses
        let activeInjuries = 0
        let activeIllnesses = 0
        const recentInjuries: Array<{ playerId: string; name: string; type: string; startDate: string }> = []

        for (const player of players) {
          // Check both the injuries array and the isInjured boolean
          if (player.injuries && player.injuries.length > 0) {
            activeInjuries++
            const latestInjury = player.injuries[0]
            recentInjuries.push({
              playerId: player.id,
              name: player.name,
              type: latestInjury.type,
              startDate: latestInjury.startDate,
            })
          } else if (player.isInjured) {
            // If player is marked as injured but no injury record exists
            activeInjuries++
            recentInjuries.push({
              playerId: player.id,
              name: player.name,
              type: player.injuryDescription || "Injury",
              startDate: new Date().toISOString(),
            })
          }
          
          // Check both the illnesses array and the isSick boolean
          if (player.illnesses && player.illnesses.length > 0) {
            activeIllnesses++
          } else if (player.isSick) {
            activeIllnesses++
          }
        }

        // Calculate average attendance
        let totalAttendance = 0
        let totalTrainings = 0
        for (const training of trainings) {
          if (training.attendance && training.attendance.length > 0) {
            totalTrainings++
            const attended = training.attendance.filter((att: any) => att.attended).length
            totalAttendance += (attended / training.attendance.length) * 100
          }
        }
        const averageAttendance = totalTrainings > 0 ? totalAttendance / totalTrainings : 0

        // Get recent games (last 5)
        const recentGames = gamesWithStats
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        setStats({
          totalPlayers: players.length,
          totalGames: gamesWithStats.length,
          totalGoals,
          recentGames,
          activeInjuries,
          activeIllnesses,
          wins,
          losses,
          draws,
          goalsAgainst,
          goalDifference: totalGoals - goalsAgainst,
          averageAttendance: Math.round(averageAttendance),
          topScorers,
          topAssists,
          recentInjuries: recentInjuries.slice(0, 5),
        })
        setError(null)
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error)
        setError(error.message || "Failed to load dashboard data")
        // Set default stats on error so UI doesn't break
        setStats({
          totalPlayers: 0,
          totalGames: 0,
          totalGoals: 0,
          recentGames: [],
          activeInjuries: 0,
          activeIllnesses: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          averageAttendance: 0,
          topScorers: [],
          topAssists: [],
          recentInjuries: [],
        })
      } finally {
        setLoading(false)
      }
    }

    // Always fetch stats, even if no team is selected (will fetch all data)
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam?.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium mb-2">Error loading dashboard</p>
        {error && <p className="text-sm text-muted-foreground">{error}</p>}
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const handleRefresh = () => {
    // Refresh stats after creating event
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your team</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setEventType(null)
                setShowEventDialog(true)
              }}
            >
              Create Event
            </Button>
            <Button
              onClick={() => {
                setEventType("game")
                setShowEventDialog(true)
              }}
            >
              Create Game
            </Button>
          </div>
        )}
      </div>

      <CreateEventDialog
        open={showEventDialog}
        onClose={() => {
          setShowEventDialog(false)
          setEventType(null)
        }}
        onSuccess={handleRefresh}
        defaultEventType={eventType}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Players"
          value={stats.totalPlayers.toString()}
          description="Active players"
        />
        <StatCard
          title="Total Games"
          value={stats.totalGames.toString()}
          description={`${stats.wins}W ${stats.draws}D ${stats.losses}L`}
        />
        <StatCard
          title="Goal Difference"
          value={stats.goalDifference >= 0 ? `+${stats.goalDifference}` : stats.goalDifference.toString()}
          description={`${stats.totalGoals} for, ${stats.goalsAgainst} against`}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.averageAttendance}%`}
          description="Average training attendance"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Goals"
          value={stats.totalGoals.toString()}
          description="Goals scored"
        />
        <StatCard
          title="Active Issues"
          value={(stats.activeInjuries + stats.activeIllnesses).toString()}
          description={`${stats.activeInjuries} injuries, ${stats.activeIllnesses} illnesses`}
        />
        <StatCard
          title="Win Rate"
          value={stats.totalGames > 0 ? `${Math.round((stats.wins / stats.totalGames) * 100)}%` : "0%"}
          description={`${stats.wins} wins`}
        />
        <StatCard
          title="Top Scorer"
          value={stats.topScorers[0]?.goals.toString() || "0"}
          description={stats.topScorers[0]?.name || "N/A"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Latest game results</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGames.length === 0 ? (
              <p className="text-sm text-muted-foreground">No games yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <Link href={`/games/${game.id}`} className="font-medium hover:underline text-primary">
                        {game.opponentClub?.name || game.opponent}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(game.date), "MMM d, yyyy")} - {game.venue}
                      </p>
                    </div>
                    <div className="text-right">
                      {game.score && (
                        <p className="font-medium">{game.score}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {game.competitionRelation?.name || game.competition}
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  href="/games"
                  className="text-sm text-primary hover:underline"
                >
                  View all games →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Leading scorers and assist providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Top Scorers</h4>
                {stats.topScorers.length > 0 ? (
                  <div className="space-y-1">
                    {stats.topScorers.slice(0, 3).map((scorer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <Link
                          href={`/players/${scorer.playerId}`}
                          className="text-primary hover:underline"
                        >
                          {scorer.name}
                        </Link>
                        <span className="font-medium">{scorer.goals} goals</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No goals recorded</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Top Assists</h4>
                {stats.topAssists.length > 0 ? (
                  <div className="space-y-1">
                    {stats.topAssists.slice(0, 3).map((assist, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <Link
                          href={`/players/${assist.playerId}`}
                          className="text-primary hover:underline"
                        >
                          {assist.name}
                        </Link>
                        <span className="font-medium">{assist.assists} assists</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No assists recorded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Injury & Wellness</CardTitle>
            <CardDescription>Recent injuries and health status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentInjuries.length > 0 ? (
              <div className="space-y-2">
                {stats.recentInjuries.map((injury, idx) => (
                  <div key={idx} className="text-sm border-b pb-2">
                    <Link
                      href={`/players/${injury.playerId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {injury.name}
                    </Link>
                    <p className="text-muted-foreground">
                      {injury.type} • {format(new Date(injury.startDate), "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active injuries</p>
            )}
            <Link
              href="/players"
              className="text-sm text-primary hover:underline mt-4 block"
            >
              View all players →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { href: "/players", label: "Players" },
              { href: "/games", label: "Games" },
              { href: "/trainings", label: "Training" },
              { href: "/tournaments", label: "Tournaments" },
              { href: "/statistics", label: "Stats" },
              { href: "/trainings/analytics", label: "Analytics" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center p-3 rounded-lg border hover:bg-muted transition-colors text-center"
              >
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

