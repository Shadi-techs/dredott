'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function CookieBanner() {
  const locale = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ws_cookie_consent')
    if (!consent) setTimeout(() => setVisible(true), 1500)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2C3A6B] border-t-2 border-[#B8860B] px-5 py-4 flex flex-col sm:flex-row items-start gap-4">
      <div className="flex-1">
        <div className="text-[#FBF0D0] text-sm font-medium mb-1">We use cookies to improve your experience</div>
        <div className="text-[#A0A8B4] text-xs leading-relaxed">
          We use cookies and Facebook Pixel to personalise content and analyse traffic.{' '}
          <Link href={`/${locale}/privacy`} className="text-[#D4A843] underline">Privacy Policy</Link>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => { localStorage.setItem('ws_cookie_consent', 'declined'); setVisible(false) }}
          className="text-[#A0A8B4] border border-[#A0A8B4]/40 text-xs px-3 py-2 rounded-lg">
          Decline
        </button>
        <button onClick={() => { localStorage.setItem('ws_cookie_consent', 'accepted'); setVisible(false) }}
          className="bg-[#B8860B] text-[#FFF8DC] text-xs font-medium px-3 py-2 rounded-lg">
          Accept all
        </button>
      </div>
    </div>
  )
}