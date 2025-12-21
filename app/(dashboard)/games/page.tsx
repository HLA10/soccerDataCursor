"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { exportToCSV, formatGamesForExport } from "@/lib/export"

export default function GamesPage() {
  const { data: session } = useSession()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [competitionFilter, setCompetitionFilter] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const user = session?.user as any

  const totalPages = Math.ceil(games.length / itemsPerPage)
  const paginatedGames = games.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const fetchGames = async () => {
    try {
      const url = competitionFilter
        ? `/api/games?competition=${encodeURIComponent(competitionFilter)}`
        : "/api/games"
      const res = await fetch(url)
      const data = await res.json()
      setGames(data)
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [competitionFilter])

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === games.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(games.map((g) => g.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} game(s)?`)) return

    setDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/games/${id}`, { method: "DELETE" })
        )
      )
      setSelectedIds(new Set())
      fetchGames()
    } catch (error) {
      console.error("Error deleting games:", error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Games</h1>
          <p className="text-xs text-muted-foreground">Manage game records</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <div className="flex items-center space-x-2">
            {games.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(formatGamesForExport(games), "games")}
              >
                Export CSV
              </Button>
            )}
            <Link href="/games/new">
              <Button>Add Game</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by competition..."
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {(user?.role === "ADMIN" || user?.role === "COACH") && selectedIds.size > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected} disabled={deleting}>
            {deleting ? "Deleting..." : `Delete (${selectedIds.size})`}
          </Button>
        )}
      </div>

      {games.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {(user?.role === "ADMIN" || user?.role === "COACH") && (
              <>
                <Checkbox
                  checked={selectedIds.size === games.length && games.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ←
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                →
              </Button>
            </div>
          )}
        </div>
      )}

      {games.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No games found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedGames.map((game) => (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {(user?.role === "ADMIN" || user?.role === "COACH") && (
                      <Checkbox
                        checked={selectedIds.has(game.id)}
                        onCheckedChange={() => toggleSelect(game.id)}
                      />
                    )}
                    <div className="flex items-center gap-2 flex-1">
                      {/* Team Name with Logo */}
                      <div className="flex items-center gap-2">
                        <Link href={`/games/${game.id}`} className="hover:underline text-primary font-semibold">
                          {game.team?.name || "Your Team"}
                        </Link>
                    {game.team?.logo && (
                          <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden bg-white rounded-full border-2 border-gray-300 shadow-md" style={{ aspectRatio: "1/1" }}>
                        <img
                          src={game.team.logo}
                          alt={game.team.name}
                              className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    </div>
                      
                      {/* VS */}
                      <span className="text-gray-500 font-medium mx-2">vs</span>
                      
                      {/* Opponent Logo with Name */}
                      <div className="flex items-center gap-2">
                        {(game.opponentClub?.logo || game.opponentLogo) && (
                          <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden bg-white rounded-full border-2 border-gray-300 shadow-md" style={{ aspectRatio: "1/1" }}>
                        <img
                              src={game.opponentClub?.logo || game.opponentLogo}
                              alt={game.opponentClub?.name || game.opponent}
                              className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                        <Link href={`/games/${game.id}`} className="hover:underline text-primary font-semibold">
                          {game.opponentClub?.name || game.opponent}
                        </Link>
                      </div>
                    </div>
                    
                    {/* Date and Venue */}
                    <div className="text-sm text-muted-foreground hidden md:block">
                      <p>{format(new Date(game.date), "MMMM d, yyyy")}</p>
                      <p>{game.venue}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {game.score && (
                      <p className="text-2xl font-bold">{game.score}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {game.competition}
                    </p>
                    {/* Date and Venue for mobile */}
                    <div className="text-xs text-muted-foreground mt-1 md:hidden">
                      <p>{format(new Date(game.date), "MMM d, yyyy")}</p>
                      <p className="truncate max-w-[100px]">{game.venue}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {game.stats?.length || 0} player(s) with statistics
                  </p>
                  <Link href={`/games/${game.id}`}>
                    <Button variant="outline" size="sm">
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

