"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface PlayerPosition {
  playerId: string
  playerName: string
  position: string
  x?: number
  y?: number
  jerseyNumber?: number | null
}

interface SoccerFieldProps {
  players: PlayerPosition[]
  onPlayerClick?: (player: PlayerPosition) => void
  formation: string
  onFormationChange?: (formation: string) => void
  duration?: number
  onDurationChange?: (duration: number) => void
}

const formations = {
  "4-4-2": [
    { position: "GK", x: 50, y: 95 },
    { position: "LB", x: 20, y: 75 },
    { position: "CB", x: 35, y: 75 },
    { position: "CB", x: 65, y: 75 },
    { position: "RB", x: 80, y: 75 },
    { position: "LM", x: 20, y: 50 },
    { position: "CM", x: 40, y: 50 },
    { position: "CM", x: 60, y: 50 },
    { position: "RM", x: 80, y: 50 },
    { position: "ST", x: 35, y: 20 },
    { position: "ST", x: 65, y: 20 },
  ],
  "4-3-3": [
    { position: "GK", x: 50, y: 95 },
    { position: "LB", x: 20, y: 75 },
    { position: "CB", x: 35, y: 75 },
    { position: "CB", x: 65, y: 75 },
    { position: "RB", x: 80, y: 75 },
    { position: "CM", x: 30, y: 50 },
    { position: "CM", x: 50, y: 50 },
    { position: "CM", x: 70, y: 50 },
    { position: "LW", x: 20, y: 20 },
    { position: "ST", x: 50, y: 20 },
    { position: "RW", x: 80, y: 20 },
  ],
  "4-2-3-1": [
    { position: "GK", x: 50, y: 95 },
    { position: "LB", x: 20, y: 75 },
    { position: "CB", x: 35, y: 75 },
    { position: "CB", x: 65, y: 75 },
    { position: "RB", x: 80, y: 75 },
    { position: "CDM", x: 35, y: 60 },
    { position: "CDM", x: 65, y: 60 },
    { position: "CAM", x: 50, y: 40 },
    { position: "LM", x: 20, y: 30 },
    { position: "RM", x: 80, y: 30 },
    { position: "ST", x: 50, y: 15 },
  ],
  "3-5-2": [
    { position: "GK", x: 50, y: 95 },
    { position: "CB", x: 25, y: 75 },
    { position: "CB", x: 50, y: 75 },
    { position: "CB", x: 75, y: 75 },
    { position: "LWB", x: 15, y: 55 },
    { position: "CM", x: 35, y: 55 },
    { position: "CM", x: 50, y: 55 },
    { position: "CM", x: 65, y: 55 },
    { position: "RWB", x: 85, y: 55 },
    { position: "ST", x: 35, y: 20 },
    { position: "ST", x: 65, y: 20 },
  ],
}

