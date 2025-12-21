"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { useTeam } from "@/contexts/team-context"
import { TaskLoadSpiderChart } from "@/components/players/task-load-spider-chart"

export default function AdminWellnessPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [players, setPlayers] = useState<any[]>([])
  const [wellnessData, setWellnessData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const user = session?.user as any

  useEffect(() => {
    if (session) {
      const allowedRoles = ["ADMIN", "SUPER_USER", "COACH"]
      if (!allowedRoles.includes(user?.role)) {
        router.push("/dashboard")
        return
      }
    }
    fetchPlayers()
  }, [session, selectedTeam])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const teamFilter = selectedTeam?.id ? `?teamId=${selectedTeam.id}` : ""
      const res = await fetch(`/api/players${teamFilter}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
        fetchWellnessData(data)
      }
    } catch (error) {
      console.error("Error fetching players:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWellnessData = async (playersList: any[]) => {
    const wellnessPromises = playersList.map(async (player) => {
      try {
        const res = await fetch(`/api/task-load?playerId=${player.id}&limit=1`)
        if (res.ok) {
          const data = await res.json()
          return { playerId: player.id, latestResponse: data[0] || null }
        }
      } catch (error) {
        console.error(`Error fetching wellness for player ${player.id}:`, error)
      }
      return { playerId: player.id, latestResponse: null }
    })

    const results = await Promise.all(wellnessPromises)
    const wellnessMap: Record<string, any> = {}
    results.forEach((result) => {
      wellnessMap[result.playerId] = result.latestResponse
    })
    setWellnessData(wellnessMap)
  }

  const getWellnessStatus = (response: any) => {
    if (!response) return { label: "No Data", bg: "bg-slate-100", text: "text-slate-500" }
    
    const avg = (
      response.mentalEffort +
      response.physicalEffort +
      response.timePressure +
      (100 - response.performance) +
      response.effort +
      response.frustration
    ) / 6

    if (avg < 30) return { label: "Low", bg: "bg-emerald-100", text: "text-emerald-700" }
    if (avg < 50) return { label: "Moderate", bg: "bg-amber-100", text: "text-amber-700" }
    if (avg < 70) return { label: "High", bg: "bg-orange-100", text: "text-orange-700" }
    return { label: "Very High", bg: "bg-red-100", text: "text-red-700" }
  }

  if (!session || !["ADMIN", "SUPER_USER", "COACH"].includes(user?.role)) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Player Wellness</h1>
        <p className="text-xs text-muted-foreground">
          Monitor task load and wellness across your team
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading wellness data...</div>
      ) : players.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No players found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const latestResponse = wellnessData[player.id]
            const status = getWellnessStatus(latestResponse)
            
            return (
              <Link key={player.id} href={`/players/${player.id}?tab=wellness`}>
                <Card className="hover:shadow-md hover:border-teal-300 transition-all cursor-pointer h-full group">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {player.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                            {player.name}
                          </h3>
                          {player.primaryTeam && (
                            <p className="text-[10px] text-slate-400">
                              {player.primaryTeam.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    {latestResponse ? (
                      <div className="space-y-3">
                        {/* Spider Chart */}
                        <div className="flex justify-center py-2">
                          <TaskLoadSpiderChart
                            response={latestResponse}
                            size={140}
                            showLabels={false}
                          />
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-1">
                          <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-xs font-bold text-slate-900">{latestResponse.mentalEffort}</div>
                            <div className="text-[9px] text-slate-400 uppercase">Mental</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-xs font-bold text-slate-900">{latestResponse.physicalEffort}</div>
                            <div className="text-[9px] text-slate-400 uppercase">Physical</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-xs font-bold text-slate-900">{latestResponse.timePressure}</div>
                            <div className="text-[9px] text-slate-400 uppercase">Time</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-xs font-bold text-slate-900">{latestResponse.performance}</div>
                            <div className="text-[9px] text-slate-400 uppercase">Perf</div>
                          </div>
                        </div>
                        
                        {/* Last Updated */}
                        <p className="text-[10px] text-slate-400 text-center">
                          Updated {format(new Date(latestResponse.submittedAt), "MMM d")}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-slate-400 text-lg">—</span>
                        </div>
                        <p className="text-xs text-slate-400">No wellness data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}



