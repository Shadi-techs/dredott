'use client'
// src/components/owner/Restricted.tsx
// Full-screen lock for pages the current role can't access.

import { DENSITY } from '@/lib/owner/theme'

import { Lock } from 'lucide-react'
import { useOwnerTheme } from './ThemeProvider'
import { Card } from './Card'

interface Props {
  title: string
  requiredPerm: string
}

export function RestrictedScreen({ title, requiredPerm }: Props) {
  const { palette } = useOwnerTheme()
  const t = palette
  const d = DENSITY.regular

  return (
    <div style={{ padding: d.pad }}>
      <Card style={{
        minHeight: 480, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 18, textAlign: 'center', maxWidth: 520, margin: '40px auto',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: t.borderSoft, color: t.textMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${t.border}`,
        }}>
          <Lock size={26} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 6,
          }}>Restricted</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500,
            color: t.text, letterSpacing: '-0.01em',
          }}>{title}</div>
        </div>
        <div style={{ fontSize: 13.5, color: t.textMuted, maxWidth: 380, lineHeight: 1.5 }}>
          Hidden for your role. Ask the account owner to grant you the{' '}
          <strong style={{ color: t.text, fontWeight: 600 }}>"{requiredPerm}"</strong> permission.
        </div>
      </Card>
    </div>
  )
}
