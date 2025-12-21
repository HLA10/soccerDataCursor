// Country name to ISO 3166-1 alpha-2 code mapping
const countryToCode: Record<string, string> = {
  "sweden": "SE",
  "sverige": "SE",
  "denmark": "DK",
  "danmark": "DK",
  "norway": "NO",
  "norge": "NO",
  "finland": "FI",
  "suomi": "FI",
  "germany": "DE",
  "deutschland": "DE",
  "france": "FR",
  "spain": "ES",
  "espana": "ES",
  "italy": "IT",
  "italia": "IT",
  "netherlands": "NL",
  "nederland": "NL",
  "belgium": "BE",
  "belgie": "BE",
  "portugal": "PT",
  "united kingdom": "GB",
  "uk": "GB",
  "great britain": "GB",
  "england": "GB",
  "scotland": "GB",
  "wales": "GB",
  "ireland": "IE",
  "poland": "PL",
  "polska": "PL",
  "czech republic": "CZ",
  "austria": "AT",
  "switzerland": "CH",
  "schweiz": "CH",
  "greece": "GR",
  "turkey": "TR",
  "turkiye": "TR",
  "russia": "RU",
  "ukraine": "UA",
  "brazil": "BR",
  "brasil": "BR",
  "argentina": "AR",
  "mexico": "MX",
  "united states": "US",
  "usa": "US",
  "canada": "CA",
  "japan": "JP",
  "china": "CN",
  "south korea": "KR",
  "australia": "AU",
  "new zealand": "NZ",
  "south africa": "ZA",
  "egypt": "EG",
  "morocco": "MA",
  "tunisia": "TN",
  "algeria": "DZ",
  "nigeria": "NG",
  "ghana": "GH",
  "senegal": "SN",
  "cameroon": "CM",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "mali": "ML",
  "burkina faso": "BF",
  "togo": "TG",
  "benin": "BJ",
  "niger": "NE",
  "chad": "TD",
  "sudan": "SD",
  "ethiopia": "ET",
  "kenya": "KE",
  "tanzania": "TZ",
  "uganda": "UG",
  "rwanda": "RW",
  "burundi": "BI",
  "congo": "CG",
  "democratic republic of the congo": "CD",
  "drc": "CD",
  "angola": "AO",
  "zambia": "ZM",
  "zimbabwe": "ZW",
  "mozambique": "MZ",
  "madagascar": "MG",
  "mauritius": "MU",
  "seychelles": "SC",
  "comoros": "KM",
  "djibouti": "DJ",
  "eritrea": "ER",
  "somalia": "SO",
  "libya": "LY",
  "mauritania": "MR",
  "gambia": "GM",
  "guinea": "GN",
  "guinea-bissau": "GW",
  "sierra leone": "SL",
  "liberia": "LR",
  "cape verde": "CV",
  "sao tome and principe": "ST",
  "equatorial guinea": "GQ",
  "gabon": "GA",
  "central african republic": "CF",
  "malawi": "MW",
  "botswana": "BW",
  "namibia": "NA",
  "lesotho": "LS",
  "eswatini": "SZ",
  "swaziland": "SZ",
  "reunion": "RE",
  "mayotte": "YT",
}

// Convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Extract country name from location string and return flag emoji
export function getCountryFlag(location: string): string | null {
  if (!location) return null

  const locationLower = location.toLowerCase().trim()
  
  // Try to find country in the location string
  for (const [countryName, code] of Object.entries(countryToCode)) {
    if (locationLower.includes(countryName)) {
      return getFlagEmoji(code)
    }
  }

  // Try to match common patterns like "City, Country"
  const parts = locationLower.split(",").map((p) => p.trim())
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1]
    for (const [countryName, code] of Object.entries(countryToCode)) {
      if (lastPart === countryName || lastPart.includes(countryName)) {
        return getFlagEmoji(code)
      }
    }
  }

  return null
}

// Get all country names for autocomplete
export function getCountryNames(): string[] {
  return Object.keys(countryToCode)
}



