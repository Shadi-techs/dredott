'use client'
// src/app/[locale]/owner/analytics/page.tsx

import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { ScreenHeader } from '@/components/owner/ScreenHeader'
import { KpiCard } from '@/components/owner/KpiCard'
const dummySpark = [45, 52, 48, 61, 55, 67, 58, 72, 65, 78, 71, 82, 76, 88, 81, 92, 85, 95, 89, 98]


export default function AnalyticsPage() {
  const { t, d } = useOwnerTheme()
  // TODO Supabase: 12-month booking counts
  const monthly = [12, 19, 15, 22, 24, 28, 32, 30, 35, 41, 38, 45]
  const max = Math.max(...monthly)

  // TODO Supabase: aggregate by referrer/source on session events
  const sources = [
    { src: 'Organic search', pct: 42, count: 5230 },
    { src: 'Direct',         pct: 28, count: 3490 },
    { src: 'Featured',       pct: 18, count: 2240 },
    { src: 'Flash deals',    pct: 8,  count: 996  },
    { src: 'Referral',       pct: 4,  count: 527  },
  ]

  return (
    <div style={{ padding: d.pad }}>
      <ScreenHeader
        kicker="Premium · Analytics"
        title="Performance"
        sub="Where bookings come from, how listings convert, and what's trending."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: d.gap, marginBottom: d.gap }}>
        <KpiCard label="Conversion"     value="4.8%"   delta={+1.2}  sparkData={dummySpark.slice(8)}             color={t.accent}  />
        <KpiCard label="Avg session"    value="3m 42s" delta={+8.4}  sparkData={dummySpark.slice(5)}             color={t.accent}  />
        <KpiCard label="Repeat guests"  value="31%"    delta={+4.0}  sparkData={dummySpark.slice(0, 20)}         color={t.success} />
        <KpiCard label="Response time"  value="11 min" delta={-22.0} sparkData={dummySpark.slice(0, 18).reverse()} color={t.success} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: d.gap }}>
        <Card>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 4,
          }}>Bookings · 12 months</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: t.text, marginBottom: 16,
          }}>Year in bookings</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {monthly.map((v, i) => {
              const h = (v / max) * 100
              const isPeak = v === max
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 8, height: '100%',
                }}>
                  <div style={{
                    flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      width: '100%', height: `${h}%`,
                      background: isPeak ? t.accent : t.accentSoft,
                      borderRadius: '4px 4px 0 0',
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: t.textFaint, fontFamily: 'var(--mono)' }}>
                    {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: t.textFaint, marginBottom: 4,
          }}>Where they come from</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: t.text, marginBottom: 16,
          }}>Traffic sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sources.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: t.text, fontWeight: 500 }}>{s.src}</span>
                  <span style={{ color: t.textMuted, fontFamily: 'var(--mono)' }}>
                    {s.count.toLocaleString()} · {s.pct}%
                  </span>
                </div>
                <div style={{ height: 5, background: t.borderSoft, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${s.pct}%`,
                    background: i === 0 ? t.accent : i === 1 ? t.success : t.textFaint,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
