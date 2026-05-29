// ============================================
// Footer — Updated
// Path: src/components/Footer.tsx
// All links active + service provider link
// ============================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'en'

  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: '#0e1428',
      borderTop: '1px solid rgba(212,168,67,0.1)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#D4A843', fontStyle: 'italic', marginBottom: 10 }}>
              DREDOTT
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 240 }}>
              Curated stays and cars in Sharm El-Sheikh. Zero commission. Direct owner contact.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#D4A843', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 16 }}>
              Your dot on the Red Sea.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p style={colHead}>Explore</p>
            {[
              { label: 'Stays',      href: `/${locale}/properties` },
              { label: 'Cars',       href: `/${locale}/cars` },
              { label: 'Services',   href: `/${locale}/services` },
              { label: 'Blog',       href: `/${locale}/blog` },
              { label: 'Pricing',    href: `/${locale}/pricing` },
            ].map(l => <FooterLink key={l.label} {...l} />)}
          </div>

          {/* Owners */}
          <div>
            <p style={colHead}>For Owners</p>
            {[
              { label: 'List Your Property', href: `/${locale}/pricing` },
              { label: 'List Your Car',      href: `/${locale}/pricing` },
              { label: 'List Your Service',  href: `/${locale}/services/register` },
              { label: 'Owner Dashboard',    href: `/${locale}/owner` },
              { label: 'About',              href: `/${locale}/about` },
            ].map(l => <FooterLink key={l.label} {...l} />)}
          </div>

          {/* Legal */}
          <div>
            <p style={colHead}>Legal</p>
            {[
              { label: 'Privacy Policy', href: `/${locale}/privacy` },
              { label: 'Terms of Service', href: `/${locale}/terms` },
              { label: 'Contact Us',     href: `/${locale}/contact` },
            ].map(l => <FooterLink key={l.label} {...l} />)}

            <p style={{ ...colHead, marginTop: 20 }}>Languages</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {[
                { code: 'en', label: 'EN' },
                { code: 'ar', label: 'AR' },
                { code: 'ru', label: 'RU' },
                { code: 'uk', label: 'UA' },
                { code: 'de', label: 'DE' },
                { code: 'it', label: 'IT' },
              ].map(lang => {
                const currentPath = pathname.replace(`/${locale}`, '') || '/'
                return (
                  <Link key={lang.code} href={`/${lang.code}${currentPath}`}
                    style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: locale === lang.code ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.06)',
                      color: locale === lang.code ? '#D4A843' : 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      border: locale === lang.code ? '1px solid rgba(212,168,67,0.25)' : '1px solid transparent',
                    }}>
                    {lang.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © {year} DREDOTT. All rights reserved. Sharm El-Sheikh, Egypt.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
            Zero commission · Direct contact · 6 languages
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} style={{
      display: 'block', fontSize: 13,
      color: 'rgba(255,255,255,0.45)',
      textDecoration: 'none', marginBottom: 8,
      transition: 'color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = '#D4A843'}
    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
    >
      {label}
    </Link>
  )
}

const colHead: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.25em',
  textTransform: 'uppercase', color: '#D4A843',
  marginBottom: 14,
}