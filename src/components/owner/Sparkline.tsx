'use client'
// src/components/owner/Sparkline.tsx

interface Props {
  data: number[]
  color: string
  height?: number
  width?: number
  fill?: boolean
}

export function Sparkline({ data, color, height = 36, width = 120, fill = true }: Props) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2] as const)
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const areaPath = `${path} L${width},${height} L0,${height} Z`
  const gradId = `sp-${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#${gradId})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
