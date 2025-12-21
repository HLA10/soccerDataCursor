"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface GameScoreboardProps {
  teamName: string
  opponent: string
  teamGoals: number
  opponentGoals: number
  onTeamGoalChange?: (goals: number) => void
  onOpponentGoalChange?: (goals: number) => void
  isEditable?: boolean
  isHome?: boolean | null
  teamLogo?: string | null
  opponentLogo?: string | null
}

export function GameScoreboard({
  teamName,
  opponent,
  teamGoals,
  opponentGoals,
  onTeamGoalChange,
  onOpponentGoalChange,
  isEditable = false,
  isHome = null,
  teamLogo,
  opponentLogo,
}: GameScoreboardProps) {
  const handleTeamGoalIncrement = () => {
    if (onTeamGoalChange) {
      onTeamGoalChange(teamGoals + 1)
    }
  }

  const handleTeamGoalDecrement = () => {
    if (onTeamGoalChange && teamGoals > 0) {
      onTeamGoalChange(teamGoals - 1)
    }
  }

  const handleOpponentGoalIncrement = () => {
    if (onOpponentGoalChange) {
      onOpponentGoalChange(opponentGoals + 1)
    }
  }

  const handleOpponentGoalDecrement = () => {
    if (onOpponentGoalChange && opponentGoals > 0) {
      onOpponentGoalChange(opponentGoals - 1)
    }
  }

  // Determine winner
  let result = "Draw"
  let resultColor = "text-gray-600"
  if (teamGoals > opponentGoals) {
    result = "Win"
    resultColor = "text-green-600"
  } else if (opponentGoals > teamGoals) {
    result = "Loss"
    resultColor = "text-red-600"
  }

  // Format home/away indicator
  const homeAwayText = isHome === true ? "Home" : isHome === false ? "Away" : ""

  return (
    <Card className="border-2 border-gray-800">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Home/Away indicator */}
          {homeAwayText && (
            <div className="text-center text-sm font-medium text-gray-600">
              {homeAwayText}
            </div>
          )}

          {/* Score Display */}
          <div className="flex items-center justify-between">
            {/* Team Name */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3">
                {teamLogo ? (
                  <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden bg-white rounded-full border-2 border-gray-300 shadow-md" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={teamLogo}
                      alt={teamName}
                      className="w-full h-full object-contain p-1"
                      style={{ objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                    <span className="text-xl font-bold text-gray-700">
                      {teamName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-lg font-bold text-gray-800">{teamName}</div>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-4 px-8">
              <div className="text-center">
                {isEditable ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTeamGoalDecrement}
                      className="h-8 w-8 p-0"
                    >
                      −
                    </Button>
                    <div className="text-5xl font-bold text-gray-900 min-w-[60px] text-center">
                      {teamGoals}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTeamGoalIncrement}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <div className="text-5xl font-bold text-gray-900">{teamGoals}</div>
                )}
              </div>

              <div className="text-3xl font-bold text-gray-400">-</div>

              <div className="text-center">
                {isEditable ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpponentGoalDecrement}
                      className="h-8 w-8 p-0"
                    >
                      −
                    </Button>
                    <div className="text-5xl font-bold text-gray-900 min-w-[60px] text-center">
                      {opponentGoals}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpponentGoalIncrement}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <div className="text-5xl font-bold text-gray-900">{opponentGoals}</div>
                )}
              </div>
            </div>

            {/* Opponent Name */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="text-lg font-bold text-gray-800">{opponent}</div>
                {opponentLogo ? (
                  <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden bg-white rounded-full border-2 border-gray-300 shadow-md" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={opponentLogo}
                      alt={opponent}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                    <span className="text-xl font-bold text-gray-700">
                      {opponent.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={`text-center text-xl font-semibold ${resultColor}`}>
            {result}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



