"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/contexts/team-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default function TrainingStatisticsPage() {
  const { selectedTeam } = useTeam()
  const [statistics, setStatistics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatistics() {
      try {
        const params = new URLSearchParams()
        if (selectedTeam?.id) params.append("teamId", selectedTeam.id)

        const [trainingsRes, playersRes] = await Promise.all([
          fetch(`/api/trainings?${params.toString()}`),
          fetch(`/api/players?${params.toString()}`),
        ])

        const trainings = await trainingsRes.json()
        const players = await playersRes.json()

        // Calculate statistics for each player
        const stats = players.map((player: any) => {
          const playerAttendances = trainings.flatMap((training: any) =>
            training.attendance?.filter((att: any) => att.playerId === player.id) || []
          )

          const totalTrainings = trainings.length
          const attendedCount = playerAttendances.filter((att: any) => att.attended).length
          const absentCount = playerAttendances.filter((att: any) => !att.attended).length
          const attendanceRate = totalTrainings > 0 ? (attendedCount / totalTrainings) * 100 : 0

          // Calculate total training minutes
          const totalMinutes = trainings.reduce((sum: number, training: any) => {
            const attendance = training.attendance?.find((att: any) => att.playerId === player.id)
            if (attendance?.attended && training.duration) {
              return sum + training.duration
            }
            return sum
          }, 0)

          // Count absence reasons
          const absenceReasons = {
            injured: playerAttendances.filter((att: any) => att.absenceReason === "INJURED").length,
            sick: playerAttendances.filter((att: any) => att.absenceReason === "SICK").length,
            unexcused: playerAttendances.filter((att: any) => att.absenceReason === "UNEXCUSED").length,
            other: playerAttendances.filter((att: any) => att.absenceReason === "OTHER").length,
          }

          return {
            player,
            totalTrainings,
            attendedCount,
            absentCount,
            attendanceRate,
            totalMinutes,
            absenceReasons,
          }
        })

        setStatistics(stats.sort((a: any, b: any) => b.attendanceRate - a.attendanceRate))
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [selectedTeam])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Statistics</h1>
        <p className="text-muted-foreground">Training minutes and attendance rates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Training Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Total Trainings</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Total Minutes</TableHead>
                <TableHead>Absence Reasons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat) => (
                <TableRow key={stat.player.id}>
                  <TableCell>
                    <Link
                      href={`/players/${stat.player.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {stat.player.name}
                    </Link>
                  </TableCell>
                  <TableCell>{stat.totalTrainings}</TableCell>
                  <TableCell className="text-green-600 font-medium">{stat.attendedCount}</TableCell>
                  <TableCell className="text-red-600 font-medium">{stat.absentCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{stat.attendanceRate.toFixed(1)}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stat.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{stat.totalMinutes} min</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {stat.absenceReasons.injured > 0 && (
                        <div className="text-red-600">Injured: {stat.absenceReasons.injured}</div>
                      )}
                      {stat.absenceReasons.sick > 0 && (
                        <div className="text-yellow-600">Sick: {stat.absenceReasons.sick}</div>
                      )}
                      {stat.absenceReasons.unexcused > 0 && (
                        <div className="text-gray-600">Unexcused: {stat.absenceReasons.unexcused}</div>
                      )}
                      {stat.absenceReasons.other > 0 && (
                        <div className="text-blue-600">Other: {stat.absenceReasons.other}</div>
                      )}
                      {Object.values(stat.absenceReasons).every((v) => v === 0) && (
                        <div className="text-gray-400">None</div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}



