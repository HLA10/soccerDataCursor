"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { StarRating } from "@/components/scouting/star-rating"
import { canDelete } from "@/lib/permissions"
import Image from "next/image"

export default function ScoutedPlayerDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  const fetchPlayer = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scouting/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlayer(data)
      }
    } catch (error) {
      console.error("Error fetching scouted player:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scouted player? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/scouting/${params.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/scouting")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete scouted player")
      }
    } catch (error) {
      console.error("Error deleting scouted player:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const user = session?.user as any

  if (loading) {
    return <div className="text-center py-8">Loading player details...</div>
  }

  if (!player) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Scouted player not found</p>
        <Link href="/scouting">
          <Button className="mt-4">Back to Scouting</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <p className="text-muted-foreground">Scouted player details</p>
        </div>
        <div className="flex space-x-2">
          {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
            <Link href={`/scouting/${params.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          )}
          {canDelete(user?.role) && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold">{player.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Position</p>
              <p>{player.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Preferred Foot</p>
              <p>{player.preferredFoot}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Star Rating</p>
              <StarRating rating={player.starRating} readonly size="lg" />
              <p className="text-sm text-gray-500 mt-1">{player.starRating} out of 5 stars</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date Scouted</p>
              <p>{format(new Date(player.date), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Scouted By</p>
              <p>{player.scoutedBy?.name || player.scoutedBy?.email || "Unknown"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opponent & Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {player.opponent && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Opponent Club</p>
                <Link href={`/opponents/${player.opponent.id}`}>
                  <div className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 transition-colors">
                    {player.opponent.logo && (
                      <div className="relative w-12 h-12 overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                        <Image
                          src={player.opponent.logo}
                          alt={player.opponent.name}
                          fill
                          className="object-contain p-1"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{player.opponent.name}</p>
                      {player.opponent.location && (
                        <p className="text-sm text-gray-500">{player.opponent.location}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {player.game && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Related Game</p>
                <Link href={`/games/${player.game.id}`}>
                  <div className="p-3 border rounded hover:bg-gray-50 transition-colors">
                    <p className="font-medium">
                      {format(new Date(player.game.date), "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {player.game.opponent || player.game.opponentClub?.name || "Unknown"} @ {player.game.venue}
                    </p>
                    {player.game.team && (
                      <p className="text-xs text-gray-400 mt-1">
                        {player.game.team.name}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            )}
            {!player.game && (
              <p className="text-sm text-gray-500">No specific game linked</p>
            )}
          </CardContent>
        </Card>
      </div>

      {player.comments && (
        <Card>
          <CardHeader>
            <CardTitle>Comments & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{player.comments}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

