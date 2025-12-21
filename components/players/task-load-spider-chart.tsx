"use client"

interface TaskLoadSpiderChartProps {
  response: {
    mentalEffort: number
    physicalEffort: number
    timePressure: number
    performance: number // Inverted - high = bad
    effort: number
    frustration: number
  }
  size?: number
  showLabels?: boolean
}

export function TaskLoadSpiderChart({ response, size = 250, showLabels = true }: TaskLoadSpiderChartProps) {
  const center = size / 2
  const radius = size * 0.35
  const numPoints = 6

  // Normalize values (0-1 scale) - performance is inverted
  const normalize = (value: number) => {
    return Math.min(Math.max(value / 100, 0), 1)
  }

  const normalizedValues = {
    mentalEffort: normalize(response.mentalEffort),
    physicalEffort: normalize(response.physicalEffort),
    timePressure: normalize(response.timePressure),
    performance: normalize(100 - response.performance), // Invert performance (high = bad, so 100 - value)
    effort: normalize(response.effort),
    frustration: normalize(response.frustration),
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
    { name: "Mental ansträngning", value: response.mentalEffort, index: 0, key: "mentalEffort" as const },
    { name: "Fysisk ansträngning", value: response.physicalEffort, index: 1, key: "physicalEffort" as const },
    { name: "Tidskrav", value: response.timePressure, index: 2, key: "timePressure" as const },
    { name: "Prestation", value: response.performance, index: 3, key: "performance" as const },
    { name: "Ansträngning", value: response.effort, index: 4, key: "effort" as const },
    { name: "Frustration", value: response.frustration, index: 5, key: "frustration" as const },
  ]

  // Create polygon path
  const points = labels.map((label) => {
    const value = normalizedValues[label.key]
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
    const labelRadius = radius + 30
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

        {/* Data polygon with gradient */}
        <defs>
          <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.25)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="url(#wellnessGradient)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2.5"
          style={{ filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))" }}
        />

        {/* Labels */}
        {showLabels && labelPositions.map((label, i) => (
          <g key={i}>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-gray-800"
              style={{ fontWeight: 600 }}
            >
              {label.name}
            </text>
            <text
              x={label.x}
              y={label.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-600 font-medium"
            >
              {label.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

