"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { canDelete } from "@/lib/permissions"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TournamentTravelSection } from "@/components/tournaments/tournament-travel-section"
import { TournamentRosterSection } from "@/components/tournaments/tournament-roster-section"

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const user = session?.user as any

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await fetch(`/api/tournaments/${params.id}`)
        const data = await res.json()
        setTournament(data)
      } catch (error) {
        console.error("Error fetching tournament:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        {(user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER") && (
          <div className="flex space-x-2">
            <Button onClick={() => router.push(`/tournaments/${params.id}/edit`)}>
              Edit Tournament
            </Button>
            {canDelete(user.role) && (
              <Button
                variant="destructive"
                onClick={async () => {
                  if (
                    !confirm("Are you sure you want to delete this tournament? This action cannot be undone.")
                  ) {
                    return
                  }
                  try {
                    const res = await fetch(`/api/tournaments/${params.id}`, {
                      method: "DELETE",
                    })
                    if (res.ok) {
                      router.push("/tournaments")
                    } else {
                      const error = await res.json()
                      alert(error.error || "Failed to delete tournament")
                    }
                  } catch (error) {
                    console.error("Error deleting tournament:", error)
                    alert("An error occurred. Please try again.")
                  }
                }}
              >
                Delete Tournament
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview & Stats</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{tournament.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Season:</span> {tournament.season}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {tournament.type}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {format(new Date(tournament.startDate), "MMMM d, yyyy")}
                </p>
                {tournament.endDate && (
                  <p>
                    <span className="font-medium">End Date:</span>{" "}
                    {format(new Date(tournament.endDate), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.stats && tournament.stats.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Appearances</TableHead>
                        <TableHead>Minutes</TableHead>
                        <TableHead>Goals</TableHead>
                        <TableHead>Assists</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournament.stats.map((stat: any) => (
                        <TableRow key={stat.id}>
                          <TableCell>
                            <Link href={`/players/${stat.player.id}`} className="hover:underline text-primary">
                              {stat.player.name}
                            </Link>
                          </TableCell>
                          <TableCell>{stat.appearances}</TableCell>
                          <TableCell>{stat.minutes}</TableCell>
                          <TableCell>{stat.goals}</TableCell>
                          <TableCell>{stat.assists}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No player statistics recorded for this tournament
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          <TournamentRosterSection tournamentId={params.id as string} />
        </TabsContent>

        <TabsContent value="travel">
          <TournamentTravelSection tournamentId={params.id as string} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

