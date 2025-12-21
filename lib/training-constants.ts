/**
 * Training Session Part Constants
 * Defines the types of exercises for different parts of training sessions
 */

// Part 1 (Activation) options
export const ACTIVATION_TYPES = [
  "technical_exercise",
  "rondo",
  "target_game",
] as const

export const ACTIVATION_TYPE_LABELS: Record<string, string> = {
  technical_exercise: "Technical Exercise",
  rondo: "Rondo",
  target_game: "Target Game",
}

// Parts 2-5 exercise types
export const EXERCISE_TYPES = [
  "micro",
  "game_exercise",
  "meso",
  "macro",
  "passing",
  "technique",
  "SSG",
  "LSG",
] as const

export const EXERCISE_TYPE_LABELS: Record<string, string> = {
  micro: "Micro",
  game_exercise: "Game Exercise",
  meso: "Meso",
  macro: "Macro",
  passing: "Passing",
  technique: "Technique",
  SSG: "SSG (Small Sided Game)",
  LSG: "LSG (Large Sided Game)",
}

// Ball options for Part 1
export const BALL_OPTIONS = [
  { value: true, label: "With Ball" },
  { value: false, label: "Without Ball" },
] as const

// Classification levels for session analytics
export const CLASSIFICATION_LEVELS = [
  "MICRO",
  "MESO",
  "MACRO",
  "OTHER",
] as const

export const CLASSIFICATION_LEVEL_LABELS: Record<string, string> = {
  MICRO: "Micro",
  MESO: "Meso",
  MACRO: "Macro",
  OTHER: "Other",
}

// Training styles (game-based, technical, etc.)
export const TRAINING_STYLES = [
  "GAME_BASED",
  "TECHNICAL",
  "ISOLATED",
  "RONDO",
  "WARM_UP_BALL",
  "WARM_UP_NO_BALL",
  "GYM",
  "OTHER",
] as const

export const TRAINING_STYLE_LABELS: Record<string, string> = {
  GAME_BASED: "Game based",
  TECHNICAL: "Technical",
  ISOLATED: "Isolated",
  RONDO: "Rondo",
  WARM_UP_BALL: "Warm-up (with ball)",
  WARM_UP_NO_BALL: "Warm-up (no ball)",
  GYM: "Gym",
  OTHER: "Other",
}



