import { z } from "zod"

// Validation result type with discriminated union for better type safety
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Generic request body validator
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<ValidationResult<T>> {
  try {
    const data = await schema.parseAsync(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => {
        const path = e.path.join(".")
        return path ? `${path}: ${e.message}` : e.message
      })
      return {
        success: false,
        error: errorMessages.join(", "),
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Validation failed",
    }
  }
}

// Invitation creation schema
export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "COACH", "PLAYER"], {
    errorMap: () => ({ message: "Role must be ADMIN, COACH, or PLAYER" }),
  }),
  teamId: z.string().uuid("Invalid team ID").optional(),
})

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>

// Player creation schema
export const createPlayerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  jerseyNumber: z.number().int().positive().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.date().optional()),
  primaryTeamId: z.string().uuid("Invalid team ID").optional(),
  photo: z.string().url().optional().or(z.string().optional()),
  isUnderContract: z.boolean().optional().default(true),
})

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
