"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface CommentSectionProps {
  playerId: string
  comments: any[]
  canEdit?: boolean
}

export function CommentSection({
  playerId,
  comments: initialComments,
  canEdit = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [showForm, setShowForm] = useState(false)
  const [comment, setComment] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/players/${playerId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
          category: category || null,
        }),
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments([newComment, ...comments])
        setComment("")
        setCategory("")
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Development Comments</CardTitle>
          {canEdit && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Add Comment"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && canEdit && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div>
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Technical, Tactical, Physical"
              />
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter development comment..."
                required
                rows={4}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Comment"}
            </Button>
          </form>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {comment.author?.name || comment.author?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.date), "MMM d, yyyy 'at' h:mm a")}
                      {comment.category && ` • ${comment.category}`}
                    </p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

