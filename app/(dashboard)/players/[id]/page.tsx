"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsTable } from "@/components/stats/stats-table"
import { CommentSection } from "@/components/comments/comment-section"
import { InjuryStatusBadge } from "@/components/players/injury-status-badge"
import { SpiderChart } from "@/components/players/spider-chart"
import { TaskLoadSpiderChart } from "@/components/players/task-load-spider-chart"
import { TaskLoadTrendChart } from "@/components/players/task-load-trend-chart"
import { IUPSection } from "@/components/individual-development/iup-section"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StarRating } from "@/components/ui/star-rating"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PasswordConfirmDialog } from "@/components/ui/password-confirm-dialog"
import { PlayerContactsTab } from "@/components/players/player-contacts-tab"
import { ImageCropper } from "@/components/ui/image-cropper"

export default function PlayerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("games")

  const user = session?.user as any

  const [isInjured, setIsInjured] = useState(false)
  const [isSick, setIsSick] = useState(false)
  const [injuryDescription, setInjuryDescription] = useState("")
  const [illnessDescription, setIllnessDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [isUnderContract, setIsUnderContract] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [updatingContract, setUpdatingContract] = useState(false)
  const [taskLoadResponses, setTaskLoadResponses] = useState<any[]>([])
  const [loadingTaskLoad, setLoadingTaskLoad] = useState(false)
  const [showPhotoCropper, setShowPhotoCropper] = useState(false)
  const [selectedPhotoImage, setSelectedPhotoImage] = useState<string | null>(null)
  const [savingPhoto, setSavingPhoto] = useState(false)

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/players/${params.id}`)
        const data = await res.json()
        setPlayer(data)
      } catch (error) {
        console.error("Error fetching player:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

  useEffect(() => {
    async function fetchTaskLoad() {
      if (!params.id) return
      try {
        setLoadingTaskLoad(true)
        // Fetch all historical data for trend chart, not just last 20
        const res = await fetch(`/api/task-load?playerId=${params.id}&limit=1000`)
        if (res.ok) {
          const data = await res.json()
          setTaskLoadResponses(data)
        }
      } catch (error) {
        console.error("Error fetching task load responses:", error)
      } finally {
        setLoadingTaskLoad(false)
      }
    }

    if (activeTab === "wellness") {
      fetchTaskLoad()
    }
  }, [params.id, activeTab])

  // Sync with player data when it loads
  useEffect(() => {
    if (player) {
      setIsInjured(player.isInjured || false)
      setIsSick(player.isSick || false)
      setInjuryDescription(player.injuryDescription || "")
      setIllnessDescription(player.illnessDescription || "")
      setIsUnderContract(player.isUnderContract !== undefined ? player.isUnderContract : true)
    }
  }, [player])

  const handleContractStatusChange = (checked: boolean) => {
    if (checked) {
      // Marking as under contract - no password needed
      updateContractStatus(true)
    } else {
      // Marking as out of contract - require password
      setShowPasswordDialog(true)
    }
  }

  const updateContractStatus = async (status: boolean, password?: string) => {
    setUpdatingContract(true)
    try {
      const res = await fetch(`/api/players/${params.id}/contract`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isUnderContract: status,
          password: password,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setPlayer(updated)
        setIsUnderContract(status)
        if (!status) {
          alert("Player marked as out of contract and removed from team.")
        } else {
          alert("Player marked as under contract and added back to team.")
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to update contract status")
        // Revert the switch
        setIsUnderContract(!status)
      }
    } catch (error) {
      console.error("Error updating contract status:", error)
      alert("An error occurred. Please try again.")
      // Revert the switch
      setIsUnderContract(!status)
    } finally {
      setUpdatingContract(false)
      setShowPasswordDialog(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!player) {
    return <div className="text-center py-8">Player not found</div>
  }

  // Calculate totals
  const totalMinutes = player.gameStats?.reduce(
    (sum: number, stat: any) => sum + stat.minutes,
    0
  ) || 0
  const totalGoals = player.gameStats?.reduce(
    (sum: number, stat: any) => sum + stat.goals,
    0
  ) || 0
  const totalAssists = player.gameStats?.reduce(
    (sum: number, stat: any) => sum + stat.assists,
    0
  ) || 0
  const totalGames = player.gameStats?.length || 0
  
  // Calculate average rating
  const ratings = player.gameStats?.filter((s: any) => s.rating).map((s: any) => s.rating) || []
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
    : null
  
  // Calculate total cards
  const totalYellowCards = player.gameStats?.reduce((sum: number, stat: any) => sum + (stat.yellowCards || 0), 0) || 0
  const totalRedCards = player.gameStats?.reduce((sum: number, stat: any) => sum + (stat.redCards || 0), 0) || 0

  // Calculate max values for spider chart (using reasonable defaults or fetching all players)
  const maxValues = {
    goals: Math.max(10, totalGoals * 1.5),
    assists: Math.max(10, totalAssists * 1.5),
    minutes: Math.max(1000, totalMinutes * 1.2),
    games: Math.max(10, totalGames * 1.5),
    avgRating: 10,
    yellowCards: Math.max(5, totalYellowCards * 2),
    redCards: Math.max(2, totalRedCards * 2),
  }

  const spiderStats = {
    goals: totalGoals,
    assists: totalAssists,
    minutes: totalMinutes,
    games: totalGames,
    avgRating: avgRating,
    yellowCards: totalYellowCards,
    redCards: totalRedCards,
  }

  const canEditPhoto = user?.role === "ADMIN" || user?.role === "COACH"

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedPhotoImage(reader.result as string)
      setShowPhotoCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoCropComplete = async (croppedImage: string) => {
    setShowPhotoCropper(false)
    setSelectedPhotoImage(null)
    setSavingPhoto(true)
    try {
      const res = await fetch(`/api/players/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: croppedImage }),
      })
      if (res.ok) {
        setPlayer((prev: any) => ({ ...prev, photo: croppedImage }))
      } else {
        alert("Failed to save photo")
      }
    } catch (err) {
      alert("Error saving photo")
    } finally {
      setSavingPhoto(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/players")}>
          ← Back
        </Button>
        {(user?.role === "ADMIN" || user?.role === "COACH") && (
          <Button onClick={() => router.push(`/players/${params.id}/edit`)}>
            Edit Player
          </Button>
        )}
      </div>

      {/* Player Profile Section */}
      <Card className="border-2 border-black shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Player Photo - Instagram-style upload */}
            <div className="flex-shrink-0 relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-upload"
                disabled={!canEditPhoto || savingPhoto}
              />
              <label
                htmlFor={canEditPhoto ? "photo-upload" : undefined}
                className={canEditPhoto ? "cursor-pointer" : ""}
              >
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center border-4 border-gray-200 shadow-md">
                    <span className="text-5xl font-bold text-white">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                )}
                {canEditPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {savingPhoto ? "Saving..." : "Change Photo"}
                    </span>
                  </div>
                )}
              </label>

              {/* Cropper Modal */}
              {showPhotoCropper && selectedPhotoImage && (
                <ImageCropper
                  image={selectedPhotoImage}
                  onCropComplete={handlePhotoCropComplete}
                  onCancel={() => {
                    setShowPhotoCropper(false)
                    setSelectedPhotoImage(null)
                  }}
                />
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{player.name}</h1>
              <div className="flex items-center space-x-3 mb-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">{player.position}</Badge>
                {player.jerseyNumber && (
                  <Badge variant="outline" className="text-sm px-3 py-1">#{player.jerseyNumber}</Badge>
                )}
                <InjuryStatusBadge
                  hasInjury={isInjured}
                  hasIllness={isSick}
                />
              </div>
              {player.dateOfBirth && (
                <p className="text-sm text-gray-600 mb-4">
                  Born: {format(new Date(player.dateOfBirth), "MMMM d, yyyy")}
                </p>
              )}

              {/* Contract Status Toggle - Only for ADMIN and COACH */}
              {(user?.role === "ADMIN" || user?.role === "COACH") && (
                <div className="flex items-center space-x-3 mb-4 p-3 rounded-md border-2 border-gray-300 bg-gray-50">
                  <Switch
                    checked={isUnderContract}
                    onCheckedChange={handleContractStatusChange}
                    disabled={updatingContract}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium cursor-pointer">
                      Contract Status:{" "}
                      <span className={isUnderContract ? "text-green-600 font-bold" : "text-gray-500"}>
                        {isUnderContract ? "Under Contract" : "Out of Contract"}
                      </span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {isUnderContract
                        ? "Player is currently under contract with the team"
                        : "Player is out of contract and removed from team listings"}
                    </p>
                  </div>
                </div>
              )}

              {/* Contract Status Display - For VIEWER */}
              {user?.role === "VIEWER" && (
                <div className="mb-4">
                  <Badge
                    variant={isUnderContract ? "default" : "secondary"}
                    className={isUnderContract ? "bg-green-600 text-white" : ""}
                  >
                    {isUnderContract ? "Under Contract" : "Out of Contract"}
                  </Badge>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 text-center border-2 border-black">
                  <p className="text-2xl font-bold text-black">{totalGames}</p>
                  <p className="text-xs text-gray-600 mt-1">Games</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border-2 border-black">
                  <p className="text-2xl font-bold text-black">{totalMinutes}</p>
                  <p className="text-xs text-gray-600 mt-1">Minutes</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border-2 border-black">
                  <p className="text-2xl font-bold text-black">{totalGoals}</p>
                  <p className="text-xs text-gray-600 mt-1">Goals</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border-2 border-black">
                  <p className="text-2xl font-bold text-black">{totalAssists}</p>
                  <p className="text-xs text-gray-600 mt-1">Assists</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spider Chart and Games List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spider Chart Section */}
        <Card className="border-2 border-black shadow-lg">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-xl">Performance Radar</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <SpiderChart stats={spiderStats} maxValues={maxValues} />
            </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-white border border-black rounded">
                <span className="font-semibold text-black">Avg Rating: </span>
                {avgRating ? (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <StarRating value={Math.max(1, Math.min(5, avgRating))} readonly size="sm" />
                    <span className="text-black">({avgRating.toFixed(1)})</span>
                  </div>
                ) : (
                  <span className="text-black">N/A</span>
                )}
              </div>
              <div className="text-center p-2 bg-white border border-black rounded">
                <span className="font-semibold text-black">Cards: </span>
                <span className="text-black">{totalYellowCards}Y</span>
                <span className="text-black ml-1">{totalRedCards}R</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games List Section */}
        <Card className="border-2 border-black shadow-lg">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-xl">Games Played ({totalGames})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {player.gameStats && player.gameStats.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead className="text-center">Minutes</TableHead>
                      <TableHead className="text-center">Goals</TableHead>
                      <TableHead className="text-center">Assists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.gameStats
                      .sort((a: any, b: any) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime())
                      .map((stat: any) => (
                        <TableRow key={stat.id}>
                          <TableCell className="text-sm">
                            {format(new Date(stat.game.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/games/${stat.game.id}`} 
                              className="hover:underline text-primary font-medium"
                            >
                              {stat.game.opponent}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center font-semibold">{stat.minutes}'</TableCell>
                          <TableCell className="text-center">
                            {stat.goals > 0 ? (
                              <Badge variant="default" className="bg-black text-white">{stat.goals}</Badge>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {stat.assists > 0 ? (
                              <Badge variant="default" className="bg-black text-white">{stat.assists}</Badge>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No games played yet</p>
            )}
            <div className="mt-4 pt-4 border-t border-black">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-black">Total Minutes:</span>
                <span className="text-2xl font-bold text-black">{totalMinutes}'</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="games">Game Statistics</TabsTrigger>
          <TabsTrigger value="tournaments">Tournament Statistics</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="injuries">Injuries</TabsTrigger>
          <TabsTrigger value="illnesses">Illnesses</TabsTrigger>
          <TabsTrigger value="iup">IUP</TabsTrigger>
          <TabsTrigger value="comments">Development Comments</TabsTrigger>
          <TabsTrigger value="contacts">Contacts & Medical</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <StatsTable
            stats={player.gameStats || []}
            type="game"
            playerId={player.id}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH"}
          />
        </TabsContent>

        <TabsContent value="tournaments">
          <StatsTable
            stats={player.tournamentStats || []}
            type="tournament"
            playerId={player.id}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH"}
          />
        </TabsContent>

        <TabsContent value="wellness">
          {user?.role === "PLAYER" ? (
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <p className="text-center text-gray-500">
                  Charts are only visible to coaches and staff. Players can submit wellness data through the player portal.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Latest Spider Chart */}
              {loadingTaskLoad ? (
                <Card className="border-2 border-black">
                  <CardContent className="p-6">
                    <p className="text-center text-gray-500">Loading task load data...</p>
                  </CardContent>
                </Card>
              ) : taskLoadResponses.length > 0 ? (
                <>
                  <Card className="border-2 border-black">
                    <CardHeader className="bg-black text-white">
                      <CardTitle>
                        Current Wellness State
                        {taskLoadResponses[0]?.submittedAt && (
                          <span className="text-sm font-normal ml-2">
                            ({format(new Date(taskLoadResponses[0].submittedAt), "MMM d, yyyy")})
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-center">
                        <TaskLoadSpiderChart response={taskLoadResponses[0]} size={350} />
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Mental ansträngning: </span>
                          <span>{taskLoadResponses[0].mentalEffort}/100</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Fysisk ansträngning: </span>
                          <span>{taskLoadResponses[0].physicalEffort}/100</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Tidskrav: </span>
                          <span>{taskLoadResponses[0].timePressure}/100</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Prestation: </span>
                          <span>{taskLoadResponses[0].performance}/100</span>
                          <span className="text-xs text-gray-500 ml-1">(high = bad)</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Ansträngning: </span>
                          <span>{taskLoadResponses[0].effort}/100</span>
                        </div>
                        <div className="text-center p-3 bg-gray-50 border border-gray-300 rounded">
                          <span className="font-semibold">Frustration: </span>
                          <span>{taskLoadResponses[0].frustration}/100</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yearly Trend Chart */}
                  {taskLoadResponses.length > 1 && (
                    <Card className="border-2 border-black">
                      <CardHeader className="bg-black text-white">
                        <CardTitle>Wellness Trends Over Time ({taskLoadResponses.length} responses)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="w-full">
                          <TaskLoadTrendChart responses={taskLoadResponses} width={800} height={400} />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-2 border-black">
                  <CardContent className="p-6">
                    <p className="text-center text-gray-500">
                      No task load responses yet. Player has not submitted wellness data.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="injuries">
          <Card className="border-2 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle>Injury Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isInjured"
                    checked={isInjured}
                    onChange={(e) => setIsInjured(e.target.checked)}
                    disabled={user?.role !== "ADMIN" && user?.role !== "COACH"}
                    className="w-5 h-5 border-2 border-black rounded"
                  />
                  <label htmlFor="isInjured" className="text-lg font-semibold text-black">
                    Player is currently injured
                  </label>
                </div>
                {isInjured && (
                  <div>
                    <label htmlFor="injuryDescription" className="block text-sm font-medium text-black mb-2">
                      Injury Description
                    </label>
                    <textarea
                      id="injuryDescription"
                      value={injuryDescription}
                      onChange={(e) => setInjuryDescription(e.target.value)}
                      disabled={user?.role !== "ADMIN" && user?.role !== "COACH"}
                      placeholder="Describe the injury..."
                      className="w-full p-3 border-2 border-black rounded-md min-h-[100px] resize-y"
                    />
                  </div>
                )}
                {(user?.role === "ADMIN" || user?.role === "COACH") && (
                  <Button
                    onClick={async () => {
                      setSaving(true)
                      try {
                        const res = await fetch(`/api/players/${params.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            isInjured,
                            injuryDescription,
                            isSick,
                            illnessDescription,
                          }),
                        })
                        if (res.ok) {
                          const updated = await res.json()
                          setPlayer(updated)
                        }
                      } catch (error) {
                        console.error("Error saving:", error)
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="illnesses">
          <Card className="border-2 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle>Illness Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isSick"
                    checked={isSick}
                    onChange={(e) => setIsSick(e.target.checked)}
                    disabled={user?.role !== "ADMIN" && user?.role !== "COACH"}
                    className="w-5 h-5 border-2 border-black rounded"
                  />
                  <label htmlFor="isSick" className="text-lg font-semibold text-black">
                    Player is currently sick
                  </label>
                </div>
                {isSick && (
                  <div>
                    <label htmlFor="illnessDescription" className="block text-sm font-medium text-black mb-2">
                      Illness Description
                    </label>
                    <textarea
                      id="illnessDescription"
                      value={illnessDescription}
                      onChange={(e) => setIllnessDescription(e.target.value)}
                      disabled={user?.role !== "ADMIN" && user?.role !== "COACH"}
                      placeholder="Describe the illness..."
                      className="w-full p-3 border-2 border-black rounded-md min-h-[100px] resize-y"
                    />
                  </div>
                )}
                {(user?.role === "ADMIN" || user?.role === "COACH") && (
                  <Button
                    onClick={async () => {
                      setSaving(true)
                      try {
                        const res = await fetch(`/api/players/${params.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            isInjured,
                            injuryDescription,
                            isSick,
                            illnessDescription,
                          }),
                        })
                        if (res.ok) {
                          const updated = await res.json()
                          setPlayer(updated)
                        }
                      } catch (error) {
                        console.error("Error saving:", error)
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iup">
          <IUPSection
            playerId={player.id}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH"}
          />
        </TabsContent>

        <TabsContent value="comments">
          <CommentSection
            playerId={player.id}
            comments={player.comments || []}
            canEdit={user?.role === "ADMIN" || user?.role === "COACH"}
          />
        </TabsContent>

        <TabsContent value="contacts">
          <PlayerContactsTab playerId={player.id} />
        </TabsContent>
      </Tabs>

      {/* Password Confirmation Dialog */}
      <PasswordConfirmDialog
        open={showPasswordDialog}
        onClose={() => {
          setShowPasswordDialog(false)
          setIsUnderContract(true) // Revert switch
        }}
        onConfirm={async (password) => {
          await updateContractStatus(false, password)
        }}
        title="Confirm Player Removal"
        description="Please enter your password to confirm that this player is no longer with the team, has moved up, or is out of the club. The player will be removed from the team page but not deleted."
        confirmText="Confirm Removal"
      />
    </div>
  )
}

