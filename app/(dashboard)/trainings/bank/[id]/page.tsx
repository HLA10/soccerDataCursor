"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerManagementSection } from "@/components/training/player-management-section"
import { SessionPlanSection } from "@/components/training/session-plan-section"
import { Calendar, MapPin, Clock } from "lucide-react"

export default function TrainingBankDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [training, setTraining] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const user = session?.user as any

  useEffect(() => {
    fetchTraining()
  }, [params.id])

  async function fetchTraining() {
    try {
      setLoading(true)
      const res = await fetch(`/api/trainings/${params.id}`)
      const data = await res.json()
      setTraining(data)
    } catch (error) {
      console.error("Error fetching training:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!training) {
    return <div className="text-center py-8">Training not found</div>
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "COACH" || user?.role === "SUPER_USER"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/trainings/bank")}>
            ← Back
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => router.push(`/trainings/${params.id}/edit`)}>
                Edit
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  const tabs = ["overview", "players", "session-plan", "attendance"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1])
                  }
                }}
                disabled={activeTab === "attendance"}
              >
                Save & Next →
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="session-plan">Session Plan</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(training.date), "MMMM d, yyyy")} • {training.startTime}
                      {training.endTime && ` - ${training.endTime}`}
                    </p>
                  </div>
                </div>
                {training.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {training.location}
                        {training.field && ` • ${training.field}`}
                      </p>
                    </div>
                  </div>
                )}
                {training.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{training.duration} minutes</p>
                    </div>
                  </div>
                )}
                {training.gathering && (
                  <div>
                    <p className="text-sm font-medium">Gathering Location</p>
                    <p className="text-sm text-muted-foreground">{training.gathering}</p>
                  </div>
                )}
              </div>
              {training.template && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Template Used</p>
                  <p className="text-sm text-muted-foreground">{training.template.name}</p>
                  {training.template.description && (
                    <p className="text-sm text-muted-foreground mt-1">{training.template.description}</p>
                  )}
                </div>
              )}
              {training.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{training.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <PlayerManagementSection
            trainingId={params.id as string}
            canEdit={canEdit}
            onUpdate={fetchTraining}
          />
        </TabsContent>

        <TabsContent value="session-plan">
          <SessionPlanSection
            trainingId={params.id as string}
            training={training}
            canEdit={canEdit}
            onUpdate={fetchTraining}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {training.attendance && training.attendance.length > 0 ? (
                <div className="space-y-2">
                  {training.attendance.map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{att.player.name}</p>
                        {!att.attended && att.absenceReason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {att.absenceReason}
                            {att.absenceComment && ` - ${att.absenceComment}`}
                          </p>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          att.attended
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {att.attended ? "Attended" : "Absent"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attendance records yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

