"use client"

import { useState } from "react"

interface Player {
  id: string
  name: string
  jerseyNumber?: number
  position?: string
}

interface PlayerSearchProps {
  roster: Player[]
  label: string
  onSelect: (player: Player) => void
}

export default function PlayerSearch({ roster, label, onSelect }: PlayerSearchProps) {
  const [query, setQuery] = useState("")
  const [filtered, setFiltered] = useState<Player[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.length === 0) {
      setFiltered([])
      return
    }

    const match = roster.filter(player =>
      player.name.toLowerCase().includes(value.toLowerCase())
    )

    setFiltered(match.slice(0, 8)) // show max 8 options
  }

  const handleSelect = (player: Player) => {
    onSelect(player)
    setQuery(player.name)
    setFiltered([])
  }

  return (
    <div style={{ marginBottom: "20px", width: "100%", position: "relative" }}>
      {label && (
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>{label}</label>
      )}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type player name..."
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #000",
          borderRadius: "4px",
          marginTop: label ? "5px" : "0"
        }}
      />

      {/* Dropdown results */}
      {filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          border: "1px solid black",
          borderTop: "none",
          background: "white",
          maxHeight: "150px",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          {filtered.map(player => (
            <div
              key={player.id}
              onClick={() => handleSelect(player)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white"
              }}
            >
              {player.name} {player.jerseyNumber ? `#${player.jerseyNumber}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

