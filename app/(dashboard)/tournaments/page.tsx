"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

export default function TournamentsPage() {
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const user = session?.user as any

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await fetch("/api/tournaments")
        const data = await res.json()
        setTournaments(data)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground">View tournament statistics</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href="/tournaments/new">
            <Button>Add Tournament</Button>
          </Link>
        )}
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tournaments found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tournament.season} • {tournament.type}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Start:</span>{" "}
                    {format(new Date(tournament.startDate), "MMM d, yyyy")}
                  </p>
                  {tournament.endDate && (
                    <p className="text-sm">
                      <span className="font-medium">End:</span>{" "}
                      {format(new Date(tournament.endDate), "MMM d, yyyy")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {tournament.stats?.length || 0} player(s) with statistics
                  </p>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

