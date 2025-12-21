"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { GameScoreboard } from "@/components/games/game-scoreboard"
import { MatchSquadSection } from "@/components/games/match-squad-section"
import { MatchReportSection } from "@/components/games/match-report-section"
import { GameLineupManager } from "@/components/games/game-lineup-manager"
import { GeneratedMatchReport } from "@/components/games/generated-match-report"
import { useTeam } from "@/contexts/team-context"
import Link from "next/link"
import { StarRating } from "@/components/ui/star-rating"
import { canDelete } from "@/lib/permissions"

function GameDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opponentGoals, setOpponentGoals] = useState(0)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("squad")
  const [squadSaving, setSquadSaving] = useState(false)
  const saveSquadRef = useRef<((suppressAlert?: boolean) => Promise<void>) | undefined>()
  const [isFinished, setIsFinished] = useState(false)
  const [players, setPlayers] = useState<any[]>([])
  const [gameStats, setGameStats] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const saveLineupRef = useRef<(() => Promise<void>) | undefined>()
  const saveReportRef = useRef<(() => Promise<void>) | undefined>()
  const saveReportAndNextRef = useRef<(() => Promise<void>) | undefined>()

  const user = session?.user as any
  const { selectedTeam } = useTeam()

  useEffect(() => {
    async function fetchGame() {
      try {
        console.log("Fetching game with ID:", params.id)
        setError(null)
        if (!params.id) {
          console.error("Game ID is missing")
          setError("Game ID is missing")
          setLoading(false)
          return
        }
        const res = await fetch(`/api/games/${params.id}`)
        console.log("Game fetch response status:", res.status)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to fetch game" }))
          console.error("Game fetch error:", errorData)
          setError(errorData.error || `Failed to load game (Status: ${res.status})`)
          setGame(null)
          setLoading(false)
          return
        }
        const data = await res.json()
        console.log("Game data loaded:", data.id)
        setGame(data)
        // Parse opponent goals from score if available, or set to 0
        if (data.score) {
          const scoreParts = data.score.split("-")
          if (scoreParts.length === 2) {
            // Assuming format is "teamGoals-opponentGoals"
            setOpponentGoals(parseInt(scoreParts[1].trim()) || 0)
          }
        }
        if (data.opponentGoals !== undefined) {
          setOpponentGoals(data.opponentGoals)
        }
      } catch (error: any) {
        console.error("Error fetching game:", error)
        setError(error.message || "Failed to load game. Please try again.")
        setGame(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchGame()
    } else {
      console.error("No game ID in params")
      setLoading(false)
      setError("Invalid game ID")
    }
  }, [params.id])

  // Handle tab query parameter changes
  useEffect(() => {
    try {
      const tabParam = searchParams?.get("tab")
      if (tabParam && ["stats", "squad", "report", "manage", "ai-report"].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    } catch (error) {
      console.error("Error reading search params:", error)
      // Continue with default tab
    }
  }, [searchParams])

  // Calculate total team goals from player stats
  const [teamGoals, setTeamGoals] = useState(0)

  useEffect(() => {
    if (game?.stats) {
      const calculated = game.stats.reduce((total: number, stat: any) => total + (stat.goals || 0), 0)
      setTeamGoals(calculated)
    }
  }, [game?.stats])

  const handleTeamGoalChange = async (newGoals: number) => {
    setTeamGoals(newGoals)
    // Update the game score in the database
    try {
      const score = `${newGoals}-${opponentGoals}`
      await fetch(`/api/games/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...game,
          score,
        }),
      })
    } catch (error) {
      console.error("Error updating team goals:", error)
    }
  }

  const handleOpponentGoalChange = async (newGoals: number) => {
    setOpponentGoals(newGoals)
    // Update the game score in the database
    try {
      const score = `${teamGoals}-${newGoals}`
      await fetch(`/api/games/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...game,
          score,
          opponentGoals: newGoals,
        }),
      })
    } catch (error) {
      console.error("Error updating opponent goals:", error)
    }
  }

  const handleSaveAndNext = async (currentTab: string) => {
    const tabs = ["squad", "manage", "stats", "report"]
    const currentIndex = tabs.indexOf(currentTab)
    
    if (currentIndex === -1) return
    
    try {
      setSquadSaving(true)
      
      // Save current tab's data
      if (currentTab === "squad" && saveSquadRef.current) {
        await saveSquadRef.current(true) // Suppress alert
      } else if (currentTab === "manage" && saveLineupRef.current) {
        await saveLineupRef.current()
      } else if ((currentTab === "stats" || currentTab === "report") && saveReportRef.current) {
        await saveReportRef.current()
      }
      
      // Navigate to next tab
      if (currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1]
        setActiveTab(nextTab)
        router.push(`/games/${params.id}?tab=${nextTab}`, { scroll: false })
      } else {
        alert("You are on the last tab. All data has been saved.")
      }
    } catch (error) {
      console.error("Error saving and navigating:", error)
      alert("Failed to save data. Please try again.")
    } finally {
      setSquadSaving(false)
    }
  }

  // Fetch players and stats for manage tab
  useEffect(() => {
    if (activeTab === "manage" && game) {
      async function fetchManageData() {
        try {
          setLoadingStats(true)
          // Build players URL with teamId if available
          let playersUrl = "/api/players"
          if (selectedTeam?.id) {
            playersUrl = `/api/players?teamId=${selectedTeam.id}&includeBorrowed=true`
          }
          
          const [playersRes, statsRes, squadRes] = await Promise.all([
            fetch(playersUrl),
            fetch(`/api/games/${params.id}/stats`),
            fetch(`/api/games/${params.id}/squad`).catch(() => null), // Squad may not exist
          ])

          const playersData = await playersRes.json()
          const statsData = await statsRes.json()
          const squadData = squadRes?.ok ? await squadRes.json() : []

          setPlayers(playersData)
          
          // Merge squad data with existing stats
          let mergedStats = statsData
          
          if (statsData.length === 0 && squadData.length > 0) {
            // Convert squad data to stats format
            const allPlayersMap = new Map(playersData.map((p: any) => [p.id, p]))
            
            // Fetch all players that might be in squad (including from other teams)
            const missingPlayers: any[] = []
            
            for (const squadEntry of squadData) {
              if (!allPlayersMap.has(squadEntry.playerId)) {
                // Player not in current team, fetch their data
                try {
                  const playerRes = await fetch(`/api/players/${squadEntry.playerId}`)
                  if (playerRes.ok) {
                    const playerData = await playerRes.json()
                    allPlayersMap.set(squadEntry.playerId, playerData)
                    missingPlayers.push(playerData)
                  }
                } catch (error) {
                  console.error(`Error fetching player ${squadEntry.playerId}:`, error)
                }
              }
            }
            
            // Add missing players to players list
            if (missingPlayers.length > 0) {
              setPlayers([...playersData, ...missingPlayers])
            }
            
            // Convert squad to stats format
            mergedStats = squadData.map((entry: any) => {
              const player = allPlayersMap.get(entry.playerId) || entry.player
              // Use jersey number from squad entry if available, otherwise from player
              const jerseyNumber = entry.jerseyNumber !== undefined && entry.jerseyNumber !== null 
                ? entry.jerseyNumber 
                : (player?.jerseyNumber || null)
              return {
                playerId: entry.playerId,
                player: player ? { ...player, jerseyNumber } : { id: entry.playerId, name: "Unknown", position: "", jerseyNumber },
                minutes: 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                rating: null,
                started: entry.isStartingXI || false,
                position: entry.position || player?.position || "",
                jerseyNumber: jerseyNumber,
              }
            })
          }
          
          setGameStats(mergedStats)
        } catch (error) {
          console.error("Error fetching manage data:", error)
        } finally {
          setLoadingStats(false)
        }
      }

      fetchManageData()
    }
  }, [activeTab, game, params.id, selectedTeam?.id])

  const handleSaveLineup = async (lineup: { starting11: any[], substitutes: any[], coach: string, finalScore?: string, isHome?: boolean | null }) => {
    try {
      const allPlayers = [...lineup.starting11, ...lineup.substitutes]
      const gameDuration = game?.duration || 90

      // Save match information (final score, isHome)
      if (lineup.finalScore !== undefined || lineup.isHome !== undefined) {
        const gameUpdateData: any = {}
        if (lineup.finalScore !== undefined) {
          gameUpdateData.score = lineup.finalScore || null
        }
        if (lineup.isHome !== undefined) {
          gameUpdateData.isHome = lineup.isHome
        }

        await fetch(`/api/games/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gameUpdateData),
        })
      }
      
      // Helper function to calculate minutes (same logic as in GameLineupManager)
      const calculatePlayerMinutes = (player: any) => {
        let totalMinutes = 0
        
        if (player.started) {
          if (player.substitutions && player.substitutions.length > 0) {
            const firstSub = player.substitutions[0]
            if (firstSub.outMinute) {
              totalMinutes += firstSub.outMinute
            } else if (player.substitutionMinute) {
              totalMinutes += player.substitutionMinute
            } else {
              totalMinutes += gameDuration
            }
            
            for (let i = 1; i < player.substitutions.length; i++) {
              const sub = player.substitutions[i]
              if (sub.inMinute && sub.outMinute) {
                totalMinutes += (sub.outMinute - sub.inMinute)
              } else if (sub.inMinute) {
                totalMinutes += (gameDuration - sub.inMinute)
              }
            }
          } else if (player.substitutionMinute) {
            totalMinutes += player.substitutionMinute
          } else {
            totalMinutes += gameDuration
          }
        } else {
          if (player.substitutions && player.substitutions.length > 0) {
            player.substitutions.forEach((sub: any) => {
              if (sub.inMinute && sub.outMinute) {
                totalMinutes += Math.max(0, sub.outMinute - sub.inMinute)
              } else if (sub.inMinute) {
                totalMinutes += Math.max(0, gameDuration - sub.inMinute)
              }
            })
          } else if (player.substitutionInMinute) {
            if (player.substitutionMinute) {
              totalMinutes += Math.max(0, player.substitutionMinute - player.substitutionInMinute)
            } else {
              totalMinutes += Math.max(0, gameDuration - player.substitutionInMinute)
            }
          }
        }
        
        return Math.max(0, totalMinutes)
      }
      
      // Save each player's stats
      for (const player of allPlayers) {
        const calculatedMinutes = calculatePlayerMinutes(player)
        
        const statData = {
          playerId: player.playerId,
          minutes: calculatedMinutes,
          goals: player.goals,
          assists: player.assists,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          rating: player.rating,
          started: player.started,
          position: player.position,
          substitutionMinute: player.substitutionMinute,
          substitutionInMinute: player.substitutionInMinute,
          substitutedBy: player.substitutedBy,
          substitutions: player.substitutions ? JSON.stringify(player.substitutions) : null,
          goalMinutes: JSON.stringify(player.goalMinutes || []),
          assistMinutes: JSON.stringify(player.assistMinutes || []),
        }

        const res = await fetch(`/api/games/${params.id}/stats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statData),
        })

        if (!res.ok) {
          throw new Error(`Failed to save stats for ${player.playerName}`)
        }
      }

      // Refresh game data to update stats and match information
      const gameRes = await fetch(`/api/games/${params.id}`)
      const gameData = await gameRes.json()
      setGame(gameData)

      alert("Lineup and statistics saved successfully!")
    } catch (error) {
      console.error("Error saving lineup:", error)
      alert("Failed to save lineup. Please try again.")
    }
  }

  const handleGoalsChange = (newGoals: number) => {
    setTeamGoals(newGoals)
    handleTeamGoalChange(newGoals)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading game...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive font-medium">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
          <Button onClick={() => router.push("/games")} variant="secondary">
            Back to Games
          </Button>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">Game not found</p>
        <Button onClick={() => router.push("/games")} variant="outline">
          Back to Games
        </Button>
      </div>
    )
  }

  if (!params.id) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Invalid game ID</p>
        <Button onClick={() => router.push("/games")} variant="outline">
          Back to Games
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/games/${params.id}/edit`)}>
              Edit Game
            </Button>
            {canDelete(user.role) && (
              <Button
                variant="destructive"
                onClick={async () => {
                  if (
                    !confirm("Are you sure you want to delete this game? This action cannot be undone.")
                  ) {
                    return
                  }
                  try {
                    const res = await fetch(`/api/games/${params.id}`, {
                      method: "DELETE",
                    })
                    if (res.ok) {
                      router.push("/games")
                    } else {
                      const error = await res.json()
                      alert(error.error || "Failed to delete game")
                    }
                  } catch (error) {
                    console.error("Error deleting game:", error)
                    alert("An error occurred. Please try again.")
                  }
                }}
              >
                Delete Game
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Finish Confirmation and Close Button */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="finish-confirmation"
            checked={isFinished}
            onCheckedChange={(checked) => setIsFinished(checked as boolean)}
          />
          <Label htmlFor="finish-confirmation" className="text-sm font-medium cursor-pointer">
            I have finished entering all data for this game
          </Label>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          disabled={!isFinished}
          variant="outline"
        >
          Close
        </Button>
      </div>

      {/* Scoreboard */}
      <GameScoreboard
        teamName={game.team?.name || "Djugarden F2011-A"}
        opponent={game.opponentClub?.name || game.opponent}
        teamGoals={teamGoals}
        opponentGoals={opponentGoals}
        onTeamGoalChange={handleTeamGoalChange}
        onOpponentGoalChange={handleOpponentGoalChange}
        isEditable={user?.role === "ADMIN" || user?.role === "COACH"}
        isHome={game.isHome}
        teamLogo={game.team?.logo || null}
        opponentLogo={game.opponentClub?.logo || game.opponentLogo || null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {format(new Date(game.date), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p>
              <span className="font-medium">Venue:</span> {game.venue}
            </p>
            <p>
              <span className="font-medium">Competition:</span> {game.competition}
            </p>
            {game.rating && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Game Rating:</span>
                <StarRating value={game.rating} readonly size="md" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="squad">Squad Selection</TabsTrigger>
            <TabsTrigger value="manage">Manage Players & Statistics</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="report">Match Report</TabsTrigger>
            <TabsTrigger value="ai-report">AI Report</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {activeTab === "squad" && (user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
              <>
                <Button 
                  onClick={async () => {
                    if (saveSquadRef.current) {
                      try {
                        await saveSquadRef.current(false)
                      } catch (error) {
                        console.error("Error saving squad:", error)
                      }
                    }
                  }}
                  disabled={squadSaving}
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save Squad"}
                </Button>
                <Button 
                  onClick={() => handleSaveAndNext("squad")}
                  disabled={squadSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save and Next"}
                </Button>
              </>
            )}
            {activeTab === "manage" && (user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
              <>
                <Button 
                  onClick={() => {
                    if (saveLineupRef.current) {
                      saveLineupRef.current()
                    }
                  }}
                  size="lg"
                >
                  Save Lineup & Statistics
                </Button>
                <Button 
                  onClick={() => handleSaveAndNext("manage")}
                  disabled={squadSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save and Next"}
                </Button>
                <Button 
                  onClick={() => {
                    if (saveReportRef.current) {
                      saveReportRef.current()
                    }
                  }}
                  disabled={squadSaving}
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save Report"}
                </Button>
              </>
            )}
            {activeTab === "stats" && (user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
              <>
                <Button 
                  onClick={() => handleSaveAndNext("stats")}
                  disabled={squadSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save and Next"}
                </Button>
                <Button 
                  onClick={() => {
                    if (saveReportRef.current) {
                      saveReportRef.current()
                    }
                  }}
                  disabled={squadSaving}
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save Report"}
                </Button>
              </>
            )}
            {activeTab === "report" && (user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
              <>
                <Button 
                  onClick={() => handleSaveAndNext("report")}
                  disabled={squadSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save and Next"}
                </Button>
                <Button 
                  onClick={() => {
                    if (saveReportRef.current) {
                      saveReportRef.current()
                    }
                  }}
                  disabled={squadSaving}
                  size="lg"
                >
                  {squadSaving ? "Saving..." : "Save Report"}
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {game.stats && game.stats.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Minutes</TableHead>
                        <TableHead>Goals</TableHead>
                        <TableHead>Assists</TableHead>
                        <TableHead>Yellow Cards</TableHead>
                        <TableHead>Red Cards</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.stats.map((stat: any) => (
                        <TableRow key={stat.id}>
                          <TableCell>
                            <Link href={`/players/${stat.player.id}`} className="hover:underline text-primary">
                              {stat.player.name}
                            </Link>
                          </TableCell>
                          <TableCell>{stat.minutes}</TableCell>
                          <TableCell>{stat.goals}</TableCell>
                          <TableCell>{stat.assists}</TableCell>
                          <TableCell>{stat.yellowCards}</TableCell>
                          <TableCell>{stat.redCards}</TableCell>
                          <TableCell>
                            {stat.rating ? (
                              <StarRating 
                                value={Math.max(1, Math.min(5, stat.rating))} 
                                readonly 
                                size="sm" 
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No player statistics recorded for this game
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="squad">
          <MatchSquadSection
            gameId={params.id as string}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER"}
            onSaveRef={saveSquadRef}
            game={game}
            onGameUpdate={(updatedGame) => {
              setGame(updatedGame)
            }}
          />
        </TabsContent>

        <TabsContent value="manage">
          {loadingStats ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <GameLineupManager
              gameId={params.id as string}
              players={players}
              initialStats={gameStats}
              game={game}
              onSave={handleSaveLineup}
              onGoalsChange={handleGoalsChange}
              onSaveRef={saveLineupRef}
            />
          )}
        </TabsContent>

        <TabsContent value="report">
          <MatchReportSection
            gameId={params.id as string}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER"}
            onSaveRef={saveReportRef}
            onSaveAndNextRef={saveReportAndNextRef}
            onSaveAndNext={() => handleSaveAndNext("report")}
            saveAndNextLoading={squadSaving}
          />
        </TabsContent>

        <TabsContent value="ai-report">
          <GeneratedMatchReport
            gameId={params.id as string}
            game={game}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <GameDetailContent />
    </Suspense>
  )
}
