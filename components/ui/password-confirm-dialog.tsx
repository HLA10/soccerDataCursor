"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PasswordConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
  title?: string
  description?: string
  confirmText?: string
}

export function PasswordConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Please enter your password to confirm this action.",
  confirmText = "Confirm",
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!password) {
      setError("Password is required")
      return
    }

    setLoading(true)
    try {
      await onConfirm(password)
      setPassword("")
      onClose()
    } catch (err: any) {
      setError(err.message || "Invalid password")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Confirming..." : confirmText}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

