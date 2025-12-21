"use client"

import { useMemo } from "react"
import { format, parseISO } from "date-fns"

interface TaskLoadTrendChartProps {
  responses: Array<{
    id: string
    submittedAt: string | Date
    mentalEffort: number
    physicalEffort: number
    timePressure: number
    performance: number
    effort: number
    frustration: number
  }>
  width?: number
  height?: number
}

const colors = {
  mentalEffort: "#3b82f6", // Blue
  physicalEffort: "#10b981", // Green
  timePressure: "#f59e0b", // Orange
  performance: "#ef4444", // Red (inverted - high = bad)
  effort: "#8b5cf6", // Purple
  frustration: "#ec4899", // Pink
}

const dimensions = [
  { key: "mentalEffort" as const, label: "Mental ansträngning", color: colors.mentalEffort },
  { key: "physicalEffort" as const, label: "Fysisk ansträngning", color: colors.physicalEffort },
  { key: "timePressure" as const, label: "Tidskrav", color: colors.timePressure },
  { key: "performance" as const, label: "Prestation", color: colors.performance },
  { key: "effort" as const, label: "Ansträngning", color: colors.effort },
  { key: "frustration" as const, label: "Frustration", color: colors.frustration },
]

export function TaskLoadTrendChart({ responses, width = 800, height = 400 }: TaskLoadTrendChartProps) {
  const margin = { top: 20, right: 80, bottom: 40, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const sortedResponses = useMemo(() => {
    return [...responses].sort((a, b) => {
      const dateA = typeof a.submittedAt === "string" ? parseISO(a.submittedAt) : a.submittedAt
      const dateB = typeof b.submittedAt === "string" ? parseISO(b.submittedAt) : b.submittedAt
      return dateA.getTime() - dateB.getTime()
    })
  }, [responses])

  const { minDate, maxDate, minValue, maxValue } = useMemo(() => {
    if (sortedResponses.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), minValue: 0, maxValue: 100 }
    }

    const dates = sortedResponses.map((r) => {
      return typeof r.submittedAt === "string" ? parseISO(r.submittedAt) : r.submittedAt
    })
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    // For performance, we'll invert it in the display (100 - value)
    const allValues = sortedResponses.flatMap((r) => [
      r.mentalEffort,
      r.physicalEffort,
      r.timePressure,
      100 - r.performance, // Invert performance
      r.effort,
      r.frustration,
    ])
    const minValue = Math.max(0, Math.min(...allValues) - 5)
    const maxValue = Math.min(100, Math.max(...allValues) + 5)

    return { minDate, maxDate, minValue, maxValue }
  }, [sortedResponses])

  const scaleX = (date: Date) => {
    const timeRange = maxDate.getTime() - minDate.getTime()
    if (timeRange === 0) return margin.left
    const position = (date.getTime() - minDate.getTime()) / timeRange
    return margin.left + position * chartWidth
  }

  const scaleY = (value: number) => {
    const valueRange = maxValue - minValue
    if (valueRange === 0) return margin.top + chartHeight / 2
    const position = (value - minValue) / valueRange
    return margin.top + chartHeight - position * chartHeight
  }

  const getPathData = (dimension: typeof dimensions[0]) => {
    if (sortedResponses.length === 0) return ""

    const points = sortedResponses.map((response) => {
      const date = typeof response.submittedAt === "string" ? parseISO(response.submittedAt) : response.submittedAt
      let value = response[dimension.key]
      // Invert performance for display
      if (dimension.key === "performance") {
        value = 100 - value
      }
      return {
        x: scaleX(date),
        y: scaleY(value),
        date,
        value,
      }
    })

    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  }

  if (sortedResponses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for trend analysis
      </div>
    )
  }

  return (
    <div className="w-full">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = scaleY(value)
          return (
            <g key={value}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          )
        })}

        {/* Date grid lines */}
        {sortedResponses.length > 0 && (
          <>
            {sortedResponses.map((response, index) => {
              if (index % Math.ceil(sortedResponses.length / 5) !== 0 && index !== sortedResponses.length - 1) {
                return null
              }
              const date = typeof response.submittedAt === "string" ? parseISO(response.submittedAt) : response.submittedAt
              const x = scaleX(date)
              return (
                <g key={response.id}>
                  <line
                    x1={x}
                    y1={margin.top}
                    x2={x}
                    y2={margin.top + chartHeight}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                  <text
                    x={x}
                    y={height - margin.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {format(date, "MMM d")}
                  </text>
                </g>
              )
            })}
          </>
        )}

        {/* Data lines */}
        {dimensions.map((dimension) => {
          const pathData = getPathData(dimension)
          return (
            <path
              key={dimension.key}
              d={pathData}
              fill="none"
              stroke={dimension.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          )
        })}

        {/* Data points */}
        {dimensions.map((dimension) =>
          sortedResponses.map((response) => {
            const date = typeof response.submittedAt === "string" ? parseISO(response.submittedAt) : response.submittedAt
            let value = response[dimension.key]
            if (dimension.key === "performance") {
              value = 100 - value
            }
            return (
              <circle
                key={`${dimension.key}-${response.id}`}
                cx={scaleX(date)}
                cy={scaleY(value)}
                r="3"
                fill={dimension.color}
                stroke="white"
                strokeWidth="1.5"
                className="hover:r-4 transition-all"
              />
            )
          })
        )}

        {/* Y-axis label */}
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 20, ${height / 2})`}
          className="text-sm font-semibold fill-gray-700"
        >
          Score (0-100)
        </text>

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm font-semibold fill-gray-700"
        >
          Date
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {dimensions.map((dimension) => (
          <div key={dimension.key} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: dimension.color }}
            />
            <span className="text-sm text-gray-700">{dimension.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}



