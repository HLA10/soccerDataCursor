/**
 * Individual Development Plan (IUP) Constants
 * Predefined "What" areas and corresponding "How" methods for player development
 */

export const IUP_WHAT_OPTIONS = [
  "Better using weaker foot",
  "Improving first touch",
  "Better decision making under pressure",
  "Improving passing accuracy",
  "Better positioning and movement",
  "Improving shooting technique",
  "Better communication on field",
  "Improving defensive awareness",
  "Better ball control in tight spaces",
  "Improving physical conditioning",
]

export const IUP_HOW_OPTIONS = [
  "Practice weak foot drills daily, focus on passing and shooting with non-dominant foot, use it in small-sided games",
  "Practice receiving balls from different angles and speeds, work on body positioning, use wall passes regularly",
  "Play small-sided games with limited time and space, practice game scenarios, work on scanning before receiving",
  "Practice passing drills with both feet, focus on weight and accuracy, play possession games",
  "Study game footage, practice off-the-ball movement, work on spatial awareness in training",
  "Practice shooting from different angles and distances, work on technique and power, practice finishing under pressure",
  "Lead by example in training, practice calling for the ball, work on clear communication patterns",
  "Practice defensive positioning drills, work on reading the game, study opponent movements",
  "Practice in tight spaces with cones, work on close control, play 1v1 and 2v2 games",
  "Follow structured fitness program, focus on endurance and strength, maintain consistent training schedule",
]

/**
 * Get the corresponding "How" method for a given "What" index
 */
export function getHowForWhat(whatIndex: number): string {
  if (whatIndex < 0 || whatIndex >= IUP_HOW_OPTIONS.length) {
    return ""
  }
  return IUP_HOW_OPTIONS[whatIndex]
}

/**
 * Default duration options in days
 */
export const IUP_DURATION_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 120, label: "120 days" },
]

/**
 * Maximum number of "What" areas allowed per plan
 */
export const MAX_WHAT_SELECTIONS = 3











