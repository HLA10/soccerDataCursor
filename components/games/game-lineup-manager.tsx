"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SoccerField } from "./soccer-field"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import PlayerSearch from "@/components/players/player-search"
import Link from "next/link"
import { StarRating } from "@/components/ui/star-rating"

interface Player {
  id: string
  name: string
  position: string
  jerseyNumber?: number
}

interface SubstitutionEntry {
  inMinute?: number
  outMinute?: number
  replacedBy?: string
}

interface LineupPlayer {
  playerId: string
  playerName: string
  position: string
  jerseyNumber?: number
  minutes: number
  goals: number
  goalMinutes: number[]
  assists: number
  assistMinutes: number[]
  yellowCards: number
  redCards: number
  rating?: number
  started: boolean
  substitutionMinute?: number
  substitutionInMinute?: number
  substitutedBy?: string
  substitutedByName?: string
  substitutions?: SubstitutionEntry[] // Multiple substitution entries for tournament rules
}

interface GameLineupManagerProps {
  gameId: string
  players: Player[]
  initialStats?: any[]
  game?: any
  onSave: (lineup: { starting11: LineupPlayer[], substitutes: LineupPlayer[], coach: string, finalScore?: string, isHome?: boolean | null }) => void | Promise<void>
  onGoalsChange?: (teamGoals: number) => void
  onSaveRef?: React.MutableRefObject<(() => Promise<void>) | undefined>
}

