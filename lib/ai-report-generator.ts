interface GameData {
  id: string
  date: Date
  opponent: string | null
  opponentClub?: { name: string } | null
  score: string | null
  venue: string
  competition?: string | null
  duration: number | null
  isHome: boolean | null
  team?: { name: string } | null
}

interface MatchReportData {
  postMatchNotes: string | null
  tacticalObservations: string | null
  overallRating: number | null
  areasForImprovement: string | null
}

interface PlayerStat {
  playerId: string
  playerName: string
  position: string | null
  minutes: number
  goals: number
  assists: number
  started: boolean
}

interface GeneratedReport {
  teamReport: {
    matchOverview: string
    overallPerformance: string
    attackingContribution: string
    keyPositives: string
    keyAreasToImprove: string
    coachingFocusPoints: string[] // 3 points
  }
  playerSummaries: Array<{
    playerId: string
    playerName: string
    summary: string
    positive: string
    developmentPoint: string
  }>
}

export async function generateMatchReport(
  gameData: GameData,
  matchReport: MatchReportData | null,
  playerStats: PlayerStat[]
): Promise<GeneratedReport> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  // Prepare coach report text
  const coachReportParts: string[] = []
  if (matchReport?.postMatchNotes) {
    coachReportParts.push(`Post-Match Notes: ${matchReport.postMatchNotes}`)
  }
  if (matchReport?.tacticalObservations) {
    coachReportParts.push(`Tactical Observations: ${matchReport.tacticalObservations}`)
  }
  if (matchReport?.areasForImprovement) {
    coachReportParts.push(`Areas for Improvement: ${matchReport.areasForImprovement}`)
  }
  const coachReport = coachReportParts.join("\n\n") || "No coach notes available."

  // Prepare match context
  const opponentName = gameData.opponentClub?.name || gameData.opponent || "Opponent"
  const teamName = gameData.team?.name || "Our Team"
  const matchContext = `
Match Information:
- Date: ${new Date(gameData.date).toLocaleDateString()}
- Team: ${teamName}
- Opponent: ${opponentName}
- Venue: ${gameData.venue}
- Competition: ${gameData.competition || "Not specified"}
- Score: ${gameData.score || "Not recorded"}
- Duration: ${gameData.duration || 90} minutes
- Home/Away: ${gameData.isHome === true ? "Home" : gameData.isHome === false ? "Away" : "Not specified"}
`

  // Prepare player statistics
  const playerStatsText = playerStats.length > 0
    ? playerStats
        .map((stat) => {
          const role = stat.started ? "Started" : "Substitute"
          return `- ${stat.playerName} (${stat.position || "Position not specified"}): ${stat.minutes} minutes, ${stat.goals} goals, ${stat.assists} assists (${role})`
        })
        .join("\n")
    : "No player statistics available."

  const systemPrompt = `You are an assistant embedded in a football academy CMS.

Available data is LIMITED to:
- Coach-written match report (free text)
- Final score
- Minutes played per player
- Goals per player
- Assists per player

There are NO timestamps, NO event logs, and NO detailed actions.

Your task:
Generate football reports using ONLY the provided data.
Never invent specific moments, actions, situations, or timelines.
If something is not supported by the data, keep the language general.

OUTPUT 1 – TEAM MATCH REPORT
Create a structured team match report with the following sections:
1. Match overview (result and general flow, based on the coach report)
2. Overall team performance
3. Attacking contribution (using goals and assists only)
4. Key positives from the match
5. Key areas to improve
6. 3 clear coaching focus points for the next training week

Tone:
- Professional
- Development-focused
- Suitable for academy football (players, staff, parents)

OUTPUT 2 – INDIVIDUAL PLAYER SUMMARIES
For each player, generate a short individual match summary using:
- Minutes played
- Goals
- Assists
- Context from the coach match report

Each player summary must include:
- Contribution relative to minutes played
- One positive
- One development point

Rules:
- Do NOT reference specific moments, minutes, or situations
- Do NOT exaggerate impact
- Do NOT compare players against each other
- Keep language constructive and supportive

Always prioritize accuracy, trust, and coach credibility over creativity.

Return your response as a valid JSON object with this exact structure:
{
  "teamReport": {
    "matchOverview": "string",
    "overallPerformance": "string",
    "attackingContribution": "string",
    "keyPositives": "string",
    "keyAreasToImprove": "string",
    "coachingFocusPoints": ["point 1", "point 2", "point 3"]
  },
  "playerSummaries": [
    {
      "playerId": "string",
      "playerName": "string",
      "summary": "string",
      "positive": "string",
      "developmentPoint": "string"
    }
  ]
}`

  const userPrompt = `${matchContext}

Coach Report:
${coachReport}

Player Statistics:
${playerStatsText}

Generate the team match report and individual player summaries based on this data only.`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 if needed
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    const parsedReport = JSON.parse(content) as GeneratedReport

    // Validate structure
    if (!parsedReport.teamReport || !parsedReport.playerSummaries) {
      throw new Error("Invalid report structure returned from AI")
    }

    // Ensure all player summaries have required fields
    parsedReport.playerSummaries = parsedReport.playerSummaries.map((summary) => ({
      ...summary,
      playerId: summary.playerId || "",
      playerName: summary.playerName || "",
      summary: summary.summary || "",
      positive: summary.positive || "",
      developmentPoint: summary.developmentPoint || "",
    }))

    // Ensure coaching focus points is an array of 3
    if (!Array.isArray(parsedReport.teamReport.coachingFocusPoints)) {
      parsedReport.teamReport.coachingFocusPoints = []
    }
    while (parsedReport.teamReport.coachingFocusPoints.length < 3) {
      parsedReport.teamReport.coachingFocusPoints.push("")
    }
    parsedReport.teamReport.coachingFocusPoints = parsedReport.teamReport.coachingFocusPoints.slice(0, 3)

    return parsedReport
  } catch (error: any) {
    console.error("Error generating match report:", error)
    throw new Error(`Failed to generate match report: ${error.message}`)
  }
}
