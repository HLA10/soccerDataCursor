"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { format } from "date-fns"
import { canDelete } from "@/lib/permissions"
import { OpponentTeamForm } from "@/components/forms/opponent-team-form"

export default function OpponentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [opponent, setOpponent] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchOpponent()
      fetchTeams()
    }
  }, [params.id])

  const fetchOpponent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opponents/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOpponent(data)
      }
    } catch (error) {
      console.error("Error fetching opponent:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/opponents/${params.id}/teams`)
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const handleTeamSuccess = () => {
    fetchTeams()
    setShowTeamForm(false)
    setEditingTeam(null)
  }

  const handleEditTeam = (team: any) => {
    setEditingTeam(team)
    setShowTeamForm(true)
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) {
      return
    }

    try {
      const res = await fetch(`/api/opponents/${params.id}/teams/${teamId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchTeams()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete team")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Male"
      case "FEMALE":
        return "Female"
      case "MIXED":
        return "Mixed"
      default:
        return gender
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this opponent? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/opponents/${params.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/opponents")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete opponent")
      }
    } catch (error) {
      console.error("Error deleting opponent:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const user = session?.user as any

  if (loading) {
    return <div className="text-center py-8">Loading opponent details...</div>
  }

  if (!opponent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Opponent not found</p>
        <Link href="/opponents">
          <Button className="mt-4">Back to Opponents</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{opponent.name}</h1>
            <p className="text-muted-foreground">Opponent club details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
            <Link href={`/opponents/${params.id}/edit`}>
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
            <CardTitle>Club Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opponent.logo && (
              <div className="relative w-32 h-32 mx-auto overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                <Image
                  src={opponent.logo}
                  alt={opponent.name}
                  fill
                  className="object-contain p-2"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{opponent.name}</p>
            </div>
            {opponent.location && (
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{opponent.location}</p>
              </div>
            )}
            {opponent.homeField && (
              <div>
                <p className="text-sm font-medium text-gray-500">Home Field</p>
                <p>{opponent.homeField}</p>
              </div>
            )}
            <div className="flex items-center space-x-4">
              {opponent.primaryColor && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Primary Color</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: opponent.primaryColor }}
                    />
                    <span className="text-sm">{opponent.primaryColor}</span>
                  </div>
                </div>
              )}
              {opponent.secondaryColor && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Secondary Color</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: opponent.secondaryColor }}
                    />
                    <span className="text-sm">{opponent.secondaryColor}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Games</p>
              <p className="text-2xl font-bold">{opponent._count?.games || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Scouted Players</p>
              <p className="text-2xl font-bold">{opponent._count?.scoutedPlayers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {opponent.games && opponent.games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {opponent.games.map((game: any) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {format(new Date(game.date), "MMM d, yyyy")} - {game.venue}
                      </p>
                      {game.team && <p className="text-sm text-gray-500">{game.team.name}</p>}
                    </div>
                    {game.score && (
                      <p className="font-semibold">{game.score}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {opponent.scoutedPlayers && opponent.scoutedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scouted Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {opponent.scoutedPlayers.map((player: any) => (
                <Link
                  key={player.id}
                  href={`/scouting/${player.id}`}
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.position} • {format(new Date(player.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < player.starRating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teams</CardTitle>
            {(user?.role === "ADMIN" ||
              user?.role === "COACH" ||
              user?.role === "SUPER_USER") && (
              <Button
                onClick={() => {
                  setEditingTeam(null)
                  setShowTeamForm(!showTeamForm)
                }}
                size="sm"
              >
                {showTeamForm ? "Cancel" : "Add Team"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showTeamForm && (
            <div className="mb-6">
              <OpponentTeamForm
                opponentId={params.id as string}
                team={editingTeam}
                onSuccess={handleTeamSuccess}
                onCancel={() => {
                  setShowTeamForm(false)
                  setEditingTeam(null)
                }}
              />
            </div>
          )}

          {teams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No teams added yet.</p>
              {(user?.role === "ADMIN" ||
                user?.role === "COACH" ||
                user?.role === "SUPER_USER") && (
                <p className="text-sm mt-2">Click "Add Team" to create the first team.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {team.teamColor && (
                      <div
                        className="w-12 h-12 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: team.teamColor }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{team.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{getGenderLabel(team.gender)}</span>
                        {team.age && <span>• {team.age}</span>}
                        {team.homeField && <span>• {team.homeField}</span>}
                      </div>
                    </div>
                  </div>
                  {(user?.role === "ADMIN" ||
                    user?.role === "COACH" ||
                    user?.role === "SUPER_USER") && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                      >
                        Edit
                      </Button>
                      {canDelete(user?.role) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
