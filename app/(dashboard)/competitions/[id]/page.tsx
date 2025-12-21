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
import { isEmoji } from "@/lib/logo-utils"

export default function CompetitionDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCompetition()
    }
  }, [params.id])

  const fetchCompetition = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/competitions/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setCompetition(data)
      }
    } catch (error) {
      console.error("Error fetching competition:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this competition? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/competitions/${params.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/competitions")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete competition")
      }
    } catch (error) {
      console.error("Error deleting competition:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const user = session?.user as any

  if (loading) {
    return <div className="text-center py-8">Loading competition details...</div>
  }

  if (!competition) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Competition not found</p>
        <Link href="/competitions">
          <Button className="mt-4">Back to Competitions</Button>
        </Link>
      </div>
    )
  }

  const getTypeLabel = (type: string, customType?: string) => {
    if (type === "CUSTOM" && customType) return customType
    return type.replace("_", " ")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{competition.name}</h1>
          <p className="text-muted-foreground">Competition details</p>
        </div>
        <div className="flex space-x-2">
          {(user?.role === "ADMIN" ||
            user?.role === "COACH" ||
            user?.role === "SUPER_USER") && (
            <Link href={`/competitions/${params.id}/edit`}>
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
            <CardTitle>Competition Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {competition.logo && (
              <div className="mx-auto flex items-center justify-center">
                {isEmoji(competition.logo) ? (
                  <div className="w-32 h-32 flex items-center justify-center text-6xl">
                    {competition.logo}
                  </div>
                ) : (
                  <div className="relative w-32 h-32">
                    <Image
                      src={competition.logo}
                      alt={competition.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{competition.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p>{getTypeLabel(competition.type, competition.customType)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Season</p>
              <p>{competition.season}</p>
            </div>
            {competition.location && (
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{competition.location}</p>
              </div>
            )}
            {competition.startDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p>{format(new Date(competition.startDate), "MMMM d, yyyy")}</p>
              </div>
            )}
            {competition.endDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p>{format(new Date(competition.endDate), "MMMM d, yyyy")}</p>
              </div>
            )}
            {competition.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="whitespace-pre-wrap">{competition.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Games</p>
              <p className="text-2xl font-bold">
                {competition._count?.games || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Participating Teams
              </p>
              <p className="text-2xl font-bold">
                {competition._count?.teams || competition.teams?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {competition.teams && competition.teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Participating Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {competition.teams.map((ct: any) => (
                <Link
                  key={ct.team.id}
                  href={`/dashboard?team=${ct.team.id}`}
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium">{ct.team.name}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {competition.games && competition.games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {competition.games.map((game: any) => (
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
                      {game.team && (
                        <p className="text-sm text-gray-500">{game.team.name}</p>
                      )}
                      {game.opponent || game.opponentClub?.name ? (
                        <p className="text-sm text-gray-500">
                          vs. {game.opponent || game.opponentClub?.name}
                        </p>
                      ) : null}
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
    </div>
  )
}

