// ============================================
// Wassim Banner Component
// Path: src/components/owner/WassimBanner.tsx
// Static banner — always visible to ALL owners
// regardless of plan type
// ============================================

'use client'

import { useState } from 'react'
import { Scale, X, MessageCircle } from 'lucide-react'

export default function WassimBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const handleContact = () => {
    const msg = encodeURIComponent(
      'Hello Wassim, I found your contact through DREDOTT. I need legal assistance regarding my rental property.'
    )
    window.open(`https://wa.me/20XXXXXXXXXX?text=${msg}`, '_blank')
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0e1428, #1a2240)',
      border: '1px solid rgba(212,168,67,0.2)',
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', alignItems: 'center',
      gap: 16, position: 'relative',
      marginBottom: 20,
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(212,168,67,0.1)',
        border: '1px solid rgba(212,168,67,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Scale size={20} color="#D4A843" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#FBF0D0', marginBottom: 2 }}>
          Wassim Abdelsalam — Licensed Lawyer
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Rental disputes · Contract review · Tenant issues · Arabic & English
        </p>
      </div>

      {/* CTA */}
      <button onClick={handleContact} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', background: '#25D366',
        color: '#fff', border: 'none', borderRadius: 10,
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        flexShrink: 0,
      }}>
        <MessageCircle size={14} /> 1hr · $50
      </button>

      {/* Dismiss */}
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.3)', padding: 4,
      }}>
        <X size={14} />
      </button>
    </div>
  )
}