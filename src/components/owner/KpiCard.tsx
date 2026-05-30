'use client'
// src/components/owner/KpiCard.tsx

import { useOwnerTheme } from './ThemeProvider'
import { Card } from './Card'
import { Sparkline } from './Sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { DENSITY } from '@/lib/owner/theme'

interface Props {
  label: string
  value: string
  delta?: number
  sparkData?: number[]
  color?: string
}

export function KpiCard({ label, value, delta = 0, sparkData = [], color }: Props) {
  const { t, d } = useOwnerTheme()
  
  const positive = delta >= 0
  
  return (
    <Card hover style={{ padding: d.pad, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: t.textFaint,
        }}>
          {label}
        </div>
        {delta !== 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)',
            color: positive ? t.success : t.danger,
          }}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {positive ? '+' : ''}{delta.toFixed(1)}%
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500,
        color: t.text, lineHeight: 1,
      }}>
        {value}
      </div>

      {sparkData.length > 0 && (
        <Sparkline data={sparkData} color={color || t.accent} height={32} />
      )}
    </Card>
  )
}