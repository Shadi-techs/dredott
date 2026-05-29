'use client'
// src/app/[locale]/owner/calendar/page.tsx

import { use } from 'react'
import { Plus, Link2, Home, Car as CarIcon } from 'lucide-react'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { Button } from '@/components/owner/Button'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { DENSITY } from '@/lib/owner/theme'

export default function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const { palette } = useOwnerTheme()  // ✅ Fixed
  const t = palette
  const d = DENSITY.regular
  
  // TODO Supabase: pull live listings + their booking spans
  const listings = [
    { id: 1, title: 'Marina View Loft', kind: 'property', price: 650, status: 'live' },
    { id: 2, title: 'Palm Jumeirah Villa', kind: 'property', price: 890, status: 'live' },
    { id: 3, title: 'Downtown Penthouse', kind: 'property', price: 720, status: 'live' },
    { id: 4, title: 'Beach Apartment', kind: 'property', price: 580, status: 'live' },
    { id: 5, title: 'Range Rover Sport', kind: 'car', price: 920, status: 'live' },
    { id: 6, title: 'Mercedes G-Class', kind: 'car', price: 1200, status: 'live' },
  ]
  
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const today = 18
  const spans: Record<number, [number, number, string][]> = {
    1: [[16, 19, 'Marco R.'], [22, 24, 'James P.']],
    2: [[14, 21, 'Anna S.'], [27, 30, 'Family P.']],
    3: [[20, 22, 'Yuki T.']],
    4: [],
    5: [[19, 23, 'Olena K.']],
    6: [[17, 18, 'David W.'], [25, 28, 'Sophie L.']],
  }

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="Calendar"
        title="Calendar"
        sub="See every booking, block, and gap across all your listings in one view."
        actions={<>
          <Button variant="ghost" icon={Link2}>iCal sync</Button>
          <Button variant="primary" icon={Plus}>Block dates</Button>
        </>}
      />

      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, background: t.bg }}>
          <div style={{
            width: 200, padding: '12px 14px',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: t.textFaint,
            flexShrink: 0, borderRight: `1px solid ${t.border}`,
          }}>March 2026</div>
          <div style={{
            flex: 1, display: 'grid',
            gridTemplateColumns: `repeat(${days.length}, 1fr)`, overflow: 'hidden',
          }}>
            {days.map(day => (
              <div key={day} style={{
                padding: '10px 0', textAlign: 'center',
                fontFamily: 'var(--mono)', fontSize: 10,
                color: day === today ? t.accent : t.textFaint,
                fontWeight: day === today ? 700 : 500,
                background: day === today ? t.accentSoft : 'transparent',
                borderRight: `1px solid ${t.borderSoft}`,
              }}>{day}</div>
            ))}
          </div>
        </div>

        {listings.map((l, idx) => (
          <div key={l.id} style={{ display: 'flex', borderTop: idx === 0 ? 'none' : `1px solid ${t.borderSoft}` }}>
            <div style={{
              width: 200, padding: '14px 14px', flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {l.kind === 'car' ? <CarIcon size={14} color={t.textMuted} /> : <Home size={14} color={t.textMuted} />}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 600, color: t.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{l.title}</div>
                <div style={{ fontSize: 10, color: t.textFaint, fontFamily: 'var(--mono)' }}>
                  AED {l.price}/{l.kind === 'car' ? 'd' : 'n'}
                </div>
              </div>
            </div>
            <div style={{
              flex: 1, display: 'grid',
              gridTemplateColumns: `repeat(${days.length}, 1fr)`,
              position: 'relative', minHeight: 56,
            }}>
              {days.map(day => (
                <div key={day} style={{
                  borderRight: `1px solid ${t.borderSoft}`,
                  background: day === today ? t.accentSoft : 'transparent',
                }} />
              ))}
              {(spans[l.id] || []).map((sp, i) => {
                const [start, end, label] = sp
                const left = ((start - 1) / days.length) * 100
                const width = ((end - start + 1) / days.length) * 100
                return (
                  <div key={i} style={{
                    position: 'absolute', top: 10, bottom: 10,
                    left: `${left}%`, width: `${width}%`,
                    background: t.accent, color: t.accentInk,
                    borderRadius: 6, padding: '0 8px',
                    display: 'flex', alignItems: 'center',
                    fontSize: 11, fontWeight: 600,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>{label}</div>
                )
              })}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
