export type UserRole = "SUPER_USER" | "ADMIN" | "COACH" | "VIEWER" | "PLAYER"

/**
 * Check if user can delete data (SUPER_USER and ADMIN)
 */
export function canDelete(userRole: UserRole): boolean {
  return userRole === "SUPER_USER" || userRole === "ADMIN"
}

/**
 * Check if user can edit a resource
 * - SUPER_USER and ADMIN can edit anything
 * - COACH can only edit their own team's resources
 * - VIEWER cannot edit
 */
export function canEdit(
  userRole: UserRole,
  userTeamId: string | null | undefined,
  resourceTeamId: string | null | undefined
): boolean {
  if (userRole === "SUPER_USER" || userRole === "ADMIN") {
    return true
  }
  if (userRole === "COACH" && userTeamId && resourceTeamId && userTeamId === resourceTeamId) {
    return true
  }
  return false
}

/**
 * Check if user can create resources
 * - SUPER_USER, ADMIN, and COACH can create
 * - VIEWER cannot create
 */
export function canCreate(userRole: UserRole): boolean {
  return userRole === "SUPER_USER" || userRole === "ADMIN" || userRole === "COACH"
}

/**
 * Check if user can view resources (all authenticated users can view)
 */
export function canView(userRole: UserRole): boolean {
  return true // All authenticated users can view
}

/**
 * Check if user can add players to games (all users can do this for lineup purposes)
 */
export function canAddPlayerToGame(userRole: UserRole): boolean {
  return true // All authenticated users can add players to games
}

/**
 * Check if user can manage invitations (only ADMIN and SUPER_USER)
 */
export function canManageInvitations(userRole: UserRole): boolean {
  return userRole === "SUPER_USER" || userRole === "ADMIN"
}

/**
 * Check if user can manage staff (ADMIN and SUPER_USER)
 */
export function canManageStaff(userRole: UserRole): boolean {
  return userRole === "SUPER_USER" || userRole === "ADMIN"
}

