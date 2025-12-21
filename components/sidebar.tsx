"use client"

import { useRouter } from "next/navigation"
import { useTeam } from "@/contexts/team-context"
import { ClubLogo } from "@/components/club-logo"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

function NavSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:bg-slate-800 rounded-md transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <nav className="mt-1 space-y-1">{children}</nav>}
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      {children}
    </Link>
  )
}

export function Sidebar() {
  const router = useRouter()
  const { selectedTeam, teams, setSelectedTeam, loading, refreshTeams } = useTeam()
  const { data: session } = useSession()
  const [teamsOpen, setTeamsOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [])

  if (!session) return null

  const user = session.user as any

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border shadow-sm"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        w-64 bg-slate-900 text-slate-100 min-h-screen fixed left-0 top-0 overflow-y-auto z-40
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
      <div className="p-4">
        {/* Logo */}
        <div className="mb-6 flex items-center space-x-2">
          <ClubLogo className="w-8 h-8" />
          <span className="text-base font-bold text-white">Football CMS</span>
        </div>

        {/* Team Selection Dropdown */}
        <div className="mb-4">
          <button
            onClick={() => setTeamsOpen(!teamsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:bg-slate-800 rounded-md transition-colors"
          >
            <span>Teams</span>
            <svg
              className={`w-4 h-4 transition-transform ${teamsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {teamsOpen && (
            <div className="mt-2">
              {loading ? (
                <div className="text-sm text-slate-400 px-3 py-2">Loading teams...</div>
              ) : teams.length > 0 ? (
                <select
                  value={selectedTeam?.id || ""}
                  onChange={(e) => {
                    const team = teams.find((t) => t.id === e.target.value)
                    if (team) {
                      setSelectedTeam(team)
                      router.refresh()
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-slate-400 px-3 py-2">No teams available</div>
                  <button
                    onClick={() => refreshTeams()}
                    className="w-full px-3 py-1.5 text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main */}
        <NavSection title="Main" defaultOpen={true}>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/calendar">Calendar</NavLink>
        </NavSection>

        {/* Team */}
        <NavSection title="Team" defaultOpen={true}>
          <NavLink href="/teams">Teams</NavLink>
          <NavLink href="/players">Players</NavLink>
          <NavLink href="/staff">Staff</NavLink>
          <NavLink href="/admin/wellness">Player Wellness</NavLink>
        </NavSection>

        {/* Matches */}
        <NavSection title="Matches">
          <NavLink href="/games">Games</NavLink>
          <NavLink href="/tournaments">Tournaments</NavLink>
          <NavLink href="/opponents">Opponents</NavLink>
          <NavLink href="/competitions">Competitions</NavLink>
        </NavSection>

        {/* Training */}
        <NavSection title="Training">
          <NavLink href="/trainings">Trainings</NavLink>
          <NavLink href="/training-templates">Templates</NavLink>
        </NavSection>

        {/* Performance */}
        <NavSection title="Performance">
          <NavLink href="/statistics">Statistics</NavLink>
          <NavLink href="/scouting">Scouting</NavLink>
        </NavSection>

        {/* Admin Section */}
        {(user?.role === "ADMIN" || user?.role === "SUPER_USER" || user?.role === "COACH") && (
          <NavSection title="Admin">
            <NavLink href="/admin/invitations">Invitations</NavLink>
            {user?.role === "ADMIN" && (
              <NavLink href="/admin/club-logos">Club Logos</NavLink>
            )}
          </NavSection>
        )}
      </div>
    </aside>
    </>
  )
}

