"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import { StarRating } from "@/components/ui/star-rating"

interface StatsTableProps {
  stats: any[]
  type: "game" | "tournament"
  playerId: string
  canEdit?: boolean
}

export function StatsTable({
  stats,
  type,
  playerId,
  canEdit = false,
}: StatsTableProps) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No statistics available
      </div>
    )
  }

  if (type === "game") {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Minutes</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Assists</TableHead>
              <TableHead>Yellow Cards</TableHead>
              <TableHead>Red Cards</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat: any) => (
              <TableRow key={stat.id}>
                <TableCell>
                  {format(new Date(stat.game.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Link href={`/games/${stat.game.id}`} className="hover:underline text-primary flex items-center space-x-2">
                    {stat.game.opponentClub?.logo && (
                      <div className="relative w-5 h-5 flex-shrink-0 overflow-hidden bg-white rounded border border-gray-200" style={{ aspectRatio: "1/1" }}>
                        <img
                          src={stat.game.opponentClub.logo}
                          alt={stat.game.opponentClub.name || stat.game.opponent}
                          className="w-full h-full object-contain p-0.5"
                          style={{ objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    <span>{stat.game.opponentClub?.name || stat.game.opponent}</span>
                  </Link>
                </TableCell>
                <TableCell>{stat.game.competition}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{stat.minutes}'</span>
                    {stat.started && (
                      <span className="text-xs text-muted-foreground">Started</span>
                    )}
                    {stat.substitutionMinute && (
                      <span className="text-xs text-muted-foreground">
                        Sub {stat.substitutionMinute}'
                        {stat.substitutedByPlayer && (
                          <span> by{" "}
                            {stat.substitutedByPlayer.id ? (
                              <Link href={`/players/${stat.substitutedByPlayer.id}`} className="hover:underline text-primary">
                                {stat.substitutedByPlayer.name}
                              </Link>
                            ) : (
                              stat.substitutedByPlayer.name
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{stat.goals}</span>
                    {stat.goalMinutes && stat.goalMinutes.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {typeof stat.goalMinutes === 'string' 
                          ? JSON.parse(stat.goalMinutes).join(", ")
                          : stat.goalMinutes.join(", ")}'
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{stat.assists}</span>
                    {stat.assistMinutes && stat.assistMinutes.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {typeof stat.assistMinutes === 'string'
                          ? JSON.parse(stat.assistMinutes).join(", ")
                          : stat.assistMinutes.join(", ")}'
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{stat.yellowCards}</TableCell>
                <TableCell>{stat.redCards}</TableCell>
                <TableCell>
                  {stat.rating ? (
                    <StarRating 
                      value={Math.max(1, Math.min(5, stat.rating))} 
                      readonly 
                      size="sm" 
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Tournament stats
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tournament</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>Appearances</TableHead>
            <TableHead>Minutes</TableHead>
            <TableHead>Goals</TableHead>
            <TableHead>Assists</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat: any) => (
            <TableRow key={stat.id}>
              <TableCell>{stat.tournament.name}</TableCell>
              <TableCell>{stat.tournament.season}</TableCell>
              <TableCell>{stat.appearances}</TableCell>
              <TableCell>{stat.minutes}</TableCell>
              <TableCell>{stat.goals}</TableCell>
              <TableCell>{stat.assists}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

