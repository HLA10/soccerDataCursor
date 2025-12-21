"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StarRating } from "@/components/ui/star-rating"
import { useTeam } from "@/contexts/team-context"

interface Player {
  id: string
  name: string
  position: string
  jerseyNumber: number | null
  photo: string | null
}

interface PlayerRating {
  id?: string
  playerId: string
  rating: number | null
  feedback: string | null
  areasForImprovement: string | null
  player?: Player
}

interface MatchReport {
  id: string
  postMatchNotes: string | null
  tacticalObservations: string | null
  keyMoments: string | null
  videoLinks: string[]
  overallRating: number | null
  areasForImprovement: string | null
  playerRatings: PlayerRating[]
  author?: {
    id: string
    name: string
    email: string
  }
}

interface MatchReportSectionProps {
  gameId: string
  canEdit: boolean
  onSaveAndNext?: () => void | Promise<void>
  saveAndNextLoading?: boolean
  onSaveRef?: React.MutableRefObject<(() => Promise<void>) | undefined>
  onSaveAndNextRef?: React.MutableRefObject<(() => Promise<void>) | undefined>
}

interface KeyMoment {
  type: "goal" | "save" | "yellow_card" | "red_card" | "substitution" | "other"
  minute: number
  playerId: string | null
  description: string
}

