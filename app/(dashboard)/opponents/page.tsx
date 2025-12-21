"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function OpponentsPage() {
  const { data: session } = useSession()
  const [opponents, setOpponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchOpponents()
  }, [search])

  const fetchOpponents = async () => {
    setLoading(true)
    try {
      const url = search ? `/api/opponents?search=${encodeURIComponent(search)}` : "/api/opponents"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setOpponents(data)
      }
    } catch (error) {
      console.error("Error fetching opponents:", error)
    } finally {
      setLoading(false)
    }
  }

  const user = session?.user as any

  if (loading) {
    return <div className="text-center py-8">Loading opponents...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opponents</h1>
          <p className="text-muted-foreground">View opponent clubs and teams</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href="/opponents/new">
            <Button>New Opponent</Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search opponents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {opponents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No opponents found.</p>
            {(user?.role === "ADMIN" || user?.role === "COACH") && (
              <Link href="/opponents/new">
                <Button>Create Your First Opponent</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opponents.map((opponent) => (
            <Link key={opponent.id} href={`/opponents/${opponent.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {opponent.logo && (
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                        <Image
                          src={opponent.logo}
                          alt={opponent.name}
                          fill
                          className="object-contain p-1"
                          style={{ objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{opponent.name}</CardTitle>
                      {opponent.location && (
                        <p className="text-sm text-gray-500 mt-1">{opponent.location}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {opponent.homeField && (
                      <p className="text-sm">
                        <span className="font-medium">Home Field:</span> {opponent.homeField}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      {opponent.primaryColor && (
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: opponent.primaryColor }}
                          title="Primary Color"
                        />
                      )}
                      {opponent.secondaryColor && (
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: opponent.secondaryColor }}
                          title="Secondary Color"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>{opponent._count?.games || 0} games</span>
                      <span>{opponent._count?.scoutedPlayers || 0} scouted players</span>
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

