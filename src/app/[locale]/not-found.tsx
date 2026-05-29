// ============================================
// 404 Not Found Page
// Path: src/app/[locale]/not-found.tsx
// ============================================

import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e1428',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <svg width="48" height="38" viewBox="0 0 36 28" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
            <line x1="2" y1="18" x2="34" y2="18" stroke="rgba(212,168,67,0.35)" strokeWidth="0.8"/>
            <path d="M2 21 Q9 23 18 21 Q27 19 34 21" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.7"/>
            <circle cx="18" cy="13" r="5" fill="#D4A843"/>
          </svg>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18, color: '#FBF0D0',
            fontWeight: 600, letterSpacing: '0.05em',
          }}>DREDOTT</p>
        </div>

        {/* 404 */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 120, color: 'rgba(212,168,67,0.15)',
          fontWeight: 400, lineHeight: 1,
          marginBottom: 0,
        }}>404</p>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36, color: '#FBF0D0',
          fontWeight: 400, marginBottom: 16, marginTop: -20,
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7, marginBottom: 36,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/en" style={{
            padding: '12px 28px',
            background: '#D4A843', color: '#0e1428',
            borderRadius: 12, fontWeight: 700,
            fontSize: 14, textDecoration: 'none',
          }}>
            Go home
          </Link>
          <Link href="/en/properties" style={{
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(212,168,67,0.2)',
            color: '#FBF0D0',
            borderRadius: 12, fontWeight: 500,
            fontSize: 14, textDecoration: 'none',
          }}>
            Browse stays
          </Link>
        </div>

        <p style={{
          marginTop: 48, fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
        }}>
          Red Sea · Sharm El-Sheikh · Egypt
        </p>
      </div>
    </div>
  )
}