'use client'
// src/components/owner/ScreenHeader.tsx

import { ReactNode } from 'react'
import { useOwnerTheme } from './ThemeProvider'

interface Props {
  kicker?: string
  title: string
  sub?: string
  actions?: ReactNode
}

export function ScreenHeader({ kicker, title, sub, actions }: Props) {
  const { t, d } = useOwnerTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16, marginBottom: d.gap,
    }}>
      <div>
        {kicker && (
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 6,
          }}>{kicker}</div>
        )}
        <h1 style={{
          margin: 0, fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500,
          color: t.text, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>{title}</h1>
        {sub && (
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: t.textMuted, maxWidth: 540 }}>
            {sub}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}
