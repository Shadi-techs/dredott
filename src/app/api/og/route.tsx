// ============================================
// Dynamic OG Image Generator
// GET /api/og?title=...&sub=...&type=default|stays|cars|property
// Used as fallback og:image for social sharing
// ============================================

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'DREDOTT'
  const sub   = searchParams.get('sub')   || 'Stays · Cars · Services · Sharm El-Sheikh'
  const type  = searchParams.get('type')  || 'default'

  const accent = '#D4A843'
  const navy   = '#0e1428'
  const light  = '#FBF0D0'

  const emojiMap: Record<string, string> = {
    stays:    '🏠',
    cars:     '🚗',
    services: '⭐',
    property: '🏠',
    car:      '🚗',
    default:  '🌊',
  }
  const emoji = emojiMap[type] || '🌊'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: navy,
          padding: '48px 56px',
          fontFamily: 'serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 32, background: accent, borderRadius: 2 }} />
          <span style={{ color: accent, fontSize: 14, letterSpacing: '0.3em', fontFamily: 'monospace' }}>
            DREDOTT · SHARM EL SHEIKH · EGYPT
          </span>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 80 }}>{emoji}</div>
          <div style={{
            fontSize: title.length > 40 ? 42 : 56,
            fontWeight: 700,
            color: light,
            lineHeight: 1.1,
            maxWidth: 900,
          }}>
            {title}
          </div>
          <div style={{ fontSize: 24, color: accent, opacity: 0.85, marginTop: 4 }}>
            {sub}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {['No Commission', 'Direct WhatsApp', 'Verified Listings'].map(tag => (
              <div key={tag} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(251,240,208,0.5)',
                fontSize: 14,
              }}>
                <span style={{ color: '#4ade80', fontSize: 16 }}>✓</span> {tag}
              </div>
            ))}
          </div>
          <div style={{
            background: accent,
            color: navy,
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}>
            dredott.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
