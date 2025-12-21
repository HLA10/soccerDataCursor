"use client"

interface SpiderChartProps {
  stats: {
    goals: number
    assists: number
    minutes: number
    games: number
    avgRating?: number | null
    yellowCards: number
    redCards: number
  }
  maxValues: {
    goals: number
    assists: number
    minutes: number
    games: number
    avgRating: number
    yellowCards: number
    redCards: number
  }
}

export function SpiderChart({ stats, maxValues }: SpiderChartProps) {
  const size = 200
  const center = size / 2
  const radius = 80
  const numPoints = 7

  // Normalize values (0-1 scale)
  const normalize = (value: number, max: number) => {
    if (max === 0) return 0
    return Math.min(value / max, 1)
  }

  const normalizedStats = {
    goals: normalize(stats.goals, maxValues.goals),
    assists: normalize(stats.assists, maxValues.assists),
    minutes: normalize(stats.minutes, maxValues.minutes),
    games: normalize(stats.games, maxValues.games),
    avgRating: stats.avgRating ? normalize(stats.avgRating, maxValues.avgRating) : 0,
    yellowCards: normalize(stats.yellowCards, maxValues.yellowCards),
    redCards: normalize(stats.redCards, maxValues.redCards),
  }

  // Calculate points for the spider chart
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2
    const r = radius * value
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  const labels = [
    { name: "Goals", value: stats.goals, index: 0 },
    { name: "Assists", value: stats.assists, index: 1 },
    { name: "Minutes", value: stats.minutes, index: 2 },
    { name: "Games", value: stats.games, index: 3 },
    { name: "Rating", value: stats.avgRating?.toFixed(1) || "N/A", index: 4 },
    { name: "Yellow", value: stats.yellowCards, index: 5 },
    { name: "Red", value: stats.redCards, index: 6 },
  ]

  // Create polygon path
  const points = labels.map((label) => {
    const value = label.index === 0 ? normalizedStats.goals :
                 label.index === 1 ? normalizedStats.assists :
                 label.index === 2 ? normalizedStats.minutes :
                 label.index === 3 ? normalizedStats.games :
                 label.index === 4 ? normalizedStats.avgRating :
                 label.index === 5 ? normalizedStats.yellowCards :
                 normalizedStats.redCards
    return getPoint(label.index, value)
  })

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Create grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1].map((scale) => {
    const r = radius * scale
    const gridPoints = Array.from({ length: numPoints }, (_, i) => {
      const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    })
    const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    return { path: gridPath, r }
  })

  // Create label positions
  const labelPositions = labels.map((label) => {
    const angle = (Math.PI * 2 * label.index) / numPoints - Math.PI / 2
    const labelRadius = radius + 25
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      name: label.name,
      value: label.value,
    }
  })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {gridCircles.map((grid, i) => (
          <g key={i}>
            <path
              d={grid.path}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity={i === gridCircles.length - 1 ? 0.5 : 0.3}
            />
          </g>
        ))}

        {/* Grid lines */}
        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2
          const x2 = center + radius * Math.cos(angle)
          const y2 = center + radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />
          )
        })}

        {/* Data polygon */}
        <path
          d={pathData}
          fill="rgba(0, 0, 0, 0.2)"
          stroke="rgb(0, 0, 0)"
          strokeWidth="2"
        />

        {/* Labels */}
        {labelPositions.map((label, i) => (
          <g key={i}>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-gray-700"
            >
              {label.name}
            </text>
            <text
              x={label.x}
              y={label.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-500"
            >
              {typeof label.value === 'number' ? label.value : label.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

