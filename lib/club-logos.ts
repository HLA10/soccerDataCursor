/**
 * Club logo management utilities
 * Handles automatic logo assignment for teams based on club name patterns
 */

/**
 * Extract club name from team name
 * Examples:
 * - "Juventus U15" → "Juventus"
 * - "Juventus F15A" → "Juventus"
 * - "Juventus FC" → "Juventus"
 * - "AC Milan U17" → "AC Milan"
 * - "Real Madrid Youth" → "Real Madrid"
 */
export function extractClubName(teamName: string): string | null {
  if (!teamName) return null

  // Common patterns that indicate team identifiers (age groups, team types)
  const teamIdentifierPatterns = [
    /\s+(U\d+|F\d+[A-Z]?|M\d+[A-Z]?|Youth|Junior|Senior|Reserves|B Team|C Team|U\d+[A-Z]|F\d+[A-Z]|M\d+[A-Z])/i,
    /\s+(FC|CF|United|City|Athletic|Athletico|Atletico)$/i,
  ]

  let clubName = teamName.trim()

  // Remove team identifiers
  for (const pattern of teamIdentifierPatterns) {
    clubName = clubName.replace(pattern, "")
  }

  // Clean up and return
  clubName = clubName.trim()

  // If we removed everything, return the original first word
  if (!clubName) {
    const words = teamName.trim().split(/\s+/)
    return words[0] || null
  }

  return clubName || null
}

/**
 * Get club logo for a team name
 * This will be enhanced to check database via API
 */
export async function getClubLogo(teamName: string): Promise<string | null> {
  const clubName = extractClubName(teamName)
  if (!clubName) return null

  try {
    // Check database for club logo
    const res = await fetch(`/api/club-logos/${encodeURIComponent(clubName)}`)
    if (res.ok) {
      const data = await res.json()
      return data.logo || null
    }
  } catch (error) {
    console.error("Error fetching club logo:", error)
  }

  return null
}

/**
 * Get club logo synchronously (for server-side use)
 * Requires passing the club logos map
 */
export function getClubLogoSync(teamName: string, clubLogosMap: Record<string, string>): string | null {
  const clubName = extractClubName(teamName)
  if (!clubName) return null

  // Try exact match first
  if (clubLogosMap[clubName]) {
    return clubLogosMap[clubName]
  }

  // Try case-insensitive match
  const lowerClubName = clubName.toLowerCase()
  for (const [key, value] of Object.entries(clubLogosMap)) {
    if (key.toLowerCase() === lowerClubName) {
      return value
    }
  }

  return null
}





