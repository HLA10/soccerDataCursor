"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/scouting/star-rating"

interface ScoutedPlayerFormProps {
  scoutedPlayer?: any
  onSuccess?: () => void
  defaultGameId?: string
  defaultOpponentId?: string
}

export function ScoutedPlayerForm({
  scoutedPlayer,
  onSuccess,
  defaultGameId,
  defaultOpponentId,
}: ScoutedPlayerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [opponents, setOpponents] = useState<any[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: scoutedPlayer?.name || "",
    date: scoutedPlayer?.date
      ? new Date(scoutedPlayer.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    position: scoutedPlayer?.position || "",
    starRating: scoutedPlayer?.starRating || 3,
    preferredFoot: scoutedPlayer?.preferredFoot || "BOTH",
    comments: scoutedPlayer?.comments || "",
    gameId: scoutedPlayer?.gameId || defaultGameId || "",
    opponentId: scoutedPlayer?.opponentId || defaultOpponentId || "",
  })

  useEffect(() => {
    // Fetch opponents
    fetch("/api/opponents")
      .then((res) => res.json())
      .then((data) => setOpponents(data))
      .catch((err) => console.error("Error fetching opponents:", err))

    // Fetch games
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error("Error fetching games:", err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.position || !formData.opponentId) {
      alert("Name, position, and opponent are required")
      setLoading(false)
      return
    }

    try {
      const url = scoutedPlayer
        ? `/api/scouting/${scoutedPlayer.id}`
        : "/api/scouting"
      const method = scoutedPlayer ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gameId: formData.gameId || null,
        }),
      })

      if (res.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/scouting")
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to save scouted player")
      }
    } catch (error) {
      console.error("Error saving scouted player:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {scoutedPlayer ? "Edit Scouted Player" : "Add Scouted Player"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Player Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Date Scouted *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Forward, Midfielder, Defender, Goalkeeper"
                required
              />
            </div>

            <div>
              <Label htmlFor="preferredFoot">Preferred Foot *</Label>
              <select
                id="preferredFoot"
                value={formData.preferredFoot}
                onChange={(e) =>
                  setFormData({ ...formData, preferredFoot: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Star Rating *</Label>
            <div className="mt-2">
              <StarRating
                rating={formData.starRating}
                onRatingChange={(rating) =>
                  setFormData({ ...formData, starRating: rating })
                }
                size="lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current rating: {formData.starRating} / 5
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="opponentId">Opponent Club *</Label>
            <select
              id="opponentId"
              value={formData.opponentId}
              onChange={(e) => {
                const opponentId = e.target.value
                const opponent = opponents.find((o) => o.id === opponentId)
                setSelectedOpponent(opponent || null)
                setFormData({ ...formData, opponentId: opponentId })
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select opponent...</option>
              {opponents.map((opponent) => (
                <option key={opponent.id} value={opponent.id}>
                  {opponent.name}
                </option>
              ))}
            </select>
            {selectedOpponent && (
              <div className="mt-3 flex items-center space-x-3 p-3 border rounded bg-gray-50">
                {selectedOpponent.logo && (
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={selectedOpponent.logo}
                      alt={selectedOpponent.name}
                      className="w-full h-full object-contain p-1"
                      style={{ objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-base">{selectedOpponent.name}</p>
                  {selectedOpponent.location && (
                    <p className="text-sm text-gray-500">{selectedOpponent.location}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="gameId">Related Game (Optional)</Label>
            <select
              id="gameId"
              value={formData.gameId}
              onChange={(e) =>
                setFormData({ ...formData, gameId: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No specific game</option>
              {games
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((game) => (
                  <option key={game.id} value={game.id}>
                    {new Date(game.date).toLocaleDateString()} - {game.opponent || game.opponentClub?.name || "Unknown"} @ {game.venue}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label htmlFor="comments">Comments & Notes</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              placeholder="Detailed description of the player's strengths, weaknesses, playing style, etc."
              rows={6}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : scoutedPlayer ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

