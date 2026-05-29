// ============================================
// Maintenance Page
// Path: src/app/maintenance/page.tsx
// Shown when maintenance_mode flag = true
// ============================================

export default function MaintenancePage() {
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
      <div style={{ maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <svg width="56" height="44" viewBox="0 0 36 28" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
            <line x1="2" y1="18" x2="34" y2="18" stroke="rgba(212,168,67,0.35)" strokeWidth="0.8"/>
            <path d="M2 21 Q9 23 18 21 Q27 19 34 21" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.7"/>
            <circle cx="18" cy="13" r="5" fill="#D4A843"/>
          </svg>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, color: '#FBF0D0',
            fontWeight: 600, letterSpacing: '0.08em',
          }}>DREDOTT</p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, color: '#D4A843',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            opacity: 0.7, marginTop: 4,
          }}>Red Sea · Stays</p>
        </div>

        {/* Icon */}
        <div style={{
          width: 80, height: 80,
          background: 'rgba(212,168,67,0.08)',
          border: '1px solid rgba(212,168,67,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: 36,
        }}>
          🔧
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 42, color: '#FBF0D0',
          fontWeight: 400, marginBottom: 16, lineHeight: 1.1,
        }}>
          We'll be right back
        </h1>

        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.8, marginBottom: 48, maxWidth: 380, margin: '0 auto 48px',
        }}>
          We're making some improvements to give you a better experience.
          Check back soon.
        </p>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.2), transparent)',
          marginBottom: 36,
        }} />

        {/* Contact */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.35)',
          marginBottom: 16,
        }}>
          Need help? Reach us on WhatsApp
        </p>
        <a
          href="https://wa.me/201200481043"
          target="_blank"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px',
            background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.25)',
            borderRadius: 10, color: '#25D366',
            fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.45 1.32 4.94L2 22l5.27-1.38a9.94 9.94 0 004.77 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0012.04 2z"/>
          </svg>
          WhatsApp us
        </a>

        <p style={{
          marginTop: 48, fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)',
          textTransform: 'uppercase',
        }}>
          Sharm El-Sheikh · Red Sea · Egypt
        </p>
      </div>
    </div>
  )
}