export function MatchReportSection({ gameId, canEdit, onSaveAndNext, saveAndNextLoading, onSaveRef, onSaveAndNextRef }: MatchReportSectionProps) {
  const { selectedTeam } = useTeam()
  const [players, setPlayers] = useState<Player[]>([])
  const [report, setReport] = useState<MatchReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [postMatchNotes, setPostMatchNotes] = useState("")
  const [tacticalObservations, setTacticalObservations] = useState("")
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([])
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [newVideoLink, setNewVideoLink] = useState("")
  const [overallRating, setOverallRating] = useState<number | null>(null)
  const [areasForImprovement, setAreasForImprovement] = useState("")
  const [playerRatings, setPlayerRatings] = useState<PlayerRating[]>([])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, selectedTeam?.id])

  async function fetchData() {
    try {
      setLoading(true)
      const [playersRes, reportRes] = await Promise.all([
        fetch(
          `/api/players?teamId=${selectedTeam?.id || ""}&includeBorrowed=true`
        ),
        fetch(`/api/games/${gameId}/report`),
      ])

      const playersData = await playersRes.json()
      const reportData = await reportRes.json()

      setPlayers(playersData)

      if (reportData) {
        setReport(reportData)
        setPostMatchNotes(reportData.postMatchNotes || "")
        setTacticalObservations(reportData.tacticalObservations || "")
        setVideoLinks(reportData.videoLinks || [])
        setOverallRating(reportData.overallRating)
        setAreasForImprovement(reportData.areasForImprovement || "")

        // Parse key moments
        if (reportData.keyMoments) {
          try {
            const parsed = JSON.parse(reportData.keyMoments)
            setKeyMoments(Array.isArray(parsed) ? parsed : [])
          } catch {
            setKeyMoments([])
          }
        } else {
          setKeyMoments([])
        }

        // Set player ratings
        if (reportData.playerRatings) {
          setPlayerRatings(reportData.playerRatings)
        } else {
          // Initialize with all players
          setPlayerRatings(
            playersData.map((p: Player) => ({
              playerId: p.id,
              rating: null,
              feedback: null,
              areasForImprovement: null,
              player: p,
            }))
          )
        }
      } else {
        // Initialize empty report
        setPlayerRatings(
          playersData.map((p: Player) => ({
            playerId: p.id,
            rating: null,
            feedback: null,
            areasForImprovement: null,
            player: p,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveReport() {
    try {
      setSaving(true)
      const response = await fetch(`/api/games/${gameId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postMatchNotes,
          tacticalObservations,
          keyMoments: JSON.stringify(keyMoments),
          videoLinks,
          overallRating,
          areasForImprovement,
          playerRatings: playerRatings.filter(
            (pr) => pr.rating !== null || pr.feedback || pr.areasForImprovement
          ),
        }),
      })

      if (!response.ok) throw new Error("Failed to save report")

      const savedReport = await response.json()
      setReport(savedReport)
      alert("Match report saved successfully!")
    } catch (error) {
      console.error("Error saving report:", error)
      alert("Failed to save match report")
      throw error // Re-throw so parent can handle it
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndNextInternal = async () => {
    await handleSaveReport()
    if (onSaveAndNext) {
      const result = onSaveAndNext()
      if (result instanceof Promise) {
        await result
      }
    }
  }

  // Expose save functions via refs
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef.current = async () => {
        await handleSaveReport()
      }
    }
    if (onSaveAndNextRef) {
      onSaveAndNextRef.current = handleSaveAndNextInternal
    }
  }, [onSaveRef, onSaveAndNextRef, postMatchNotes, tacticalObservations, keyMoments, videoLinks, overallRating, areasForImprovement, playerRatings, onSaveAndNext])

  function addKeyMoment() {
    setKeyMoments([
      ...keyMoments,
      {
        type: "goal",
        minute: 0,
        playerId: null,
        description: "",
      },
    ])
  }

  function updateKeyMoment(index: number, updates: Partial<KeyMoment>) {
    setKeyMoments(
      keyMoments.map((km, i) => (i === index ? { ...km, ...updates } : km))
    )
  }

  function removeKeyMoment(index: number) {
    setKeyMoments(keyMoments.filter((_, i) => i !== index))
  }

  function addVideoLink() {
    if (newVideoLink.trim()) {
      setVideoLinks([...videoLinks, newVideoLink.trim()])
      setNewVideoLink("")
    }
  }

  function removeVideoLink(index: number) {
    setVideoLinks(videoLinks.filter((_, i) => i !== index))
  }

  function updatePlayerRating(playerId: string, updates: Partial<PlayerRating>) {
    setPlayerRatings(
      playerRatings.map((pr) =>
        pr.playerId === playerId ? { ...pr, ...updates } : pr
      )
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading match report...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Match Report</h2>
      </div>

      {report?.author && (
        <p className="text-sm text-muted-foreground">
          Report by {report.author.name}
        </p>
      )}

      {/* Post-Match Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Match Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <Textarea
              value={postMatchNotes}
              onChange={(e) => setPostMatchNotes(e.target.value)}
              placeholder="Enter post-match notes and observations..."
              rows={6}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {postMatchNotes || "No notes recorded"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tactical Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Tactical Observations</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <Textarea
              value={tacticalObservations}
              onChange={(e) => setTacticalObservations(e.target.value)}
              placeholder="Enter tactical observations, formations, strategies..."
              rows={6}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {tacticalObservations || "No tactical observations recorded"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <div className="flex items-center space-x-4">
              <Label>Rating:</Label>
              <StarRating
                value={overallRating || 0}
                onChange={setOverallRating}
                size="lg"
              />
            </div>
          ) : (
            overallRating ? (
              <StarRating value={overallRating} readonly size="lg" />
            ) : (
              <p className="text-sm text-muted-foreground">No rating given</p>
            )
          )}
        </CardContent>
      </Card>

      {/* Key Moments */}
      <Card>
        <CardHeader>
          <CardTitle>Key Moments</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit && (
            <Button onClick={addKeyMoment} className="mb-4" variant="outline">
              Add Key Moment
            </Button>
          )}
          {keyMoments.length > 0 ? (
            <div className="space-y-4">
              {keyMoments.map((moment, index) => (
                <div key={index} className="border rounded p-4 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Type</Label>
                      {canEdit ? (
                        <select
                          value={moment.type}
                          onChange={(e) =>
                            updateKeyMoment(index, {
                              type: e.target.value as KeyMoment["type"],
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="goal">Goal</option>
                          <option value="save">Save</option>
                          <option value="yellow_card">Yellow Card</option>
                          <option value="red_card">Red Card</option>
                          <option value="substitution">Substitution</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p className="text-sm capitalize">{moment.type.replace("_", " ")}</p>
                      )}
                    </div>
                    <div>
                      <Label>Minute</Label>
                      {canEdit ? (
                        <Input
                          type="number"
                          value={moment.minute}
                          onChange={(e) =>
                            updateKeyMoment(index, {
                              minute: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full"
                        />
                      ) : (
                        <p className="text-sm">{moment.minute}'</p>
                      )}
                    </div>
                    <div>
                      <Label>Player</Label>
                      {canEdit ? (
                        <select
                          value={moment.playerId || ""}
                          onChange={(e) =>
                            updateKeyMoment(index, {
                              playerId: e.target.value || null,
                            })
                          }
                          className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="">Select Player</option>
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm">
                          {moment.playerId
                            ? players.find((p) => p.id === moment.playerId)?.name || "Unknown"
                            : "-"}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeKeyMoment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Description</Label>
                    {canEdit ? (
                      <Input
                        value={moment.description}
                        onChange={(e) =>
                          updateKeyMoment(index, { description: e.target.value })
                        }
                        placeholder="Enter description..."
                      />
                    ) : (
                      <p className="text-sm">{moment.description || "-"}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No key moments recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Video Links */}
      <Card>
        <CardHeader>
          <CardTitle>Video Links</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit && (
            <div className="flex space-x-2 mb-4">
              <Input
                value={newVideoLink}
                onChange={(e) => setNewVideoLink(e.target.value)}
                placeholder="Enter video URL..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addVideoLink()
                  }
                }}
              />
              <Button onClick={addVideoLink}>Add</Button>
            </div>
          )}
          {videoLinks.length > 0 ? (
            <div className="space-y-2">
              {videoLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {link}
                  </a>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideoLink(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No video links added</p>
          )}
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <Textarea
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder="Enter areas the team needs to improve..."
              rows={4}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {areasForImprovement || "No areas for improvement recorded"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Player Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Player Ratings & Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playerRatings.map((pr) => {
              const player = players.find((p) => p.id === pr.playerId) || pr.player
              if (!player) return null

              return (
                <div key={pr.playerId} className="border rounded p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{player.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {player.position}
                        {player.jerseyNumber && ` • #${player.jerseyNumber}`}
                      </p>
                    </div>
                    {canEdit ? (
                      <StarRating
                        value={pr.rating || 0}
                        onChange={(rating) =>
                          updatePlayerRating(pr.playerId, { rating })
                        }
                        size="md"
                      />
                    ) : (
                      pr.rating ? (
                        <StarRating value={pr.rating} readonly size="md" />
                      ) : (
                        <span className="text-sm text-muted-foreground">No rating</span>
                      )
                    )}
                  </div>
                  {canEdit ? (
                    <>
                      <div>
                        <Label>Feedback</Label>
                        <Textarea
                          value={pr.feedback || ""}
                          onChange={(e) =>
                            updatePlayerRating(pr.playerId, {
                              feedback: e.target.value || null,
                            })
                          }
                          placeholder="Enter feedback for this player..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Areas for Improvement</Label>
                        <Textarea
                          value={pr.areasForImprovement || ""}
                          onChange={(e) =>
                            updatePlayerRating(pr.playerId, {
                              areasForImprovement: e.target.value || null,
                            })
                          }
                          placeholder="Enter areas for improvement..."
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {pr.feedback && (
                        <div>
                          <Label>Feedback</Label>
                          <p className="text-sm whitespace-pre-wrap">{pr.feedback}</p>
                        </div>
                      )}
                      {pr.areasForImprovement && (
                        <div>
                          <Label>Areas for Improvement</Label>
                          <p className="text-sm whitespace-pre-wrap">
                            {pr.areasForImprovement}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
