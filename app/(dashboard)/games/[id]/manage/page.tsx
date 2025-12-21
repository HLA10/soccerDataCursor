"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { GameLineupManager } from "@/components/games/game-lineup-manager"
import { GameScoreboard } from "@/components/games/game-scoreboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useTeam } from "@/contexts/team-context"

export default function ManageGamePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [game, setGame] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [gameStats, setGameStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [opponentGoals, setOpponentGoals] = useState(0)
  const [currentTeamGoals, setCurrentTeamGoals] = useState(0)

  const user = session?.user as any
  const { selectedTeam } = useTeam()

  useEffect(() => {
    async function fetchData() {
      try {
        // Build players URL with teamId if available
        let playersUrl = "/api/players"
        if (selectedTeam?.id) {
          playersUrl = `/api/players?teamId=${selectedTeam.id}&includeBorrowed=true`
        }
        
        const [gameRes, playersRes, statsRes, squadRes] = await Promise.all([
          fetch(`/api/games/${params.id}`),
          fetch(playersUrl),
          fetch(`/api/games/${params.id}/stats`),
          fetch(`/api/games/${params.id}/squad`).catch(() => null), // Squad may not exist
        ])

        const gameData = await gameRes.json()
        const playersData = await playersRes.json()
        const statsData = await statsRes.json()
        const squadData = squadRes?.ok ? await squadRes.json() : []

        setGame(gameData)
        setPlayers(playersData)
        
        // Merge squad data with existing stats
        // If stats exist, use them; otherwise, use squad data to pre-populate
        let mergedStats = statsData
        
        if (statsData.length === 0 && squadData.length > 0) {
          // Convert squad data to stats format
          const allPlayersMap = new Map(playersData.map((p: any) => [p.id, p]))
          
          // Fetch all players that might be in squad (including from other teams)
          const squadPlayerIds = squadData.map((s: any) => s.playerId)
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
            return {
              playerId: entry.playerId,
              player: player || { id: entry.playerId, name: "Unknown", position: "", jerseyNumber: null },
              minutes: 0,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
              rating: null,
              started: entry.isStartingXI || false,
              position: entry.position || player?.position || "",
              jerseyNumber: entry.jerseyNumber || player?.jerseyNumber || null,
            }
          })
        }
        
        setGameStats(mergedStats)
        
        // Calculate initial team goals from stats
        const initialTeamGoals = mergedStats.reduce((total: number, stat: any) => total + (stat.goals || 0), 0)
        setCurrentTeamGoals(initialTeamGoals)
        
        // Parse opponent goals from score if available
        if (gameData.score) {
          const scoreParts = gameData.score.split("-")
          if (scoreParts.length === 2) {
            setOpponentGoals(parseInt(scoreParts[1].trim()) || 0)
          }
        }
        if (gameData.opponentGoals !== undefined) {
          setOpponentGoals(gameData.opponentGoals)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, selectedTeam])

  const handleTeamGoalChange = async (newGoals: number) => {
    setCurrentTeamGoals(newGoals)
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
      setGame({ ...game, score })
    } catch (error) {
      console.error("Error updating team goals:", error)
    }
  }

  const handleOpponentGoalChange = async (newGoals: number) => {
    setOpponentGoals(newGoals)
    // Update the game score in the database
    try {
      const score = `${currentTeamGoals}-${newGoals}`
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
      setGame({ ...game, score, opponentGoals: newGoals })
    } catch (error) {
      console.error("Error updating opponent goals:", error)
    }
  }

  const handleSaveLineup = async (lineup: { starting11: any[], substitutes: any[], coach: string }) => {
    setSaving(true)
    try {
      const allPlayers = [...lineup.starting11, ...lineup.substitutes]
      const gameDuration = game?.duration || 90
      
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
        
        // Ensure we never return negative minutes
        return Math.max(0, totalMinutes)
      }
      
      // Save each player's stats
      for (const player of allPlayers) {
        // Recalculate minutes based on substitution times
        const calculatedMinutes = calculatePlayerMinutes(player)
        
        const statData = {
          playerId: player.playerId,
          minutes: calculatedMinutes, // Use calculated minutes, not stored minutes
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

      alert("Lineup and statistics saved successfully!")
      router.push(`/games/${params.id}`)
    } catch (error) {
      console.error("Error saving lineup:", error)
      alert("Failed to save lineup. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!game) {
    return <div className="text-center py-8">Game not found</div>
  }

  if (user?.role !== "ADMIN" && user?.role !== "COACH") {
    return <div className="text-center py-8">You don't have permission to manage games</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Manage Game: vs {game.opponent}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(game.date), "MMMM d, yyyy")} • {game.venue} • {game.competition}
          </p>
        </div>
      </div>

      {/* Scoreboard */}
      <GameScoreboard
        teamName={game.team?.name || "Djugarden F2011-A"}
        opponent={game.opponentClub?.name || game.opponent}
        teamGoals={currentTeamGoals}
        opponentGoals={opponentGoals}
        onTeamGoalChange={handleTeamGoalChange}
        onOpponentGoalChange={handleOpponentGoalChange}
        isEditable={true}
        isHome={game.isHome}
        teamLogo={game.team?.logo || null}
        opponentLogo={game.opponentClub?.logo || null}
      />

      <GameLineupManager
        gameId={params.id as string}
        players={players}
        initialStats={gameStats}
        game={game}
        onSave={handleSaveLineup}
        onGoalsChange={setCurrentTeamGoals}
      />
    </div>
  )
}

