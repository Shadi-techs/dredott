'use client'
// src/components/owner/Card.tsx

import { ReactNode, CSSProperties, useState } from 'react'
import { useOwnerTheme } from './ThemeProvider'
import { DENSITY } from '@/lib/owner/theme'


interface Props {
  children: ReactNode
  padding?: number
  style?: CSSProperties
  hover?: boolean
}

export function Card({ children, padding, style, hover }: Props) {
  const { palette } = useOwnerTheme()
  const t = palette
  const d = DENSITY.regular
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: padding ?? d.cardPad,
        transition: 'box-shadow .2s, border-color .2s, transform .2s',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.06)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
