"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [training, setTraining] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const user = session?.user as any

  useEffect(() => {
    async function fetchTraining() {
      try {
        const res = await fetch(`/api/trainings/${params.id}`)
        const data = await res.json()
        setTraining(data)
      } catch (error) {
        console.error("Error fetching training:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTraining()
  }, [params.id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!training) {
    return <div className="text-center py-8">Training not found</div>
  }

  const attended = training.attendance?.filter((a: any) => a.attended) || []
  const absent = training.attendance?.filter((a: any) => !a.attended) || []

  const getAbsenceReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      INJURED: "bg-red-100 text-red-800",
      SICK: "bg-yellow-100 text-yellow-800",
      UNEXCUSED: "bg-gray-100 text-gray-800",
      OTHER: "bg-blue-100 text-blue-800",
    }
    return colors[reason] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Link href={`/trainings/${params.id}/edit`}>
            <Button>Edit Training</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Training Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(training.date), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">
                {training.startTime}
                {training.endTime && ` - ${training.endTime}`}
              </p>
            </div>
            {training.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{training.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{training.team?.name}</p>
            </div>
          </div>
          {training.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{training.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Attended ({attended.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attended.length === 0 ? (
              <p className="text-sm text-muted-foreground">No players attended</p>
            ) : (
              <div className="space-y-2">
                {attended.map((att: any) => (
                  <Link
                    key={att.playerId}
                    href={`/players/${att.playerId}`}
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    {att.player.name}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Absent ({absent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {absent.length === 0 ? (
              <p className="text-sm text-muted-foreground">All players attended</p>
            ) : (
              <div className="space-y-3">
                {absent.map((att: any) => (
                  <div key={att.playerId} className="border-b pb-2 last:border-b-0">
                    <Link
                      href={`/players/${att.playerId}`}
                      className="block text-sm font-medium hover:text-primary transition-colors mb-1"
                    >
                      {att.player.name}
                    </Link>
                    {att.absenceReason && (
                      <Badge className={getAbsenceReasonBadge(att.absenceReason)}>
                        {att.absenceReason.replace("_", " ")}
                      </Badge>
                    )}
                    {att.absenceComment && (
                      <p className="text-xs text-muted-foreground mt-1">{att.absenceComment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





