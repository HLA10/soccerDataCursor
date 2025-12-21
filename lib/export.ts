export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle nested objects, arrays, and special characters
          if (value === null || value === undefined) return ""
          if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(",")
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function formatPlayersForExport(players: any[]) {
  return players.map((p) => ({
    Name: p.name,
    Position: p.position,
    "Jersey Number": p.jerseyNumber || "",
    "Date of Birth": p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "",
    Team: p.primaryTeam?.name || "",
    Status: p.isInjured ? "Injured" : p.isSick ? "Sick" : "Active",
  }))
}

export function formatGamesForExport(games: any[]) {
  return games.map((g) => ({
    Date: new Date(g.date).toLocaleDateString(),
    Opponent: g.opponentClub?.name || g.opponent,
    Venue: g.venue,
    Score: g.score || "",
    Competition: g.competitionRelation?.name || g.competition || "",
    "Home/Away": g.isHome ? "Home" : "Away",
  }))
}

export function formatStatsForExport(stats: any[]) {
  return stats.map((s) => ({
    Player: s.player?.name || "",
    Games: s.games || 0,
    Goals: s.goals || 0,
    Assists: s.assists || 0,
    Minutes: s.minutes || 0,
    "Yellow Cards": s.yellowCards || 0,
    "Red Cards": s.redCards || 0,
  }))
}





