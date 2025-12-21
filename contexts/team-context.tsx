"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Team {
  id: string
  name: string
  code?: string | null
  logo?: string | null
}

interface TeamContextType {
  selectedTeam: Team | null
  teams: Team[]
  setSelectedTeam: (team: Team | null) => void
  loading: boolean
  refreshTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [selectedTeam, setSelectedTeamState] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const refreshTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      const data = await res.json()
      
      if (res.ok) {
        setTeams(data)
        
        // Restore selected team from localStorage or set first team
        const savedTeamId = localStorage.getItem("selectedTeamId")
        if (savedTeamId && data.length > 0) {
          const savedTeam = data.find((t: Team) => t.id === savedTeamId)
          if (savedTeam) {
            setSelectedTeamState(savedTeam)
            setLoading(false)
            return
          }
        }
        
        // If no saved team, use first team
        if (data.length > 0) {
          setSelectedTeamState(data[0])
          localStorage.setItem("selectedTeamId", data[0].id)
        } else {
          // No teams exist - that's okay, migration may not be run
          setSelectedTeamState(null)
        }
      } else {
        // API returned an error
        console.error("Teams API error:", data.error || "Unknown error")
        setTeams([])
        setSelectedTeamState(null)
      }
    } catch (error: any) {
      // Network or other error
      console.error("Teams API not available:", error.message || error)
      setTeams([])
      setSelectedTeamState(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTeams()
  }, [])

  const setSelectedTeam = (team: Team | null) => {
    setSelectedTeamState(team)
    if (team) {
      localStorage.setItem("selectedTeamId", team.id)
    } else {
      localStorage.removeItem("selectedTeamId")
    }
  }

  return (
    <TeamContext.Provider
      value={{
        selectedTeam,
        teams,
        setSelectedTeam,
        loading,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
