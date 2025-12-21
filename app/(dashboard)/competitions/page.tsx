"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { format } from "date-fns"
import { isEmoji } from "@/lib/logo-utils"

export default function CompetitionsPage() {
  const { data: session } = useSession()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterSeason, setFilterSeason] = useState("")

  useEffect(() => {
    fetchCompetitions()
  }, [search, filterType, filterSeason])

  const fetchCompetitions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterType) params.append("type", filterType)
      if (filterSeason) params.append("season", filterSeason)

      const url = params.toString()
        ? `/api/competitions?${params.toString()}`
        : "/api/competitions"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setCompetitions(data)
      }
    } catch (error) {
      console.error("Error fetching competitions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string, customType?: string) => {
    if (type === "CUSTOM" && customType) return customType
    return type.replace("_", " ")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CUP":
        return "bg-purple-100 text-purple-800"
      case "TOURNAMENT":
        return "bg-blue-100 text-blue-800"
      case "FRIENDLY":
        return "bg-green-100 text-green-800"
      case "MATCH_CAMP":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const user = session?.user as any

  if (loading && competitions.length === 0) {
    return <div className="text-center py-8">Loading competitions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitions</h1>
          <p className="text-muted-foreground">
            Manage cups, tournaments, friendly games, and match camps
          </p>
        </div>
        {(user?.role === "ADMIN" ||
          user?.role === "COACH" ||
          user?.role === "SUPER_USER") && (
          <Link href="/competitions/new">
            <Button>Add Competition</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search competitions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="CUP">Cup</option>
          <option value="TOURNAMENT">Tournament</option>
          <option value="FRIENDLY">Friendly</option>
          <option value="MATCH_CAMP">Match Camp</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <Input
          placeholder="Filter by season..."
          value={filterSeason}
          onChange={(e) => setFilterSeason(e.target.value)}
        />
      </div>

      {competitions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No competitions found. Create your first competition.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <Link key={competition.id} href={`/competitions/${competition.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {competition.logo && (
                      <div className="flex-shrink-0">
                        {isEmoji(competition.logo) ? (
                          <div className="w-16 h-16 flex items-center justify-center text-4xl">
                            {competition.logo}
                          </div>
                        ) : (
                          <div className="relative w-16 h-16">
                            <Image
                              src={competition.logo}
                              alt={competition.name}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {competition.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getTypeColor(
                            competition.type
                          )}`}
                        >
                          {getTypeLabel(competition.type, competition.customType)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {competition.season}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competition.location && (
                      <p className="text-sm">
                        <span className="font-medium">Location:</span>{" "}
                        {competition.location}
                      </p>
                    )}
                    {competition.startDate && (
                      <p className="text-sm">
                        <span className="font-medium">Start:</span>{" "}
                        {format(
                          new Date(competition.startDate),
                          "MMM d, yyyy"
                        )}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>{competition._count?.games || 0} games</span>
                      <span>
                        {competition.teams?.length || 0} team
                        {(competition.teams?.length || 0) !== 1 ? "s" : ""}
                      </span>
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

