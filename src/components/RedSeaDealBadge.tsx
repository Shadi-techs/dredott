// ============================================
// Red Sea Deal Badge + Timer
// Path: src/components/RedSeaDealBadge.tsx
// Shows on listing cards when active flash deal
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

interface Props {
  endsAt: string
  discountPct: number
  compact?: boolean
}

export default function RedSeaDealBadge({ endsAt, discountPct, compact = false }: Props) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired]   = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); return }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      if (h > 0) setTimeLeft(`${h}h ${m}m`)
      else        setTimeLeft(`${m}m ${s}s`)
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (expired) return null

  if (compact) return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: '#fff', padding: '3px 10px', borderRadius: 20,
      fontSize: 10, fontWeight: 700,
    }}>
      <Zap size={10} fill="currentColor" />
      -{discountPct}% · {timeLeft}
    </div>
  )

  return (
    <div style={{
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      borderRadius: 12, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 12,
    }}>
      <Zap size={18} color="#fff" fill="#fff" />
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1 }}>
          ⚡ Red Sea Deal — {discountPct}% Off
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
          Expires in {timeLeft}
        </p>
      </div>
    </div>
  )
}