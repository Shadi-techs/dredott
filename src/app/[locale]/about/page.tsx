'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 80px' }}>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>
          — About DREDOTT
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: '#2C3A6B', lineHeight: 1.1, marginBottom: 32 }}>
          Your dot on the Red Sea.
        </h1>

        <div style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.9 }}>
          <p style={{ marginBottom: 20 }}>
            DREDOTT is a curated rental marketplace for properties and cars in Sharm El-Sheikh — built by people who actually live there. We know the neighborhoods, the compounds, the beach distances, and what makes a stay genuinely worth it.
          </p>
          <p style={{ marginBottom: 20 }}>
            Unlike platforms that charge owners a commission on every booking, DREDOTT works differently. Owners pay a simple annual subscription. Guests contact owners directly on WhatsApp. No middlemen. No percentage cuts. No algorithm deciding whose listing gets seen.
          </p>
          <p style={{ marginBottom: 32 }}>
            We started in Sharm El-Sheikh and are expanding across Egypt's coastal cities — wherever people go to escape, relax, and find their place by the sea.
          </p>

          <div style={{ background: '#0e1428', borderRadius: 20, padding: '28px 32px', marginBottom: 32 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#FBF0D0', marginBottom: 0, fontStyle: 'italic' }}>
              "We believe the best rental experience happens when owners and guests talk directly — no platform in the middle taking a cut."
            </p>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', marginBottom: 14 }}>What we offer</h2>
          {[
            '🏠 Curated property listings — studios, villas, chalets, penthouses',
            '🚗 Car rentals — from budget sedans to luxury transfers',
            '⭐ Verified service providers — restaurants, tours, legal, and more',
            '🌊 Red Sea Deals — limited-time offers from premium owners',
            '🔒 Zero commission — owners keep 100% of their rental income',
            '🌍 6 languages — Arabic, English, Russian, Ukrainian, German, Italian',
          ].map((item, i) => (
            <p key={i} style={{ marginBottom: 8 }}>{item}</p>
          ))}
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/en/properties')} style={{ padding: '12px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Browse Stays
          </button>
          <button onClick={() => router.push('/en/pricing')} style={{ padding: '12px 24px', background: 'transparent', color: '#2C3A6B', border: '1px solid rgba(44,58,107,0.2)', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>
            List Your Property
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}