export function SoccerField({ players, onPlayerClick, formation, onFormationChange, duration, onDurationChange }: SoccerFieldProps) {
  const formationPositions = formations[formation as keyof typeof formations] || formations["4-4-2"]

  return (
    <div className="space-y-4">
      {(onFormationChange || onDurationChange) && (
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          {onFormationChange && (
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium">Formation:</label>
              <select
                value={formation}
                onChange={(e) => onFormationChange(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="4-4-2">4-4-2</option>
                <option value="4-3-3">4-3-3</option>
                <option value="4-2-3-1">4-2-3-1</option>
                <option value="3-5-2">3-5-2</option>
                <option value="3-4-3">3-4-3</option>
                <option value="4-5-1">4-5-1</option>
                <option value="5-3-2">5-3-2</option>
              </select>
            </div>
          )}
          {onDurationChange && (
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium">Match Duration:</label>
              <select
                value={duration || 90}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="75">75 min</option>
                <option value="80">80 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-800" style={{ aspectRatio: "1/1.54", maxWidth: "400px", margin: "0 auto" }}>
        {/* Custom field image as background */}
        <img
          src="/soccerfield.jpg"
          alt="Soccer Field"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          onError={(e) => {
            // Fallback to black background if image doesn't exist
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.style.backgroundColor = '#000000'
            }
          }}
        />

        {/* Player dots - assign players to formation positions */}
        {(() => {
          const usedPositionIndices = new Set<number>()
          const playerElements: JSX.Element[] = []
          
          // Helper function to get a stable number from playerId when jerseyNumber is not available
          const getStablePlayerNumber = (playerId: string): number => {
            // Use a hash of playerId to get a consistent number between 1-99
            // This ensures the same player always gets the same number
            let hash = 0
            for (let i = 0; i < playerId.length; i++) {
              hash = ((hash << 5) - hash) + playerId.charCodeAt(i)
              hash = hash & hash // Convert to 32-bit integer
            }
            return Math.abs(hash % 99) + 1
          }
          
          // First pass: assign players to exact position matches
          players.forEach((player, playerIndex) => {
            if (!player.position) {
              // If no position, skip to second pass where they'll be assigned to any available position
              return
            }
            
            // Find first available formation position matching this player's position
            const matchingIndex = formationPositions.findIndex(
              (pos, idx) => pos.position === player.position && !usedPositionIndices.has(idx)
            )
            
            if (matchingIndex !== -1) {
              usedPositionIndices.add(matchingIndex)
              const formationPos = formationPositions[matchingIndex]
              const displayNumber = player.jerseyNumber ?? getStablePlayerNumber(player.playerId)
              
              playerElements.push(
                <div
                  key={player.playerId}
                  className={cn(
                    "absolute w-7 h-7 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:bg-blue-500 hover:scale-110 transition-all duration-200 z-10 shadow-lg",
                    "transform -translate-x-1/2 -translate-y-1/2"
                  )}
                  style={{
                    left: `${formationPos.x}%`,
                    top: `${formationPos.y}%`,
                  }}
                  onClick={() => onPlayerClick?.(player)}
                  title={player.playerName}
                >
                  {displayNumber}
                </div>
              )
            }
          })
          
          // Second pass: assign remaining players (including those without positions) to any available position
          players.forEach((player, playerIndex) => {
            // Skip if already assigned
            if (playerElements.some(el => el.key === player.playerId)) return
            
            // Find any available position
            const availableIndex = formationPositions.findIndex(
              (pos, idx) => !usedPositionIndices.has(idx)
            )
            
            if (availableIndex !== -1) {
              usedPositionIndices.add(availableIndex)
              const formationPos = formationPositions[availableIndex]
              const displayNumber = player.jerseyNumber ?? getStablePlayerNumber(player.playerId)
              
              playerElements.push(
                <div
                  key={player.playerId}
                  className={cn(
                    "absolute w-7 h-7 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:bg-blue-500 hover:scale-110 transition-all duration-200 z-10 shadow-lg",
                    "transform -translate-x-1/2 -translate-y-1/2"
                  )}
                  style={{
                    left: `${formationPos.x}%`,
                    top: `${formationPos.y}%`,
                  }}
                  onClick={() => onPlayerClick?.(player)}
                  title={player.playerName}
                >
                  {displayNumber}
                </div>
              )
            }
          })
          
          return playerElements
        })()}

        {/* Formation position indicators (when no player assigned) - solid light blue circles */}
        {(() => {
          const usedIndices = new Set<number>()
          
          // Mark which formation positions are used by players
          players.forEach((player) => {
            if (!player.position) return
            const matchingIndex = formationPositions.findIndex(
              (pos, idx) => pos.position === player.position && !usedIndices.has(idx)
            )
            if (matchingIndex !== -1) {
              usedIndices.add(matchingIndex)
            } else {
              // If no exact match, find any unused position
              const availableIndex = formationPositions.findIndex(
                (pos, idx) => !usedIndices.has(idx)
              )
              if (availableIndex !== -1) {
                usedIndices.add(availableIndex)
              }
            }
          })
          
          return formationPositions.map((pos, posIndex) => {
            if (usedIndices.has(posIndex)) return null

            return (
              <div
                key={`empty-${posIndex}`}
                className="absolute w-6 h-6 rounded-full bg-blue-300 border border-white/50 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                title={pos.position}
              />
            )
          })
        })()}
      </div>
    </div>
  )
}
