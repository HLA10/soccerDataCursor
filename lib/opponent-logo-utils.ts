/**
 * Opponent logo utilities with club logo inheritance
 * Automatically applies club logos to opponents based on name matching
 */

interface Opponent {
  id?: string
  name: string
  logo?: string | null
}

interface ClubLogo {
  clubName: string
  logo: string
}

/**
 * Gets the appropriate logo URL for an opponent
 * - Returns opponent.logo if it exists (highest priority)
 * - Returns club logo if opponent name matches a club name
 * - Returns null if no logo found
 */
export function getOpponentLogo(opponent: Opponent, clubLogos?: ClubLogo[]): string | null {
  // If opponent already has a logo, use it (override)
  if (opponent.logo) {
    return opponent.logo
  }

  // Check for club logo based on opponent name
  if (clubLogos && clubLogos.length > 0) {
    // Try exact match first
    const exactMatch = clubLogos.find(
      cl => cl.clubName.toLowerCase() === opponent.name.toLowerCase()
    )
    if (exactMatch) {
      return exactMatch.logo
    }

    // Try partial match (opponent name contains club name or vice versa)
    const partialMatch = clubLogos.find(cl => {
      const clubNameLower = cl.clubName.toLowerCase()
      const opponentNameLower = opponent.name.toLowerCase()
      return opponentNameLower.includes(clubNameLower) || clubNameLower.includes(opponentNameLower)
    })
    if (partialMatch) {
      return partialMatch.logo
    }
  }

  // Otherwise, no logo
  return null
}

/**
 * Applies logos to an array of opponents
 * Useful for processing API responses
 */
export function applyOpponentLogos(opponents: Opponent[], clubLogos?: ClubLogo[]): Opponent[] {
  return opponents.map(opponent => ({
    ...opponent,
    logo: getOpponentLogo(opponent, clubLogos),
  }))
}





