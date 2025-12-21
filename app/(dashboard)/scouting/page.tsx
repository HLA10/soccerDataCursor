"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { StarRating } from "@/components/scouting/star-rating"

export default function ScoutingPage() {
  const { data: session } = useSession()
  const [scoutedPlayers, setScoutedPlayers] = useState<any[]>([])
  const [opponents, setOpponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterOpponent, setFilterOpponent] = useState("")
  const [filterPosition, setFilterPosition] = useState("")
  const [filterMinRating, setFilterMinRating] = useState("")

  useEffect(() => {
    fetchOpponents()
    fetchScoutedPlayers()
  }, [])

  useEffect(() => {
    fetchScoutedPlayers()
  }, [search, filterOpponent, filterPosition, filterMinRating])

  const fetchOpponents = async () => {
    try {
      const res = await fetch("/api/opponents")
      if (res.ok) {
        const data = await res.json()
        setOpponents(data)
      }
    } catch (error) {
      console.error("Error fetching opponents:", error)
    }
  }

  const fetchScoutedPlayers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterOpponent) params.append("opponentId", filterOpponent)
      if (filterPosition) params.append("position", filterPosition)
      if (filterMinRating) params.append("minRating", filterMinRating)

      const url = params.toString() ? `/api/scouting?${params.toString()}` : "/api/scouting"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setScoutedPlayers(data)
      }
    } catch (error) {
      console.error("Error fetching scouted players:", error)
    } finally {
      setLoading(false)
    }
  }

  const user = session?.user as any

  if (loading && scoutedPlayers.length === 0) {
    return <div className="text-center py-8">Loading scouted players...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scouting</h1>
          <p className="text-muted-foreground">Track talented players from opposing teams</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
          <Link href="/scouting/new">
            <Button>Add Scouted Player</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterOpponent}
          onChange={(e) => setFilterOpponent(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Opponents</option>
          {opponents.map((opponent) => (
            <option key={opponent.id} value={opponent.id}>
              {opponent.name}
            </option>
          ))}
        </select>
        <Input
          placeholder="Filter by position..."
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
        />
        <select
          value={filterMinRating}
          onChange={(e) => setFilterMinRating(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>

      {scoutedPlayers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No scouted players found. Start tracking talented players from your opponents.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scoutedPlayers.map((player) => (
            <Link key={player.id} href={`/scouting/${player.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {player.position} • {format(new Date(player.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{player.starRating}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <StarRating rating={player.starRating} readonly size="sm" />
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">Foot:</span>
                      <span>{player.preferredFoot}</span>
                    </div>
                    {player.opponent && (
                      <div className="flex items-center space-x-2">
                        {player.opponent.logo && (
                          <div className="relative w-6 h-6 overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                            <img
                              src={player.opponent.logo}
                              alt={player.opponent.name}
                              className="w-full h-full object-contain p-0.5"
                              style={{ objectFit: "contain" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <Link
                          href={`/opponents/${player.opponent.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {player.opponent.name}
                        </Link>
                      </div>
                    )}
                    {player.game && (
                      <div className="text-xs text-gray-500">
                        Game: {format(new Date(player.game.date), "MMM d, yyyy")} @ {player.game.venue}
                      </div>
                    )}
                    {player.comments && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                        {player.comments}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Scouted by: {player.scoutedBy?.name || player.scoutedBy?.email || "Unknown"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