export function GameLineupManager({ gameId, players, initialStats, game, onSave, onGoalsChange, onSaveRef }: GameLineupManagerProps) {
  const [formation, setFormation] = useState("4-4-2")
  const [coach, setCoach] = useState("")
  const [starting11, setStarting11] = useState<LineupPlayer[]>([])
  const [substitutes, setSubstitutes] = useState<LineupPlayer[]>([])
  const [selectedPlayerForSub, setSelectedPlayerForSub] = useState<string | null>(null)
  const [starterSearch, setStarterSearch] = useState("")
  const [subSearch, setSubSearch] = useState("")
  const [finalScore, setFinalScore] = useState(game?.score || "")
  const [isHome, setIsHome] = useState<boolean | null>(game?.isHome ?? null)
  
  // Get game duration, default to 90 minutes if not set
  const gameDuration = game?.duration || 90

  // Determine max players based on formation type (11v11, 9v9, 7v7)
  // Check competition name or customType for formation type indicators
  const getMaxPlayers = (): number => {
    const competitionName = game?.competitionRelation?.name || game?.competition || ""
    const customType = game?.competitionRelation?.customType || ""
    const searchText = `${competitionName} ${customType}`.toLowerCase()
    
    // Check for 7v7 indicators
    if (searchText.includes("7v7") || searchText.includes("7 vs 7") || searchText.includes("7-7")) {
      return 7
    }
    // Check for 9v9 indicators
    if (searchText.includes("9v9") || searchText.includes("9 vs 9") || searchText.includes("9-9")) {
      return 9
    }
    // Default to 11v11
    return 11
  }

  const maxPlayers = getMaxPlayers()

  // Update finalScore and isHome when game prop changes
  useEffect(() => {
    if (game?.score !== undefined) {
      setFinalScore(game.score || "")
    }
    if (game?.isHome !== undefined) {
      setIsHome(game.isHome)
    }
  }, [game?.score, game?.isHome])

  useEffect(() => {
    if (initialStats) {
      const starting = initialStats
        .filter((stat: any) => stat.started)
        .map((stat: any) => ({
          playerId: stat.playerId,
          playerName: stat.player.name,
          position: stat.position || stat.player.position || "",
          jerseyNumber: stat.jerseyNumber !== undefined && stat.jerseyNumber !== null ? stat.jerseyNumber : stat.player.jerseyNumber,
          minutes: stat.minutes || 0,
          goals: stat.goals || 0,
          goalMinutes: stat.goalMinutes ? JSON.parse(stat.goalMinutes) : [],
          assists: stat.assists || 0,
          assistMinutes: stat.assistMinutes ? JSON.parse(stat.assistMinutes) : [],
          yellowCards: stat.yellowCards || 0,
          redCards: stat.redCards || 0,
          rating: stat.rating,
          started: true,
          substitutionMinute: stat.substitutionMinute,
          substitutionInMinute: stat.substitutionInMinute,
          substitutedBy: stat.substitutedBy,
          substitutedByName: stat.substitutedBy ? stat.substitutedByPlayer?.name : undefined,
          substitutions: stat.substitutions ? JSON.parse(stat.substitutions) : [],
        }))
      
      const subs = initialStats
        .filter((stat: any) => !stat.started)
        .map((stat: any) => ({
          playerId: stat.playerId,
          playerName: stat.player.name,
          position: stat.position || stat.player.position || "",
          jerseyNumber: stat.jerseyNumber !== undefined && stat.jerseyNumber !== null ? stat.jerseyNumber : stat.player.jerseyNumber,
          minutes: stat.minutes || 0,
          goals: stat.goals || 0,
          goalMinutes: stat.goalMinutes ? JSON.parse(stat.goalMinutes) : [],
          assists: stat.assists || 0,
          assistMinutes: stat.assistMinutes ? JSON.parse(stat.assistMinutes) : [],
          yellowCards: stat.yellowCards || 0,
          redCards: stat.redCards || 0,
          rating: stat.rating,
          started: false,
          substitutionMinute: stat.substitutionMinute,
          substitutionInMinute: stat.substitutionInMinute,
          substitutedBy: stat.substitutedBy,
          substitutedByName: stat.substitutedBy ? stat.substitutedByPlayer?.name : undefined,
          substitutions: stat.substitutions ? JSON.parse(stat.substitutions) : [],
        }))

      setStarting11(starting)
      setSubstitutes(subs)
    }
  }, [initialStats])

  // Expose save function via ref
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef.current = async () => {
        const result = onSave({ starting11, substitutes, coach, finalScore, isHome })
        if (result instanceof Promise) {
          await result
        }
      }
    }
  }, [onSaveRef, starting11, substitutes, coach, finalScore, isHome, onSave])

  const handleAddToStarting11 = (player: Player) => {
    // Count only active players (not subbed out)
    const activeStarting11 = starting11.filter(p => !p.substitutionMinute)
    if (activeStarting11.length >= maxPlayers) {
      alert(`Starting lineup is full (${maxPlayers} players maximum). Remove a player first.`)
      return
    }

    const exists = starting11.find(p => p.playerId === player.id)
    if (exists) return

    const newPlayer: LineupPlayer = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      minutes: 0,
      goals: 0,
      goalMinutes: [],
      assists: 0,
      assistMinutes: [],
      yellowCards: 0,
      redCards: 0,
      started: true,
      substitutions: [],
    }

    setStarting11([...starting11, newPlayer])
  }

  const handleAddSubstitute = (player: Player) => {
    const exists = substitutes.find(p => p.playerId === player.id)
    if (exists) return

    const newPlayer: LineupPlayer = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      minutes: 0,
      goals: 0,
      goalMinutes: [],
      assists: 0,
      assistMinutes: [],
      yellowCards: 0,
      redCards: 0,
      started: false,
      substitutions: [],
    }

    setSubstitutes([...substitutes, newPlayer])
  }

  const handleRemoveFromStarting11 = (playerId: string) => {
    const playerToRemove = starting11.find(p => p.playerId === playerId)
    if (!playerToRemove) return

    // Remove from starting11
    setStarting11(starting11.filter(p => p.playerId !== playerId))

    // Add to substitutes if not already there
    const alreadyInSubstitutes = substitutes.some(p => p.playerId === playerId)
    if (!alreadyInSubstitutes) {
      const playerAsSubstitute: LineupPlayer = {
        ...playerToRemove,
        started: false,
        substitutionMinute: undefined,
        substitutionInMinute: undefined,
        substitutedBy: undefined,
        substitutedByName: undefined,
        substitutions: [],
        minutes: 0,
      }
      setSubstitutes([...substitutes, playerAsSubstitute])
    }
  }

  const handleRemoveSubstitute = (playerId: string) => {
    setSubstitutes(substitutes.filter(p => p.playerId !== playerId))
  }

  const handleUpdateStarting11 = (playerId: string, updates: Partial<LineupPlayer>) => {
    setStarting11(prev => {
      const updated = prev.map(p => {
        if (p.playerId === playerId) {
          // Preserve position if it's not being updated and exists
          const preservedPosition = updates.position !== undefined ? updates.position : (p.position || "")
          return { 
            ...p, 
            ...updates,
            position: preservedPosition // Ensure position is always preserved
          }
        }
        return p
      })
      // Notify parent of goal change for real-time scoreboard update
      if (onGoalsChange && updates.goals !== undefined) {
        const totalGoals = [...updated, ...substitutes].reduce((total, p) => total + (p.goals || 0), 0)
        onGoalsChange(totalGoals)
      }
      return updated
    })
  }

  const handleUpdateSubstitute = (playerId: string, updates: Partial<LineupPlayer>) => {
    setSubstitutes(prev => {
      const updated = prev.map(p => 
        p.playerId === playerId ? { ...p, ...updates } : p
      )
      // Notify parent of goal change for real-time scoreboard update
      if (onGoalsChange && updates.goals !== undefined) {
        const totalGoals = [...starting11, ...updated].reduce((total, p) => total + (p.goals || 0), 0)
        onGoalsChange(totalGoals)
      }
      return updated
    })
  }

  const handleSubstitution = (outPlayerId: string, inPlayerId: string, minute: number) => {
    const outPlayer = starting11.find(p => p.playerId === outPlayerId)
    const inPlayer = substitutes.find(p => p.playerId === inPlayerId)

    if (!outPlayer || !inPlayer) return

    // Update out player
    handleUpdateStarting11(outPlayerId, {
      substitutionMinute: minute,
      substitutedBy: inPlayerId,
      substitutedByName: inPlayer.playerName,
      minutes: minute,
    })

    // Update in player
    handleUpdateSubstitute(inPlayerId, {
      substitutionInMinute: minute,
      minutes: 90 - minute, // Assuming 90 minute game
    })
  }

  const handleStarterSearch = (searchTerm: string) => {
    setStarterSearch(searchTerm)
    if (searchTerm.trim() === "") return

    // Find first matching player (case-insensitive)
    const matchedPlayer = players.find(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !starting11.some(sp => sp.playerId === p.id)
    )

    // Count only active players (not subbed out)
    const activeStarting11 = starting11.filter(p => !p.substitutionMinute)
    if (matchedPlayer && activeStarting11.length < maxPlayers) {
      handleAddToStarting11(matchedPlayer)
      setStarterSearch("")
    }
  }

  const handleSubSearch = (searchTerm: string) => {
    setSubSearch(searchTerm)
    if (searchTerm.trim() === "") return

    // Find first matching player (case-insensitive)
    const matchedPlayer = players.find(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !substitutes.some(sub => sub.playerId === p.id) &&
      !starting11.some(sp => sp.playerId === p.id)
    )

    if (matchedPlayer) {
      handleAddSubstitute(matchedPlayer)
      setSubSearch("")
    }
  }

  const calculateMinutes = (player: LineupPlayer) => {
    let totalMinutes = 0
    
    // If player started the game
    if (player.started) {
      // Check if they have substitution entries
      if (player.substitutions && player.substitutions.length > 0) {
        // Player started and was subbed out - calculate from start to first sub out
        const firstSub = player.substitutions[0]
        if (firstSub.outMinute) {
          totalMinutes += firstSub.outMinute
        } else if (player.substitutionMinute) {
          totalMinutes += player.substitutionMinute
        } else {
          // No substitution recorded, played full game
          totalMinutes += gameDuration
        }
        
        // Add any additional substitution periods (if they came back in)
        for (let i = 1; i < player.substitutions.length; i++) {
          const sub = player.substitutions[i]
          if (sub.inMinute && sub.outMinute) {
            totalMinutes += (sub.outMinute - sub.inMinute)
          } else if (sub.inMinute) {
            // Came in but didn't get subbed out again - played to end
            totalMinutes += (gameDuration - sub.inMinute)
          }
        }
      } else if (player.substitutionMinute) {
        // Old format: player started and was subbed out at substitutionMinute
        totalMinutes += player.substitutionMinute
      } else {
        // Player started and played full game
        totalMinutes += gameDuration
      }
    } else {
      // Player did NOT start - they came in as a substitute
      if (player.substitutions && player.substitutions.length > 0) {
        // Calculate minutes from all substitution entries
        player.substitutions.forEach((sub) => {
          if (sub.inMinute && sub.outMinute) {
            // Came in and went out - calculate the difference
            totalMinutes += Math.max(0, sub.outMinute - sub.inMinute)
          } else if (sub.inMinute) {
            // Came in but didn't go out - played from sub in to end
            totalMinutes += Math.max(0, gameDuration - sub.inMinute)
          }
        })
      } else if (player.substitutionInMinute) {
        // Old format: substitute came in at substitutionInMinute
        if (player.substitutionMinute) {
          // Also has a sub out minute
          totalMinutes += Math.max(0, player.substitutionMinute - player.substitutionInMinute)
        } else {
          // No sub out minute - played from sub in to end
          totalMinutes += Math.max(0, gameDuration - player.substitutionInMinute)
        }
      }
      // If no substitution info at all, minutes remain 0
    }
    
    // Ensure we never return negative minutes
    return Math.max(0, totalMinutes)
  }

  const handleAddGoal = (playerId: string, minute: number) => {
    const player = starting11.find(p => p.playerId === playerId) || substitutes.find(p => p.playerId === playerId)
    if (!player) return

    if (player.started) {
      handleUpdateStarting11(playerId, {
        goals: player.goals + 1,
        goalMinutes: [...player.goalMinutes, minute].sort((a, b) => a - b),
      })
    } else {
      handleUpdateSubstitute(playerId, {
        goals: player.goals + 1,
        goalMinutes: [...player.goalMinutes, minute].sort((a, b) => a - b),
      })
    }
  }

  // Memoize fieldPlayers to ensure it updates correctly when starting11 or substitutes change
  // Include: active starting players (not subbed out) + substitutes who have been subbed in
  const fieldPlayers = useMemo(() => {
    const activeStartingPlayers = starting11
      .filter(p => !p.substitutionMinute)
      .map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        position: p.position || "",
        jerseyNumber: p.jerseyNumber,
        x: 0,
        y: 0,
      }))
    
    const subbedInPlayers = substitutes
      .filter(p => p.substitutionInMinute) // Only include players who have been subbed in
      .map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        position: p.position || "",
        jerseyNumber: p.jerseyNumber,
        x: 0,
        y: 0,
      }))
    
    return [...activeStartingPlayers, ...subbedInPlayers]
  }, [starting11, substitutes])

  // For starting lineup search: show all players except those currently active in starting11
  // This allows adding players who were removed or are on the bench
  const availablePlayersForStarting = players.filter(p => 
    !starting11.some(sp => sp.playerId === p.id && !sp.substitutionMinute)
  )

  // For substitutes search: show all players except those currently in substitutes or active in starting11
  // This allows adding players who were completely removed
  const availablePlayersForSubstitutes = players.filter(p => 
    !starting11.some(sp => sp.playerId === p.id && !sp.substitutionMinute) &&
    !substitutes.some(sub => sub.playerId === p.id)
  )

  const positions = ["GK", "LB", "RB", "CB", "CM", "CDM", "CAM", "LW", "RW", "ST"]

  // Position order for sorting: GK, LB, CB, CB, RB, CM, CM, AM, AM, ST, ST
  const getPositionOrder = (position: string): number => {
    const pos = position.toUpperCase()
    if (pos === "GK") return 1
    if (pos === "LB" || pos === "LWB") return 2
    if (pos === "CB") return 3
    if (pos === "RB" || pos === "RWB") return 4
    if (pos === "CM" || pos === "CDM") return 5
    if (pos === "CAM" || pos === "AM" || pos === "LM" || pos === "RM") return 6
    if (pos === "ST" || pos === "CF") return 7
    if (pos === "LW" || pos === "RW") return 8
    return 9 // Other positions
  }

  const getCellStyle = (player: LineupPlayer, field: 'goals' | 'assists' | 'minutes') => {
    if (field === 'goals' && player.goals > 0) {
      return { backgroundColor: '#FFD700' } // Gold
    }
    if (field === 'assists' && player.assists > 0) {
      return { backgroundColor: '#E8E8E8' } // Light gray
    }
    if (field === 'minutes' && player.minutes < 30) {
      return { backgroundColor: '#FFB6C1' } // Light red
    }
    return {}
  }

  return (
    <div className="space-y-6">
      {/* Match Information Table */}
      <Card>
        <CardHeader>
          <CardTitle>Match Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Date</Label>
                <div className="text-sm">{game ? new Date(game.date).toLocaleDateString() : ''}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Home/Away</Label>
                <select
                  value={isHome !== null ? (isHome ? 'home' : 'away') : ''}
                  onChange={(e) => {
                    setIsHome(e.target.value === 'home' ? true : e.target.value === 'away' ? false : null)
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Opponent</Label>
                <div className="flex items-center space-x-2 text-sm">
                  {game?.opponentClub?.logo && (
                    <div className="relative w-6 h-6 flex-shrink-0 overflow-hidden bg-white rounded border border-gray-200">
                      <img
                        src={game.opponentClub.logo}
                        alt={game.opponentClub.name || game?.opponent || ''}
                        className="w-full h-full object-contain p-0.5"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <span>{game?.opponentClub?.name || game?.opponent || ''}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Venue</Label>
                <div className="text-sm">{game?.venue || ''}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Competition</Label>
                <div className="text-sm">{game?.competition || ''}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Final Score</Label>
                <Input
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  placeholder="e.g., 2-1"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Coach</Label>
                <Input
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  placeholder="Enter coach name"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Search Starter</Label>
                <PlayerSearch
                  roster={availablePlayersForStarting.map(p => ({
                    id: p.id,
                    name: p.name,
                    jerseyNumber: p.jerseyNumber,
                    position: p.position
                  }))}
                  label=""
                      onSelect={(player) => {
                        const foundPlayer = players.find(p => p.id === player.id)
                        const activeStarting11 = starting11.filter(p => !p.substitutionMinute)
                        
                        // If player is already in starting11 but subbed out, reactivate them
                        const existingInStarting11 = starting11.find(sp => sp.playerId === player.id)
                        if (existingInStarting11 && existingInStarting11.substitutionMinute) {
                          // Reactivate by removing substitution data
                          handleUpdateStarting11(player.id, {
                            substitutionMinute: undefined,
                            substitutionInMinute: undefined,
                            substitutedBy: undefined,
                            substitutedByName: undefined,
                            substitutions: [],
                            minutes: 0
                          })
                          return
                        }
                        
                        // If player is in substitutes, move them to starting11
                        const existingInSubstitutes = substitutes.find(sub => sub.playerId === player.id)
                        if (existingInSubstitutes) {
                          // Remove from substitutes
                          setSubstitutes(substitutes.filter(sub => sub.playerId !== player.id))
                          // Add to starting11
                          const playerAsStarter: LineupPlayer = {
                            ...existingInSubstitutes,
                            started: true,
                            substitutionMinute: undefined,
                            substitutionInMinute: undefined,
                            substitutedBy: undefined,
                            substitutedByName: undefined,
                            substitutions: [],
                            minutes: 0
                          }
                          setStarting11([...starting11, playerAsStarter])
                          return
                        }
                        
                        // Otherwise, add new player to starting11
                        if (foundPlayer && activeStarting11.length < maxPlayers) {
                          handleAddToStarting11(foundPlayer)
                        }
                      }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Search Substitute</Label>
                <PlayerSearch
                  roster={availablePlayersForSubstitutes.map(p => ({
                    id: p.id,
                    name: p.name,
                    jerseyNumber: p.jerseyNumber,
                    position: p.position
                  }))}
                  label=""
                  onSelect={(player) => {
                    const foundPlayer = players.find(p => p.id === player.id)
                    
                    // If player is in starting11 but subbed out, move them to substitutes
                    const existingInStarting11 = starting11.find(sp => sp.playerId === player.id)
                    if (existingInStarting11 && existingInStarting11.substitutionMinute) {
                      // Remove from starting11
                      setStarting11(starting11.filter(sp => sp.playerId !== player.id))
                      // Add to substitutes
                      const playerAsSubstitute: LineupPlayer = {
                        ...existingInStarting11,
                        started: false,
                        substitutionMinute: undefined,
                        substitutionInMinute: undefined,
                        substitutedBy: undefined,
                        substitutedByName: undefined,
                        substitutions: [],
                        minutes: 0
                      }
                      setSubstitutes([...substitutes, playerAsSubstitute])
                      return
                    }
                    
                    // Otherwise, add new player to substitutes
                    if (foundPlayer) {
                      handleAddSubstitute(foundPlayer)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Soccer Field */}
        <Card>
          <CardHeader>
            <CardTitle>Formation & Field</CardTitle>
          </CardHeader>
          <CardContent>
            <SoccerField
              players={fieldPlayers}
              formation={formation}
              onFormationChange={setFormation}
            />
          </CardContent>
        </Card>

        {/* Right: Starting Lineup and Substitutes */}
        <div className="space-y-6">
          {/* Starting 11 */}
          <Card>
          <CardHeader className="bg-muted">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Starting Lineup ({starting11.filter(p => !p.substitutionMinute).length}/{maxPlayers})
              </CardTitle>
            </div>
          </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="sticky left-0 z-10 bg-muted min-w-[50px] text-center font-semibold"></TableHead>
                  <TableHead className="sticky left-[50px] z-10 bg-muted min-w-[40px] text-center font-semibold">#</TableHead>
                  <TableHead className="sticky left-[90px] z-10 bg-muted min-w-[140px] font-semibold">Player Name</TableHead>
                  <TableHead className="min-w-[90px] font-semibold">Position</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Jersey #</TableHead>
                  <TableHead className="min-w-[80px] font-semibold">Sub Out</TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Replaced By</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Minutes</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Goals</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Assists</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Yellow</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Red</TableHead>
                  <TableHead className="min-w-[100px] text-center font-semibold">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {starting11
                  .sort((a, b) => {
                    // Sort active players first, then subbed-out players
                    const aActive = !a.substitutionMinute
                    const bActive = !b.substitutionMinute
                    if (aActive !== bActive) {
                      return aActive ? -1 : 1
                    }
                    // Then sort by position
                    const orderA = getPositionOrder(a.position)
                    const orderB = getPositionOrder(b.position)
                    if (orderA !== orderB) {
                      return orderA - orderB
                    }
                    // If same position, sort alphabetically by name
                    return a.playerName.localeCompare(b.playerName)
                  })
                  .map((player, index) => {
                    // Only count active players for the index number
                    const activePlayers = starting11.filter(p => !p.substitutionMinute)
                    const playerIndex = activePlayers.findIndex(p => p.playerId === player.playerId)
                  const calculatedMinutes = calculateMinutes(player)
                  const isSubbedOut = !!player.substitutionMinute
                  return (
                    <TableRow key={player.playerId} className={isSubbedOut ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/50"}>
                      <TableCell className={`sticky left-0 z-5 ${isSubbedOut ? "bg-muted/30" : "bg-background"} text-center`}>
                        <Checkbox
                          onCheckedChange={() => handleRemoveFromStarting11(player.playerId)}
                          aria-label={`Remove ${player.playerName} from starting lineup`}
                        />
                      </TableCell>
                      <TableCell className={`sticky left-[50px] z-5 ${isSubbedOut ? "bg-muted/30" : "bg-background"} text-center font-semibold`}>
                        {playerIndex >= 0 ? playerIndex + 1 : '-'}
                      </TableCell>
                      <TableCell className={`sticky left-[90px] z-5 ${isSubbedOut ? "bg-muted/30" : "bg-background"} font-medium`}>
                        <div className="flex flex-col">
                          <Link href={`/players/${player.playerId}`} className="hover:underline text-primary font-medium">
                            {player.playerName}
                          </Link>
                          {isSubbedOut && (
                            <span className="text-xs text-muted-foreground mt-0.5">Sub Out</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={player.position}
                          onChange={(e) => handleUpdateStarting11(player.playerId, { position: e.target.value })}
                          className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select position...</option>
                          {positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {player.jerseyNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={player.substitutionMinute || ""}
                          onChange={(e) => {
                            const minute = parseInt(e.target.value) || undefined
                            handleUpdateStarting11(player.playerId, { 
                              substitutionMinute: minute,
                              minutes: 0
                            })
                          }}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="Min"
                        />
                      </TableCell>
                      <TableCell>
                        {player.substitutionMinute ? (
                          <select
                            value={player.substitutedBy || ""}
                            onChange={(e) => {
                              const substituteId = e.target.value || undefined
                              
                              const substitute = substitutes.find(s => s.playerId === substituteId)
                              
                              const currentSubs = player.substitutions || []
                              const newSub: SubstitutionEntry = {
                                outMinute: player.substitutionMinute,
                                replacedBy: substituteId
                              }
                              
                              handleUpdateStarting11(player.playerId, {
                                substitutedBy: substituteId,
                                substitutedByName: substitute?.playerName,
                                substitutions: [...currentSubs, newSub],
                                minutes: 0
                              })
                              
                              // Update the substitute to show they came in (but keep them in substitutes section)
                              if (substituteId && substitute && !substitute.started) {
                                const subInMinute = player.substitutionMinute
                                const subEntry: SubstitutionEntry = {
                                  inMinute: subInMinute
                                }
                                
                                // If substitute doesn't have a position, use the position of the player they're replacing
                                const positionToUse = substitute.position || player.position
                                
                                handleUpdateSubstitute(substituteId, {
                                  substitutionInMinute: subInMinute,
                                  position: positionToUse,
                                  substitutions: [subEntry],
                                  minutes: 0
                                })
                              }
                            }}
                            className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select replacement...</option>
                            {substitutes.map(sub => (
                              <option key={sub.playerId} value={sub.playerId}>
                                {sub.playerName} #{sub.jerseyNumber || ''} (Bench)
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-center text-sm font-medium ${getCellStyle(player, 'minutes').backgroundColor ? 'bg-yellow-100' : ''}`}>
                        {calculatedMinutes}
                      </TableCell>
                      <TableCell className={getCellStyle(player, 'goals').backgroundColor ? 'bg-yellow-200' : ''}>
                        <Input
                          type="text"
                          value={player.goals || ""}
                          onChange={(e) => handleUpdateStarting11(player.playerId, { goals: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={getCellStyle(player, 'assists').backgroundColor ? 'bg-gray-100' : ''}>
                        <Input
                          type="text"
                          value={player.assists || ""}
                          onChange={(e) => handleUpdateStarting11(player.playerId, { assists: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={`text-center ${player.yellowCards > 0 ? 'bg-yellow-200' : ''}`}>
                        <Input
                          type="text"
                          value={player.yellowCards || ""}
                          onChange={(e) => handleUpdateStarting11(player.playerId, { yellowCards: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={`text-center ${player.redCards > 0 ? 'bg-red-200' : ''}`}>
                        <Input
                          type="text"
                          value={player.redCards || ""}
                          onChange={(e) => handleUpdateStarting11(player.playerId, { redCards: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <StarRating
                          value={player.rating ? Math.max(1, Math.min(5, player.rating)) : null}
                          onChange={(value) => handleUpdateStarting11(player.playerId, { rating: value })}
                          size="sm"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {starting11.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                      No players in starting 11. Use search bar above to add players.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              </div>
            </CardContent>
          </Card>

          {/* Substitutes */}
          <Card>
          <CardHeader className="bg-muted">
            <CardTitle className="text-base font-semibold">
              Substitutes ({substitutes.length})
            </CardTitle>
          </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="sticky left-0 z-10 bg-muted min-w-[50px] text-center font-semibold"></TableHead>
                  <TableHead className="sticky left-[50px] z-10 bg-muted min-w-[140px] font-semibold">Player Name</TableHead>
                  <TableHead className="min-w-[90px] font-semibold">Position</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Jersey #</TableHead>
                  <TableHead className="min-w-[80px] font-semibold">Sub In</TableHead>
                  <TableHead className="min-w-[80px] font-semibold">Sub Out</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Minutes</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Goals</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Assists</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Yellow</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Red</TableHead>
                  <TableHead className="min-w-[100px] text-center font-semibold">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Show regular substitutes */}
                {substitutes.map((player) => {
                  const calculatedMinutes = calculateMinutes(player)
                  return (
                    <TableRow key={player.playerId} className="hover:bg-muted/50">
                      <TableCell className="sticky left-0 z-5 bg-background text-center">
                        <Checkbox
                          onCheckedChange={() => handleRemoveSubstitute(player.playerId)}
                          aria-label={`Remove ${player.playerName} from roster`}
                        />
                      </TableCell>
                      <TableCell className="sticky left-[50px] z-5 bg-background font-medium">
                        <div className="flex flex-col">
                          <Link href={`/players/${player.playerId}`} className="hover:underline text-primary font-medium">
                            {player.playerName}
                          </Link>
                          {player.substitutionInMinute && (
                            <span className="text-xs text-muted-foreground mt-0.5">Sub In</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={player.position}
                          onChange={(e) => handleUpdateSubstitute(player.playerId, { position: e.target.value })}
                          className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select position...</option>
                          {positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {player.jerseyNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={player.substitutionInMinute || ""}
                          onChange={(e) => {
                            const minute = parseInt(e.target.value) || undefined
                            handleUpdateSubstitute(player.playerId, { 
                              substitutionInMinute: minute,
                              minutes: 0
                            })
                          }}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="Min"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={player.substitutionMinute || ""}
                          onChange={(e) => {
                            const minute = parseInt(e.target.value) || undefined
                            handleUpdateSubstitute(player.playerId, { 
                              substitutionMinute: minute,
                              minutes: 0
                            })
                          }}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="Min"
                        />
                      </TableCell>
                      <TableCell className={`text-center text-sm font-medium ${getCellStyle(player, 'minutes').backgroundColor ? 'bg-yellow-100' : ''}`}>
                        {calculatedMinutes}
                      </TableCell>
                      <TableCell className={getCellStyle(player, 'goals').backgroundColor ? 'bg-yellow-200' : ''}>
                        <Input
                          type="text"
                          value={player.goals || ""}
                          onChange={(e) => handleUpdateSubstitute(player.playerId, { goals: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={getCellStyle(player, 'assists').backgroundColor ? 'bg-gray-100' : ''}>
                        <Input
                          type="text"
                          value={player.assists || ""}
                          onChange={(e) => handleUpdateSubstitute(player.playerId, { assists: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={`text-center ${player.yellowCards > 0 ? 'bg-yellow-200' : ''}`}>
                        <Input
                          type="text"
                          value={player.yellowCards || ""}
                          onChange={(e) => handleUpdateSubstitute(player.playerId, { yellowCards: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className={`text-center ${player.redCards > 0 ? 'bg-red-200' : ''}`}>
                        <Input
                          type="text"
                          value={player.redCards || ""}
                          onChange={(e) => handleUpdateSubstitute(player.playerId, { redCards: parseInt(e.target.value) || 0 })}
                          className="w-16 h-8 text-center text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <StarRating
                          value={player.rating ? Math.max(1, Math.min(5, player.rating)) : null}
                          onChange={(value) => handleUpdateSubstitute(player.playerId, { rating: value })}
                          size="sm"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {substitutes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                      No substitutes added yet. Use search bar above to add players.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save button is now in the parent component's tabs row */}
    </div>
  )
}
