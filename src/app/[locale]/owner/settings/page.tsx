'use client'
// src/app/[locale]/owner/settings/page.tsx

import { ChevronRight } from 'lucide-react'
import { useOwnerTheme } from '@/components/owner/ThemeProvider'
import { Card } from '@/components/owner/Card'
import { ScreenHeader } from '@/components/owner/ScreenHeader'

const sections = [
  { title: 'Account',          items: ['Profile information', 'Email & phone', 'Password & 2FA', 'Verified ID'] },
  { title: 'Payouts',          items: ['Bank accounts', 'Tax info', 'Invoice settings'] },
  { title: 'Listings defaults', items: ['House rules', 'Check-in instructions', 'Cancellation policy', 'Pricing rules'] },
  { title: 'Notifications',    items: ['Email digest', 'WhatsApp alerts', 'Marketing'] },
  { title: 'Danger zone',      items: ['Pause all listings', 'Close account'] },
]

export default function SettingsPage() {
  const { t, d } = useOwnerTheme()

  return (
    <div style={{ padding: d.pad, maxWidth: 800 }}>
      <ScreenHeader kicker="Settings" title="Settings"
                    sub="Manage your account, payouts, and listing defaults." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: d.gap }}>
        {sections.map((s, i) => (
          <Card key={i} padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: `14px ${d.pad}px`, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: t.text }}>
                {s.title}
              </div>
            </div>
            {s.items.map((it, j) => (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `13px ${d.pad}px`,
                borderTop: j === 0 ? 'none' : `1px solid ${t.borderSoft}`,
                cursor: 'pointer',
              }}>
                <span style={{
                  fontSize: 13.5,
                  color: s.title === 'Danger zone' ? t.danger : t.text,
                }}>{it}</span>
                <ChevronRight size={14} color={t.textFaint} />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  )
}
