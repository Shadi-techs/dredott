'use client'
// src/components/owner/Badge.tsx

import { ReactNode } from 'react'
import { useOwnerTheme } from './ThemeProvider'

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

interface Props {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}

export function Badge({ tone = 'neutral', dot = false, children }: Props) {
  const { palette } = useOwnerTheme()  // ✅ Fixed
  const t = palette
  
  const tones: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: t.borderSoft || 'rgba(0,0,0,0.08)',  fg: t.textMuted },
    accent:  { bg: t.accentSoft,                        fg: t.accent    },
    success: { bg: 'rgba(74,222,128,0.12)',             fg: t.success   },
    danger:  { bg: 'rgba(248,113,113,0.12)',            fg: t.danger    },
    warning: { bg: 'rgba(251,191,36,0.12)',             fg: '#f59e0b'   },
  }
  
  const { bg, fg } = tones[tone]
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: dot ? 5 : 0,
      padding: '3px 9px',
      borderRadius: 20,
      background: bg,
      color: fg,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--mono)',
      letterSpacing: '0.02em',
    }}>
      {dot && (
        <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: fg,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  )
}