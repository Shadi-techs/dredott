'use client'
// src/components/owner/Button.tsx

import { ReactNode, CSSProperties } from 'react'
import { LucideIcon } from 'lucide-react'
import { useOwnerTheme } from './ThemeProvider'

type Variant = 'primary' | 'ghost' | 'soft' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  children?: ReactNode
  onClick?: () => void
  style?: CSSProperties
  title?: string
  disabled?: boolean
  tone?: 'ghost' | 'danger' | 'primary'  // Added for compatibility
}

export function Button({
  variant = 'primary', size = 'md', icon: IconCmp,
  children, onClick, style, title, disabled, tone,
}: Props) {
  const { t, d } = useOwnerTheme()  // ✅ Fixed: destructure palette
  
  const sizes = {
    sm: { px: 10, py: 5,  fs: 12 },
    md: { px: 14, py: 8,  fs: 13 },
    lg: { px: 18, py: 11, fs: 14 },
  }
  const s = sizes[size]
  
  const variants = {
    primary: { bg: t.accent, fg: t.accentInk, br: t.accent },
    ghost:   { bg: 'transparent', fg: t.text, br: t.border },
    soft:    { bg: t.accentSoft, fg: t.accent, br: 'transparent' },
    quiet:   { bg: 'transparent', fg: t.textMuted, br: 'transparent' },
  } as const
  
  const v = variants[variant]
  
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: `${s.py}px ${s.px}px`, borderRadius: 9,
        background: v.bg, color: v.fg,
        border: `1px solid ${v.br}`,
        fontSize: s.fs, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        transition: 'all .15s',
        ...style,
      }}
    >
      {IconCmp && <IconCmp size={s.fs + 2} />}
      {children}
    </button>
  )
}