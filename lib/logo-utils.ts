// Check if a string is an emoji (flag or other emoji)
export function isEmoji(str: string): boolean {
  if (!str) return false
  
  // Check if it's a URL (starts with http:// or https:// or /)
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/")) {
    return false
  }
  
  // Check if it contains emoji characters (Unicode ranges for emojis)
  // Flag emojis are typically 2 characters (regional indicator symbols)
  // Regular emojis are single characters
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]{2}/u
  return emojiRegex.test(str)
}



