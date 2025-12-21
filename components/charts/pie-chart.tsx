"use client"

import React from "react"

interface PieChartSlice {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieChartSlice[]
  size?: number
  strokeWidth?: number
}

export function PieChart({ data, size = 180, strokeWidth = 32 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0)
  if (!total) {
    return <div className="text-sm text-muted-foreground">No data</div>
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let cumulative = 0

  const defaultColors = [
    "#4f46e5",
    "#06b6d4",
    "#22c55e",
    "#f97316",
    "#e11d48",
    "#0f766e",
    "#7c3aed",
    "#64748b",
  ]

  return (
    <div className="flex items-center space-x-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((slice, index) => {
            const value = slice.value || 0
            const fraction = value / total
            const dash = fraction * circumference
            const gap = circumference - dash
            const circle = (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color || defaultColors[index % defaultColors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={cumulative}
                strokeLinecap="butt"
              />
            )
            cumulative -= dash
            return circle
          })}
        </g>
      </svg>
      <div className="space-y-1 text-xs">
        {data.map((slice, index) => {
          const value = slice.value || 0
          const percent = (value / total) * 100
          const color = slice.color || defaultColors[index % defaultColors.length]
          return (
            <div key={slice.label} className="flex items-center space-x-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium">{slice.label}</span>
              <span className="text-muted-foreground">
                {value} min ({percent.toFixed(1)}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
