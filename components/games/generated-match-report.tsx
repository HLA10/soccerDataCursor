"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Loader2, Download, RefreshCw } from "lucide-react"
import { jsPDF } from "jspdf"

interface TeamReport {
  matchOverview: string
  overallPerformance: string
  attackingContribution: string
  keyPositives: string
  keyAreasToImprove: string
  coachingFocusPoints: string[]
}

interface PlayerSummary {
  playerId: string
  playerName: string
  summary: string
  positive: string
  developmentPoint: string
}

interface GeneratedReport {
  id: string
  gameId: string
  teamReport: TeamReport
  playerSummaries: PlayerSummary[]
  generatedAt: string
  generatedBy?: {
    name: string
  }
}

interface GeneratedMatchReportProps {
  gameId: string
  game?: {
    date: Date | string
    opponent?: string | null
    opponentClub?: { name: string } | null
    score?: string | null
    venue?: string
    competition?: string | null
    team?: { name: string } | null
  }
}

export function GeneratedMatchReport({ gameId, game }: GeneratedMatchReportProps) {
  const [report, setReport] = useState<GeneratedReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (gameId && !hasFetched) {
      fetchReport()
      setHasFetched(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/games/${gameId}/generate-report`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setReport(data)
        } else {
          setReport(null) // No report generated yet
        }
      } else if (res.status === 404) {
        setReport(null) // No report generated yet
        setError(null) // Clear any previous errors
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        // Only set error if it's not a "table not found" error (which is expected before migration)
        if (!errorData.error?.includes("Database table not found")) {
          setError(errorData.error || `Failed to fetch report (Status: ${res.status})`)
        }
        setReport(null)
      }
    } catch (error: any) {
      console.error("Error fetching report:", error)
      // Don't show error for network issues - just silently fail
      setReport(null)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)
      const res = await fetch(`/api/games/${gameId}/generate-report`, {
        method: "POST",
      })

      if (res.ok) {
        const data = await res.json()
        setReport(data)
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        const errorMessage = errorData.error || `Failed to generate report (Status: ${res.status})`
        setError(errorMessage)
        console.error("Generation error:", errorData)
      }
    } catch (error: any) {
      console.error("Error generating report:", error)
      setError(`Failed to generate report: ${error.message || "Network error"}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleExportPDF = () => {
    if (!report || !game) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize)
      doc.setTextColor(color[0], color[1], color[2])
      if (isBold) {
        doc.setFont("helvetica", "bold")
      } else {
        doc.setFont("helvetica", "normal")
      }

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 10) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += fontSize * 0.5 + 2
      })
    }

    // Header
    addText("AI-Generated Match Report", 18, true, [0, 0, 0])
    yPosition += 5

    if (game.team?.name) {
      addText(`Team: ${game.team.name}`, 12, false, [100, 100, 100])
    }
    const opponentName = game.opponentClub?.name || game.opponent || "Opponent"
    addText(`Opponent: ${opponentName}`, 12, false, [100, 100, 100])
    if (game.date) {
      addText(`Date: ${format(new Date(game.date), "MMMM d, yyyy")}`, 12, false, [100, 100, 100])
    }
    if (game.score) {
      addText(`Score: ${game.score}`, 12, false, [100, 100, 100])
    }
    yPosition += 10

    // Team Report
    addText("TEAM MATCH REPORT", 14, true, [0, 0, 0])
    yPosition += 5

    addText("Match Overview", 12, true, [0, 0, 0])
    addText(report.teamReport.matchOverview, 10, false, [0, 0, 0])
    yPosition += 5

    addText("Overall Team Performance", 12, true, [0, 0, 0])
    addText(report.teamReport.overallPerformance, 10, false, [0, 0, 0])
    yPosition += 5

    addText("Attacking Contribution", 12, true, [0, 0, 0])
    addText(report.teamReport.attackingContribution, 10, false, [0, 0, 0])
    yPosition += 5

    addText("Key Positives", 12, true, [0, 0, 0])
    addText(report.teamReport.keyPositives, 10, false, [0, 0, 0])
    yPosition += 5

    addText("Areas to Improve", 12, true, [0, 0, 0])
    addText(report.teamReport.keyAreasToImprove, 10, false, [0, 0, 0])
    yPosition += 5

    addText("Coaching Focus Points", 12, true, [0, 0, 0])
    report.teamReport.coachingFocusPoints.forEach((point, index) => {
      if (point) {
        addText(`${index + 1}. ${point}`, 10, false, [0, 0, 0])
      }
    })
    yPosition += 10

    // Player Summaries
    addText("INDIVIDUAL PLAYER SUMMARIES", 14, true, [0, 0, 0])
    yPosition += 5

    report.playerSummaries.forEach((player) => {
      if (yPosition > pageHeight - margin - 30) {
        doc.addPage()
        yPosition = margin
      }

      addText(player.playerName, 12, true, [0, 0, 0])
      yPosition += 2
      addText(player.summary, 10, false, [0, 0, 0])
      yPosition += 2
      addText(`Positive: ${player.positive}`, 10, false, [0, 100, 0])
      yPosition += 2
      addText(`Development Point: ${player.developmentPoint}`, 10, false, [200, 100, 0])
      yPosition += 8
    })

    // Footer
    if (report.generatedBy) {
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Generated by ${report.generatedBy.name} on ${format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        )
      }
    }

    // Save PDF
    const fileName = `Match-Report-${game.team?.name || "Team"}-${format(new Date(game.date || new Date()), "yyyy-MM-dd")}.pdf`
    doc.save(fileName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive font-medium">{error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchReport} variant="outline">
                Try Again
              </Button>
            </div>
            {error.includes("OpenAI API key") && (
              <p className="text-xs text-muted-foreground text-center">
                The OpenAI API key must be configured in the server environment variables (.env file).
              </p>
            )}
            {error.includes("No player statistics") && (
              <p className="text-xs text-muted-foreground text-center">
                Please add player statistics in the "Manage Players & Statistics" tab first.
              </p>
            )}
            {error.includes("Database table") && (
              <p className="text-xs text-muted-foreground text-center">
                Please run: <code className="bg-muted px-1 rounded">npx prisma migrate dev</code>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Match Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <p className="text-muted-foreground">
              No AI-generated report has been created yet. Generate one using the button below.
            </p>
            <Button onClick={handleGenerate} disabled={generating} size="lg">
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate AI Report"
              )}
            </Button>
            {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && (
              <p className="text-xs text-muted-foreground mt-2">
                Note: OpenAI API key must be configured on the server
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Generated Match Report</h2>
          {report.generatedBy && (
            <p className="text-sm text-muted-foreground mt-1">
              Generated by {report.generatedBy.name} on{" "}
              {format(new Date(report.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Team Report */}
      <Card>
        <CardHeader>
          <CardTitle>Team Match Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Match Overview</h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {report.teamReport.matchOverview}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Overall Team Performance</h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {report.teamReport.overallPerformance}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Attacking Contribution</h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {report.teamReport.attackingContribution}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Key Positives</h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {report.teamReport.keyPositives}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Areas to Improve</h3>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {report.teamReport.keyAreasToImprove}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Coaching Focus Points</h3>
            <ol className="list-decimal list-inside space-y-2">
              {report.teamReport.coachingFocusPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {point}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Player Summaries */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Player Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.playerSummaries.map((player) => (
              <Card key={player.playerId} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-base mb-2">{player.playerName}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{player.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-xs font-semibold text-green-800 mb-1">Positive</p>
                      <p className="text-sm text-green-700">{player.positive}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-md">
                      <p className="text-xs font-semibold text-amber-800 mb-1">Development Point</p>
                      <p className="text-sm text-amber-700">{player.developmentPoint}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
