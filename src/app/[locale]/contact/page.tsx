'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px 80px' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>
          — Get in Touch
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 400, color: '#2C3A6B', marginBottom: 32 }}>
          Contact Us
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'General enquiries', value: 'hello@dredott.com', href: 'mailto:hello@dredott.com' },
            { label: 'WhatsApp support', value: '+20 XXX XXX XXXX', href: 'https://wa.me/20XXXXXXXXXX' },
            { label: 'List your property', value: 'See our pricing →', href: '/en/pricing' },
            { label: 'List your service', value: 'Register as provider →', href: '/en/services/register' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <a href={item.href} style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B', textDecoration: 'none' }}>{item.value}</a>
            </div>
          ))}
        </div>

        <div style={{ background: '#0e1428', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Based in</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#FBF0D0' }}>Sharm El-Sheikh, Egypt</p>
          <p style={{ fontSize: 13, color: '#D4A843', marginTop: 4 }}>Red Sea · South Sinai</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}