import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["application/pdf"]

export interface UploadResult {
  success: boolean
  filePath?: string
  error?: string
}

/**
 * Validates a file upload
 */
export function validateFile(file: File | { type: string; size: number }): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only PDF files are allowed",
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Generates a unique filename for an uploaded file
 */
export function generateFileName(originalName: string, trainingId: string): string {
  const timestamp = Date.now()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const extension = sanitizedName.split(".").pop() || "pdf"
  return `${trainingId}_${timestamp}.${extension}`
}

/**
 * Saves an uploaded file to the server
 */
export async function saveUploadedFile(
  file: File | { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
  trainingId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Generate file path
    const uploadDir = join(process.cwd(), "public", "uploads", "training-plans", trainingId)
    const fileName = generateFileName(file.name, trainingId)
    const filePath = join(uploadDir, fileName)

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return relative path from public directory
    const relativePath = `/uploads/training-plans/${trainingId}/${fileName}`

    return {
      success: true,
      filePath: relativePath,
    }
  } catch (error: any) {
    console.error("Error saving file:", error)
    return {
      success: false,
      error: error.message || "Failed to save file",
    }
  }
}

/**
 * Deletes an uploaded file
 */
export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), "public", filePath)
    
    if (existsSync(fullPath)) {
      await unlink(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

