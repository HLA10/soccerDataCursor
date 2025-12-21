"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotoUpload } from "@/components/ui/image-cropper"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [teamData, setTeamData] = useState({
    name: "",
    code: "",
    logo: "",
  })

  const user = session?.user as any

  const handleCreateTeam = async () => {
    if (!teamData.name) return

    setLoading(true)
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamData.name,
          code: teamData.code || teamData.name.toUpperCase().replace(/\s+/g, "").slice(0, 8),
          logo: teamData.logo || null,
        }),
      })

      if (res.ok) {
        setStep(3)
      }
    } catch (error) {
      console.error("Error creating team:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    localStorage.setItem("onboardingComplete", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1 rounded ${s <= step ? "bg-primary" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Step {step} of 3</span>
          </div>
          <CardTitle>
            {step === 1 && "Welcome to Football CMS!"}
            {step === 2 && "Create Your Team"}
            {step === 3 && "You're All Set!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's get you started with your team management."}
            {step === 2 && "Set up your first team to begin tracking players and games."}
            {step === 3 && "Your team is ready. Start adding players and scheduling games."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">What you can do:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manage player rosters and profiles</li>
                  <li>• Track games and player statistics</li>
                  <li>• Schedule and record training sessions</li>
                  <li>• Analyze team performance</li>
                  <li>• Invite players to their own portal</li>
                </ul>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., U15 Boys A"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code (for player invites)</Label>
                <Input
                  id="teamCode"
                  placeholder="e.g., U15BOYSA"
                  value={teamData.code}
                  onChange={(e) => setTeamData({ ...teamData, code: e.target.value.toUpperCase() })}
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  Players will use this code to join your team
                </p>
              </div>
              <div className="space-y-2">
                <Label>Team Logo (Optional)</Label>
                <PhotoUpload
                  currentPhoto={teamData.logo}
                  onPhotoChange={(logo) => setTeamData({ ...teamData, logo })}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateTeam}
                  disabled={!teamData.name || loading}
                >
                  {loading ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Team Created!</h3>
                <p className="text-sm text-green-700">
                  Your team "{teamData.name}" is ready. Share the code <strong>{teamData.code || teamData.name.toUpperCase().replace(/\s+/g, "").slice(0, 8)}</strong> with players to invite them.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Next steps:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Add players to your roster</li>
                  <li>2. Schedule your first game or training</li>
                  <li>3. Share the join link with players</li>
                </ul>
              </div>
              <Button className="w-full" onClick={handleComplete}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

