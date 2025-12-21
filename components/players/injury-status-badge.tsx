import { Badge } from "@/components/ui/badge"

interface InjuryStatusBadgeProps {
  hasInjury: boolean
  hasIllness: boolean
}

export function InjuryStatusBadge({
  hasInjury,
  hasIllness,
}: InjuryStatusBadgeProps) {
  if (hasInjury && hasIllness) {
    return (
      <div className="flex space-x-1">
        <Badge variant="destructive">Injured</Badge>
        <Badge variant="destructive">Ill</Badge>
      </div>
    )
  }

  if (hasInjury) {
    return <Badge variant="destructive">Injured</Badge>
  }

  if (hasIllness) {
    return <Badge variant="destructive">Ill</Badge>
  }

  return null
}

