/**
 * Utility functions for team logo handling
 * Automatically applies Djugarden logo to all Djugarden-related teams
 * Also checks for club logos based on team name patterns
 */

import { extractClubName } from "./club-logos"

interface Team {
  id?: string
  name: string
  code?: string | null
  logo?: string | null
}

interface ClubLogo {
  clubName: string
  logo: string
}

/**
 * Checks if a team is a Djugarden team based on name or code
 * Matches: Djugarden, DIF, Djugården (case-insensitive)
 */
export function isDjugardenTeam(team: Team): boolean {
  const name = team.name?.toLowerCase() || ""
  const code = team.code?.toLowerCase() || ""
  
  const patterns = [
    "djugarden",
    "djugården",
    "dif",
  ]
  
  // Check if name or code contains any Djugarden pattern
  return patterns.some(pattern => 
    name.includes(pattern) || code.includes(pattern)
  )
}

/**
 * Gets the appropriate logo URL for a team
 * - Returns team.logo if it exists (highest priority)
 * - Returns club logo if team name matches a club pattern
 * - Returns Djugarden logo for Djugarden teams without a logo
 * - Returns null if no logo found
 */
export function getTeamLogo(team: Team, clubLogos?: ClubLogo[]): string | null {
  // If team already has a logo, use it (override)
  if (team.logo) {
    return team.logo
  }
  
  // Check for club logo based on team name
  if (clubLogos && clubLogos.length > 0) {
    const clubName = extractClubName(team.name)
    if (clubName) {
      // Try exact match first
      const exactMatch = clubLogos.find(
        cl => cl.clubName.toLowerCase() === clubName.toLowerCase()
      )
      if (exactMatch) {
        return exactMatch.logo
      }
    }
  }
  
  // If it's a Djugarden team without a logo, return the Djugarden logo
  if (isDjugardenTeam(team)) {
    return "/uploads/djugarden-logo.png"
  }
  
  // Otherwise, no logo
  return null
}

/**
 * Applies logos to an array of teams
 * Useful for processing API responses
 */
export function applyTeamLogos(teams: Team[], clubLogos?: ClubLogo[]): Team[] {
  return teams.map(team => ({
    ...team,
    logo: getTeamLogo(team, clubLogos),
  }))
}




