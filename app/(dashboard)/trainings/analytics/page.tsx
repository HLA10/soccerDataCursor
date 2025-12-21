"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTeam } from "@/contexts/team-context"
import { PieChart } from "@/components/charts/pie-chart"
import { CLASSIFICATION_LEVEL_LABELS } from "@/lib/training-constants"

type RangePreset = "30" | "90" | "365"

export default function TrainingAnalyticsPage() {
  const { selectedTeam } = useTeam()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangePreset, setRangePreset] = useState<RangePreset>("90")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [totals, setTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    const today = new Date()
    const end = today.toISOString().split("T")[0]
    const days = parseInt(rangePreset, 10)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - days)
    const start = startDate.toISOString().split("T")[0]
    setFrom(start)
    setTo(end)
  }, [rangePreset])

  useEffect(() => {
    async function fetchAnalytics() {
      if (!selectedTeam?.id || !from || !to) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.append("teamId", selectedTeam.id)
        params.append("from", from)
        params.append("to", to)
        const res = await fetch(`/api/trainings/analytics?${params.toString()}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to load analytics")
        }
        const data = await res.json()
        setTotals(data.totals || {})
      } catch (err: any) {
        console.error("Error fetching training analytics:", err)
        setError(err.message || "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedTeam, from, to])

  const pieData = Object.entries(totals).map(([level, minutes]) => ({
    label: CLASSIFICATION_LEVEL_LABELS[level] || level,
    value: minutes,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Analytics</h1>
          <p className="text-muted-foreground">
            Distribution of micro / meso / macro / other over your recent training sessions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Preset range</p>
              <div className="inline-flex rounded-md border bg-background p-1">
                {(["30", "90", "365"] as RangePreset[]).map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={rangePreset === preset ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setRangePreset(preset)}
                  >
                    {preset === "30" && "Last 30 days"}
                    {preset === "90" && "Last 90 days"}
                    {preset === "365" && "Last 12 months"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">From</p>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">To</p>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training intensity distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          ) : (
            <PieChart data={pieData} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}










