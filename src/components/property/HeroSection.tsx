'use client'
// ============================================
// DredottSTAY — Hero Section
// Video background + search bar
// ============================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'

const AREAS = [
  { value: 'naama_bay', label: 'Naama Bay' },
  { value: 'sharks_bay', label: 'Sharks Bay' },
  { value: 'old_market', label: 'Old Market' },
  { value: 'ras_um_sid', label: 'Ras Um Sid' },
  { value: 'hadaba', label: 'Hadaba' },
  { value: 'montazah', label: 'Montazah' },
  { value: 'nabq', label: 'Nabq' },
]

export default function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations('home')
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [area, setArea] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    if (area) params.set('area', area)
    router.push(`/${locale}/properties?${params.toString()}`)
  }

  return (
    <section className="relative h-[520px] flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0a142d]/55" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a142d]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-[600px] mx-auto pb-10">
        {/* Eyebrow */}
        <p className="text-[#D4A843] text-xs tracking-[0.2em] mb-4 uppercase">
          {t('eyebrow')}
        </p>

        {/* Headline */}
        <h1 className="text-white font-medium leading-tight mb-3" style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}>
          {t('title')}{' '}
          <em className="not-italic text-[#D4A843]">{t('titleHighlight')}</em>
        </h1>

        {/* Subtitle */}
        <p className="text-white/70 text-sm mb-8 leading-relaxed max-w-[420px] mx-auto">
          {t('subtitle')}
        </p>

        {/* Search box */}
        <div className="bg-white/97 rounded-xl p-3 flex flex-col sm:flex-row gap-0 border border-[#D4A843] max-w-[580px] mx-auto">
          {/* Area */}
          <div className="flex flex-col flex-1 px-3 py-1 sm:border-r border-[#D4A843]/40">
            <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest mb-1">AREA</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="text-xs text-[#2C3A6B] bg-transparent border-none outline-none"
            >
              <option value="">All areas</option>
              {AREAS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Check-in */}
          <div className="flex flex-col flex-1 px-3 py-1 sm:border-r border-[#D4A843]/40">
            <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest mb-1">
              {t('searchCheckin').toUpperCase()}
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="text-xs text-[#2C3A6B] bg-transparent border-none outline-none"
            />
          </div>

          {/* Check-out */}
          <div className="flex flex-col flex-1 px-3 py-1 sm:border-r border-[#D4A843]/40">
            <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest mb-1">
              {t('searchCheckout').toUpperCase()}
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="text-xs text-[#2C3A6B] bg-transparent border-none outline-none"
            />
          </div>

          {/* Guests */}
          <div className="flex flex-col px-3 py-1 min-w-[90px]">
            <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest mb-1">
              {t('searchGuests').toUpperCase()}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="text-xs text-[#2C3A6B] bg-transparent border-none outline-none"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="mt-2 sm:mt-0 sm:ml-2 bg-[#B8860B] text-[#FFF8DC] rounded-lg px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 hover:bg-[#9A6E09] transition-colors self-end whitespace-nowrap"
          >
            <Search size={13} />
            {t('searchButton')}
          </button>
        </div>

        {/* Browse link */}
        <a
          href={`/${locale}/stays`}
          className="block mt-3.5 text-white/60 text-xs hover:text-white/90 transition-colors underline underline-offset-2"
        >
          {t('browseAll')}
        </a>
      </div>
    </section>
  )
}
