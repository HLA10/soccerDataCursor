"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InvitationForm } from "@/components/forms/invitation-form"
import { canManageInvitations } from "@/lib/permissions"

export default function InvitationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invitations, setInvitations] = useState<any[]>([])
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"invitations" | "pending">("pending")

  const user = session?.user as any

  useEffect(() => {
    if (session && !canManageInvitations(user?.role)) {
      router.push("/dashboard")
      return
    }
    fetchInvitations()
    fetchPendingUsers()
  }, [session])

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations")
      if (res.ok) {
        const data = await res.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch("/api/users/pending")
      if (res.ok) {
        const data = await res.json()
        setPendingUsers(data)
      }
    } catch (error) {
      console.error("Error fetching pending users:", error)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/approve`, { method: "POST" })
      if (res.ok) {
        fetchPendingUsers()
      }
    } catch (error) {
      console.error("Error approving user:", error)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/reject`, { method: "POST" })
      if (res.ok) {
        fetchPendingUsers()
      }
    } catch (error) {
      console.error("Error rejecting user:", error)
    }
  }

  const getStatusBadge = (invitation: any) => {
    if (invitation.usedAt) {
      return <Badge variant="secondary">Used</Badge>
    }
    if (new Date() > new Date(invitation.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  if (!session || !canManageInvitations(user?.role)) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage Access</h1>
        <p className="text-sm text-muted-foreground">Approve player registrations and manage invitations</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Approvals {pendingUsers.length > 0 && `(${pendingUsers.length})`}
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "invitations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Invitations
        </button>
      </div>

      {activeTab === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Player Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending registrations
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{pendingUser.name}</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{pendingUser.email}</p>
                        {pendingUser.team && <p>Team: {pendingUser.team.name}</p>}
                        <p>Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleApprove(pendingUser.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(pendingUser.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "invitations" && (
        <>
          <InvitationForm onSuccess={fetchInvitations} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations yet
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-md"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{invitation.email}</span>
                          {getStatusBadge(invitation)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Role: <span className="font-medium">{invitation.role}</span>
                          </p>
                          {invitation.team && (
                            <p>
                              Team: <span className="font-medium">{invitation.team.name}</span>
                              {invitation.team.code && ` (${invitation.team.code})`}
                            </p>
                          )}
                          <p>
                            Created: {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                          {invitation.usedAt && (
                            <p>
                              Accepted: {new Date(invitation.usedAt).toLocaleDateString()}
                            </p>
                          )}
                          {!invitation.usedAt && (
                            <p>
                              Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

