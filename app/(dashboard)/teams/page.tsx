"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"
import { getTeamLogo } from "@/lib/team-logo-utils"
import Link from "next/link"

export default function TeamsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { teams, selectedTeam, setSelectedTeam } = useTeam()
  const [search, setSearch] = useState("")
  const [clubLogos, setClubLogos] = useState<any[]>([])

  const user = session?.user as any

  useEffect(() => {
    fetchClubLogos()
  }, [])

  const fetchClubLogos = async () => {
    try {
      const res = await fetch("/api/club-logos")
      if (res.ok) {
        const data = await res.json()
        setClubLogos(data.map((cl: any) => ({
          clubName: cl.clubName,
          logo: cl.logo,
        })))
      }
    } catch (error) {
      console.error("Error fetching club logos:", error)
    }
  }

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.code?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectTeam = (team: any) => {
    setSelectedTeam(team)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Teams</h1>
          <p className="text-xs text-muted-foreground">Manage all your teams</p>
        </div>
        {(user?.role === "ADMIN") && (
          <Link href="/onboarding">
            <Button>Create New Team</Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {teams.length === 0
                ? "No teams found. Create your first team to get started."
                : "No teams match your search"}
            </p>
            {(user?.role === "ADMIN") && teams.length === 0 && (
              <Link href="/onboarding">
                <Button>Create Your First Team</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const teamLogo = getTeamLogo(team, clubLogos)
            const isSelected = selectedTeam?.id === team.id

            return (
              <Card
                key={team.id}
                className={`hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? "ring-2 ring-teal-500 border-teal-500" : ""
                }`}
                onClick={() => handleSelectTeam(team)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {teamLogo ? (
                      <img
                        src={teamLogo}
                        alt={team.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                        <span className="text-xl font-semibold text-white">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 truncate">{team.name}</h3>
                        {isSelected && (
                          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      {team.code && (
                        <p className="text-xs text-slate-500 mt-1">Code: {team.code}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTeam(team)
                          }}
                        >
                          {isSelected ? "Selected" : "Select Team"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
