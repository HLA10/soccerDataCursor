"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface StaffCardProps {
  staff: {
    id: string
    name: string
    position: string
    email?: string | null
    phone?: string | null
    photo?: string | null
  }
}

export function StaffCard({ staff }: StaffCardProps) {
  return (
    <Link href={`/staff/${staff.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {staff.photo ? (
              <img
                src={staff.photo}
                alt={staff.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {staff.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{staff.name}</h3>
              <Badge variant="secondary" className="mb-2">
                {staff.position}
              </Badge>
              {staff.email && (
                <p className="text-sm text-muted-foreground truncate">
                  {staff.email}
                </p>
              )}
              {staff.phone && (
                <p className="text-sm text-muted-foreground">
                  {staff.phone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


