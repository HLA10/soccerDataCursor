"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SoccerField } from "./soccer-field"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  name: string
  position: string
}

interface GamePlayer {
  playerId: string
  playerName: string
  position: string
  minutes: number
  started: boolean
  substitutionMinute?: number
  substitutedBy?: string
  substitutedByName?: string
  goals: number
  goalMinutes: number[]
  assists: number
  assistMinutes: number[]
  yellowCards: number
  redCards: number
  rating?: number
}

interface GamePlayerManagerProps {
  gameId: string
  players: Player[]
  initialStats?: any[]
  onSave: (stats: GamePlayer[]) => void
}

export function GamePlayerManager({ gameId, players, initialStats, onSave }: GamePlayerManagerProps) {
  const [formation, setFormation] = useState("4-4-2")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([])
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)

  useEffect(() => {
    if (initialStats) {
      const stats = initialStats.map((stat: any) => ({
        playerId: stat.playerId,
        playerName: stat.player.name,
        position: stat.position || "",
        minutes: stat.minutes || 0,
        started: stat.started || false,
        substitutionMinute: stat.substitutionMinute,
        substitutedBy: stat.substitutedBy,
        substitutedByName: stat.substitutedBy ? stat.substitutedByPlayer?.name : undefined,
        goals: stat.goals || 0,
        goalMinutes: stat.goalMinutes ? JSON.parse(stat.goalMinutes) : [],
        assists: stat.assists || 0,
        assistMinutes: stat.assistMinutes ? JSON.parse(stat.assistMinutes) : [],
        yellowCards: stat.yellowCards || 0,
        redCards: stat.redCards || 0,
        rating: stat.rating,
      }))
      setGamePlayers(stats)
    }
  }, [initialStats])

  const handleAddPlayer = () => {
    if (!selectedPlayer) return

    const existing = gamePlayers.find(p => p.playerId === selectedPlayer.id)
    if (existing) {
      setEditingPlayer(selectedPlayer.id)
      return
    }

    const newPlayer: GamePlayer = {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      position: selectedPlayer.position,
      minutes: 0,
      started: false,
      goals: 0,
      goalMinutes: [],
      assists: 0,
      assistMinutes: [],
      yellowCards: 0,
      redCards: 0,
    }

    setGamePlayers([...gamePlayers, newPlayer])
    setEditingPlayer(selectedPlayer.id)
    setSelectedPlayer(null)
  }

  const handleUpdatePlayer = (playerId: string, updates: Partial<GamePlayer>) => {
    setGamePlayers(gamePlayers.map(p => 
      p.playerId === playerId ? { ...p, ...updates } : p
    ))
  }

  const handleRemovePlayer = (playerId: string) => {
    setGamePlayers(gamePlayers.filter(p => p.playerId !== playerId))
  }

  const handleAddGoal = (playerId: string, minute: number) => {
    const player = gamePlayers.find(p => p.playerId === playerId)
    if (!player) return

    const newGoalMinutes = [...player.goalMinutes, minute].sort((a, b) => a - b)
    handleUpdatePlayer(playerId, {
      goals: player.goals + 1,
      goalMinutes: newGoalMinutes,
    })
  }

  const handleAddAssist = (playerId: string, minute: number) => {
    const player = gamePlayers.find(p => p.playerId === playerId)
    if (!player) return

    const newAssistMinutes = [...player.assistMinutes, minute].sort((a, b) => a - b)
    handleUpdatePlayer(playerId, {
      assists: player.assists + 1,
      assistMinutes: newAssistMinutes,
    })
  }

  const fieldPlayers = gamePlayers.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    position: p.position,
    x: 0,
    y: 0,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Soccer Field */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Formation & Field</CardTitle>
          </CardHeader>
          <CardContent>
            <SoccerField
              players={fieldPlayers}
              formation={formation}
              onFormationChange={setFormation}
              onPlayerClick={(player) => {
                const gamePlayer = gamePlayers.find(p => p.playerId === player.playerId)
                if (gamePlayer) {
                  setEditingPlayer(gamePlayer.playerId)
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: Player Management */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Select Player</Label>
                <select
                  value={selectedPlayer?.id || ""}
                  onChange={(e) => {
                    const player = players.find(p => p.id === e.target.value)
                    setSelectedPlayer(player || null)
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Choose a player...</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleAddPlayer} disabled={!selectedPlayer} className="w-full">
                Add Player to Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player List */}
        <Card>
          <CardHeader>
            <CardTitle>Players in Game ({gamePlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {gamePlayers.map((player) => (
                <PlayerDetailsCard
                  key={player.playerId}
                  player={player}
                  allPlayers={gamePlayers}
                  isEditing={editingPlayer === player.playerId}
                  onEdit={() => setEditingPlayer(player.playerId)}
                  onClose={() => setEditingPlayer(null)}
                  onUpdate={(updates) => handleUpdatePlayer(player.playerId, updates)}
                  onRemove={() => handleRemovePlayer(player.playerId)}
                  onAddGoal={(minute) => handleAddGoal(player.playerId, minute)}
                  onAddAssist={(minute) => handleAddAssist(player.playerId, minute)}
                />
              ))}
              {gamePlayers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No players added yet. Select a player above to add them.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => onSave(gamePlayers)} className="w-full" size="lg">
          Save Game Statistics
        </Button>
      </div>
    </div>
  )
}

interface PlayerDetailsCardProps {
  player: GamePlayer
  allPlayers: GamePlayer[]
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
  onUpdate: (updates: Partial<GamePlayer>) => void
  onRemove: () => void
  onAddGoal: (minute: number) => void
  onAddAssist: (minute: number) => void
}

function PlayerDetailsCard({
  player,
  allPlayers,
  isEditing,
  onEdit,
  onClose,
  onUpdate,
  onRemove,
  onAddGoal,
  onAddAssist,
}: PlayerDetailsCardProps) {
  const [goalMinute, setGoalMinute] = useState("")
  const [assistMinute, setAssistMinute] = useState("")

  if (!isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{player.playerName}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">{player.position}</Badge>
              {player.started && <Badge variant="outline">Started</Badge>}
              {player.goals > 0 && <Badge variant="default">{player.goals}G</Badge>}
              {player.assists > 0 && <Badge variant="default">{player.assists}A</Badge>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Minutes: {player.minutes}</p>
          {player.substitutionMinute && (
            <p>Substituted: {player.substitutionMinute}' by {player.substitutedByName || "Unknown"}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{player.playerName}</h4>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Position</Label>
          <Input
            value={player.position}
            onChange={(e) => onUpdate({ position: e.target.value })}
            placeholder="e.g., ST, CM, CB"
          />
        </div>
        <div>
          <Label>Minutes Played</Label>
          <Input
            type="number"
            value={player.minutes}
            onChange={(e) => onUpdate({ minutes: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={player.started}
            onChange={(e) => onUpdate({ started: e.target.checked })}
            className="rounded"
          />
          <Label>Started</Label>
        </div>
        {player.started && (
          <>
            <div>
              <Label>Substituted at (minute)</Label>
              <Input
                type="number"
                value={player.substitutionMinute || ""}
                onChange={(e) => onUpdate({ substitutionMinute: parseInt(e.target.value) || undefined })}
                placeholder="e.g., 65"
              />
            </div>
            {player.substitutionMinute && (
              <div>
                <Label>Replaced by</Label>
                <select
                  value={player.substitutedBy || ""}
                  onChange={(e) => onUpdate({ substitutedBy: e.target.value || undefined })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select player...</option>
                  {allPlayers
                    .filter(p => p.playerId !== player.playerId)
                    .map(p => (
                      <option key={p.playerId} value={p.playerId}>
                        {p.playerName}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label>Goals: {player.goals}</Label>
          {player.goalMinutes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({player.goalMinutes.join(", ")}')
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Goal minute"
            value={goalMinute}
            onChange={(e) => setGoalMinute(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              const minute = parseInt(goalMinute)
              if (minute > 0) {
                onAddGoal(minute)
                setGoalMinute("")
              }
            }}
          >
            Add Goal
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label>Assists: {player.assists}</Label>
          {player.assistMinutes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({player.assistMinutes.join(", ")}')
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Assist minute"
            value={assistMinute}
            onChange={(e) => setAssistMinute(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              const minute = parseInt(assistMinute)
              if (minute > 0) {
                onAddAssist(minute)
                setAssistMinute("")
              }
            }}
          >
            Add Assist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Yellow Cards</Label>
          <Input
            type="number"
            value={player.yellowCards}
            onChange={(e) => onUpdate({ yellowCards: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Red Cards</Label>
          <Input
            type="number"
            value={player.redCards}
            onChange={(e) => onUpdate({ redCards: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Rating</Label>
          <Input
            type="number"
            step="0.1"
            value={player.rating || ""}
            onChange={(e) => onUpdate({ rating: parseFloat(e.target.value) || undefined })}
            placeholder="e.g., 7.5"
          />
        </div>
      </div>
    </div>
  )
}



