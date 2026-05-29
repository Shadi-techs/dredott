'use client'
// src/components/owner/ImagePlaceholder.tsx
// Striped placeholder block — swap for <Image> with a real src in production.

import { CSSProperties } from 'react'
import { useOwnerTheme } from './ThemeProvider'

interface Props {
  label: string
  height?: number
  style?: CSSProperties
}

export function ImagePlaceholder({ label, height = 120, style }: Props) {
  const { t } = useOwnerTheme()
  return (
    <div style={{
      height, width: '100%', borderRadius: 8, overflow: 'hidden',
      background: t.surfaceAlt,
      border: `1px solid ${t.borderSoft}`,
      display: 'flex', alignItems: 'flex-end', padding: 8,
      position: 'relative', ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, ${t.border} 0 1px, transparent 1px 14px)`,
        opacity: 0.5,
      }} />
      <span style={{
        position: 'relative', fontFamily: 'var(--mono)', fontSize: 9,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: t.textFaint, background: t.surface,
        padding: '2px 6px', borderRadius: 4,
        border: `1px solid ${t.borderSoft}`,
      }}>{label}</span>
    </div>
  )
}
