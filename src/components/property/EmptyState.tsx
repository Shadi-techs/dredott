'use client'
// ============================================
// DredottSTAY — Empty State
// Shows when no properties match filters
// Features: suggestions, notify me, whatsapp
// ============================================

import { useState } from 'react'
import Link from 'next/link'
import { Search, MessageCircle, Bell, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EmptyStateProps {
  searchParams: Record<string, string | undefined>
  locale: string
  onClear: () => void
}

const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay',
  sharks_bay: 'Sharks Bay',
  old_market: 'Old Market',
  ras_um_sid: 'Ras Um Sid',
  hadaba: 'Hadaba',
  montazah: 'Montazah',
  nabq: 'Nabq',
}

// Popular properties to suggest (in real app, fetched from DB)
const SUGGESTIONS = [
  { name: 'Naama Bay Apartment', area: 'Naama Bay', price: '$75', slug: 'naama-bay-apartment' },
  { name: 'Montazah Pool Apt', area: 'Montazah', price: '$80', slug: 'montazah-pool-apt' },
  { name: 'Garden View Apartment', area: 'Naama Bay', price: '$90', slug: 'garden-view-apartment' },
]

export default function EmptyState({ searchParams, locale, onClear }: EmptyStateProps) {
  const t = useTranslations('empty')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyPhone, setNotifyPhone] = useState('')
  const [notifySubmitted, setNotifySubmitted] = useState(false)

  // Build description of what was searched
  const areaLabel = searchParams.area ? AREA_LABELS[searchParams.area] : null
  const searchDescription = areaLabel
    ? `a ${searchParams.type || 'property'} in ${areaLabel}`
    : 'a property matching your search'

  const handleNotify = async () => {
    if (!notifyEmail && !notifyPhone) return
    // In real app: save to notify_me table in Supabase
    try {
      await fetch('/api/notify-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: notifyEmail,
          whatsapp: notifyPhone,
          area: searchParams.area,
          dates_from: searchParams.checkIn,
          dates_to: searchParams.checkOut,
        }),
      })
      setNotifySubmitted(true)
    } catch {
      setNotifySubmitted(true) // Show success anyway for UX
    }
  }

  return (
    <div className="bg-white border border-[#D4A843]/30 rounded-xl p-8 text-center">
      {/* Icon */}
      <div className="w-14 h-14 bg-[#FBF0D0] rounded-full flex items-center justify-center mx-auto mb-4">
        <Search size={24} className="text-[#B8860B]" />
      </div>

      {/* Title */}
      <h3 className="text-[#2C3A6B] font-medium text-lg mb-2">{t('title')}</h3>

      {/* Description */}
      <p className="text-[#A0A8B4] text-sm max-w-[340px] mx-auto mb-5 leading-relaxed">
        We don&apos;t have{' '}
        <span className="text-[#B8860B] font-medium">{searchDescription}</span>{' '}
        available right now — but we might have something just as good.
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center flex-wrap mb-6">
        <button onClick={onClear} className="btn-primary text-sm">
          {t('seeAll')}
        </button>
        <button onClick={onClear} className="btn-secondary text-sm">
          {t('clearFilters')}
        </button>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi, I'm looking for ${searchDescription}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-teal text-sm flex items-center gap-1.5"
        >
          <MessageCircle size={14} />
          {t('askWhatsApp')}
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-[#D4A843]/20 my-5" />

      {/* Suggestions */}
      <div className="text-left mb-5">
        <p className="section-label mb-3">{t('youMightLike')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/${locale}/properties/${s.slug}`}
              className="bg-[#FAF9F6] border border-[#D4A843]/30 rounded-xl overflow-hidden hover:border-[#B8860B] transition-colors text-left block"
            >
              <div className="h-[70px] bg-[#1e3a5f]" />
              <div className="p-2.5">
                <div className="text-xs font-medium text-[#2C3A6B] mb-0.5">{s.name}</div>
                <div className="text-xs text-[#2A9D8F] mb-1.5">{s.area}</div>
                <div className="text-sm font-medium text-[#B8860B]">{s.price} <span className="text-[10px] text-[#A0A8B4] font-normal">/ night</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Notify me */}
      <div className="bg-[#2C3A6B] rounded-xl p-4 text-left flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-8 h-8 rounded-lg bg-[#B8860B] flex items-center justify-center flex-shrink-0">
          <Bell size={15} className="text-[#FFF8DC]" />
        </div>
        <div className="flex-1">
          <div className="text-[#FBF0D0] text-sm font-medium mb-1">{t('notifyTitle')}</div>
          <div className="text-[#A0A8B4] text-xs mb-3">{t('notifySub')}</div>
          {notifySubmitted ? (
            <div className="flex items-center gap-2 text-[#2A9D8F] text-sm">
              <CheckCircle size={16} />
              We&apos;ll notify you as soon as something matching opens up!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg text-xs text-[#2C3A6B] bg-white outline-none border-none"
              />
              <input
                type="tel"
                value={notifyPhone}
                onChange={(e) => setNotifyPhone(e.target.value)}
                placeholder="WhatsApp number"
                className="flex-1 px-3 py-2 rounded-lg text-xs text-[#2C3A6B] bg-white outline-none border-none"
              />
              <button
                onClick={handleNotify}
                className="bg-[#B8860B] text-[#FFF8DC] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#9A6E09] transition-colors whitespace-nowrap"
              >
                {t('notifyBtn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
