"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signOut } from "next-auth/react"

export default function PlayerWellnessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [mentalEffort, setMentalEffort] = useState("")
  const [physicalEffort, setPhysicalEffort] = useState("")
  const [timePressure, setTimePressure] = useState("")
  const [performance, setPerformance] = useState("")
  const [effort, setEffort] = useState("")
  const [frustration, setFrustration] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/player/login")
      return
    }

    // Allow ADMIN, SUPER_USER, COACH, and PLAYER to access this page
    const allowedRoles = ["PLAYER", "ADMIN", "SUPER_USER", "COACH"]
    if (status === "authenticated" && user?.role && !allowedRoles.includes(user.role)) {
      router.push("/dashboard")
      return
    }

    // Only PLAYER role needs playerId to submit forms
    if (user?.role === "PLAYER" && !user?.playerId) {
      // Player without playerId - show error
      setError("Player account not properly linked. Please contact an administrator.")
    }
  }, [status, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate all fields are between 1-100
      const values = [
        parseInt(mentalEffort),
        parseInt(physicalEffort),
        parseInt(timePressure),
        parseInt(performance),
        parseInt(effort),
        parseInt(frustration),
      ]

      if (values.some(v => isNaN(v) || v < 1 || v > 100)) {
        alert("All values must be between 1 and 100")
        setSubmitting(false)
        return
      }

      // Check for duplicate values (as per form requirement)
      const uniqueValues = new Set(values)
      if (uniqueValues.size !== values.length) {
        alert("Du kan inte ge samma siffra för två olika frågor. / You cannot give the same number for two different questions.")
        setSubmitting(false)
        return
      }

      const res = await fetch("/api/task-load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: user.playerId,
          mentalEffort: parseInt(mentalEffort),
          physicalEffort: parseInt(physicalEffort),
          timePressure: parseInt(timePressure),
          performance: parseInt(performance),
          effort: parseInt(effort),
          frustration: parseInt(frustration),
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to submit response")
        return
      }

      // Reset form
      setMentalEffort("")
      setPhysicalEffort("")
      setTimePressure("")
      setPerformance("")
      setEffort("")
      setFrustration("")

      // Show success message
      setSuccessMessage("Svar skickat! Tack för din feedback.")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error submitting response:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  // Allow ADMIN, SUPER_USER, COACH, and PLAYER to access this page
  const allowedRoles = ["PLAYER", "ADMIN", "SUPER_USER", "COACH"]
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  // Only PLAYER role can submit the form
  const canSubmit = user.role === "PLAYER"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task Load F2012</h1>
            <p className="text-gray-600 mt-2">
              {user.role === "PLAYER" 
                ? `Välkommen, ${user.name || user.email}. Fyll i formuläret efter varje träningspass.`
                : `Viewing as ${user.role}. ${canSubmit ? "You can submit responses." : "View-only mode."}`
              }
            </p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut({ callbackUrl: "/player/login" })
            }}
          >
            Sign Out
          </Button>
        </div>

        {/* Questionnaire Form */}
        <Card>
          <CardHeader>
            <CardTitle>Skicka ditt svar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  Bedöm varje dimension (1 - väldigt lite / 100 - väldigt mycket)
                </p>
                <p className="text-sm text-blue-800">
                  Du kan inte ge samma siffra för två olika frågor.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mentalEffort">
                    Mental ansträngning *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Hur mycket mental och kognitiv aktivitet krävdes? (t.ex. tänkande, beslutsfattande, minne, uppmärksamhet)
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur mentalt krävande var uppgiften?
                    </span>
                  </Label>
                  <Input
                    id="mentalEffort"
                    type="number"
                    min="1"
                    max="100"
                    value={mentalEffort}
                    onChange={(e) => setMentalEffort(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physicalEffort">
                    Fysisk ansträngning *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Hur mycket fysisk ansträngning krävdes? (t.ex. rörelser, styrka, uthållighet)
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur fysiskt krävande var uppgiften?
                    </span>
                  </Label>
                  <Input
                    id="physicalEffort"
                    type="number"
                    min="1"
                    max="100"
                    value={physicalEffort}
                    onChange={(e) => setPhysicalEffort(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timePressure">
                    Tidskrav *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Hur pressad av tid kände du dig under uppgiften?
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur stressande var tidspressen under uppgiften?
                    </span>
                  </Label>
                  <Input
                    id="timePressure"
                    type="number"
                    min="1"
                    max="100"
                    value={timePressure}
                    onChange={(e) => setTimePressure(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="performance">
                    Prestation *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Hur nöjd är du med din egen prestation? (OBS: Höga poäng betyder att du tycker att du presterade dåligt)
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur bra tycker du att du presterade? (Hög poäng = dålig prestation)
                    </span>
                  </Label>
                  <Input
                    id="performance"
                    type="number"
                    min="1"
                    max="100"
                    value={performance}
                    onChange={(e) => setPerformance(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effort">
                    Ansträngning *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Hur mycket ansträngde du dig för att nå den upplevda nivån av prestation?
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur hårt var du tvungen att arbeta (mentalt och/eller fysiskt)?
                    </span>
                  </Label>
                  <Input
                    id="effort"
                    type="number"
                    min="1"
                    max="100"
                    value={effort}
                    onChange={(e) => setEffort(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frustration">
                    Frustration *
                    <span className="text-xs text-gray-500 block mt-1 font-normal">
                      Kände du dig irriterad, stressad, osäker eller frustrerad under uppgiften?
                    </span>
                    <span className="text-xs text-gray-700 block mt-1 font-semibold">
                      → Hur frustrerad eller känslomässigt påverkad var du?
                    </span>
                  </Label>
                  <Input
                    id="frustration"
                    type="number"
                    min="1"
                    max="100"
                    value={frustration}
                    onChange={(e) => setFrustration(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="1-100"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-red-50 border border-red-200 rounded p-3">{error}</div>
              )}
              {successMessage && (
                <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded p-3">
                  {successMessage}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting || !canSubmit}>
                {submitting ? "Skickar..." : canSubmit ? "Skicka svar" : "View Only (Player Access Required)"}
              </Button>
              {!canSubmit && (
                <p className="text-sm text-muted-foreground text-center">
                  Only players can submit wellness responses. Admins and coaches can view this page but cannot submit.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

