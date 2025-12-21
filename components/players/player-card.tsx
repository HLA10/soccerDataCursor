import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InjuryStatusBadge } from "./injury-status-badge"

interface PlayerCardProps {
  player: {
    id: string
    name: string
    position: string
    jerseyNumber?: number | null
    photo?: string | null
    isUnderContract?: boolean
    gameStats?: any[]
    injuries?: any[]
    illnesses?: any[]
  }
}

export function PlayerCard({ player }: PlayerCardProps) {
  const totalGoals =
    player.gameStats?.reduce((sum, stat) => sum + stat.goals, 0) || 0
  const totalAssists =
    player.gameStats?.reduce((sum, stat) => sum + stat.assists, 0) || 0
  const totalMinutes =
    player.gameStats?.reduce((sum, stat) => sum + stat.minutes, 0) || 0

  const hasActiveInjury = !!(player.injuries && player.injuries.length > 0)
  const hasActiveIllness = !!(player.illnesses && player.illnesses.length > 0)

  return (
    <Link href={`/players/${player.id}`}>
      <Card className="hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {player.photo ? (
              <img
                src={player.photo}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center ring-2 ring-slate-100">
                <span className="text-lg font-semibold text-white">
                  {player.name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                  {player.name}
                </h3>
                {player.jerseyNumber && (
                  <span className="text-xs font-bold text-slate-400">#{player.jerseyNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                  {player.position}
                </Badge>
                {(hasActiveInjury || hasActiveIllness) && (
                  <InjuryStatusBadge
                    hasInjury={hasActiveInjury}
                    hasIllness={hasActiveIllness}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{totalGoals}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{totalAssists}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Assists</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{totalMinutes}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Mins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

