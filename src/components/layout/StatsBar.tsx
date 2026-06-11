// ============================================
// DredottSTAY — Layout Components
// StatsBar, WhyUs, FeaturedProperties
// ============================================

'use client'

import { useTranslations } from 'next-intl'
import { MapPin, MessageCircle, CheckCircle, Clock, Globe } from 'lucide-react'
import PropertyCard from '@/components/property/PropertyCard'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { Property } from '@/types'

// ---- STATS BAR ----
export function StatsBar() {
  const t = useTranslations('home')

  const stats = [
    { num: '50+', label: t('stats.properties') },
    { num: '4.9★', label: t('stats.rating') },
    { num: '1,200+', label: t('stats.guests') },
    { num: '24/7', label: t('stats.support') },
    { num: '5', label: t('stats.languages') },
  ]

  return (
    <div className="bg-[#2C3A6B] border-t-2 border-[#B8860B] py-3.5 px-6 flex justify-center gap-8 flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-[#D4A843] font-medium text-lg leading-none">{s.num}</div>
          <div className="text-[#A0A8B4] text-[11px] mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ---- FEATURED PROPERTIES ----
export function FeaturedProperties({ properties, locale }: { properties: Property[]; locale: string }) {
  const t = useTranslations('home')

  return (
    <section className="px-6 py-8 bg-[#FAF9F6]">
      <div className="flex items-center justify-between mb-5 max-w-6xl mx-auto">
        <h2 className="text-xl font-medium text-[#2C3A6B]">
          {t('featured')}{' '}
          <span className="text-[#B8860B]">{t('featuredHighlight')}</span>
        </h2>
        <Link
          href={`/${locale}/stays`}
          className="text-xs text-[#B8860B] underline underline-offset-2 hover:text-[#9A6E09]"
        >
          {t('viewAll')}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {properties.length > 0
          ? properties.map((p) => (
              <PropertyCard key={p.id} property={p} view="grid" />
            ))
          : // Placeholder cards when DB is empty
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-[130px] bg-[#1e3a5f]/30" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#D4A843]/20 rounded w-3/4" />
                  <div className="h-2.5 bg-[#D4A843]/15 rounded w-1/2" />
                  <div className="h-4 bg-[#D4A843]/20 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}

// ---- WHY US ----
export function WhyUs() {
  const t = useTranslations('home')

  const reasons = [
    {
      icon: <MapPin size={16} className="text-[#FFF8DC]" />,
      title: 'Prime locations',
      desc: 'Sea views, beach access, and city vibes in every area of Sharm.',
    },
    {
      icon: <MessageCircle size={16} className="text-[#FFF8DC]" />,
      title: 'WhatsApp support',
      desc: 'Personal confirmation and 24/7 support — in your language.',
    },
    {
      icon: <CheckCircle size={16} className="text-[#FFF8DC]" />,
      title: 'Verified properties',
      desc: 'Every listing is inspected and managed by our team.',
    },
    {
      icon: <Globe size={16} className="text-[#FFF8DC]" />,
      title: '5 languages',
      desc: 'We speak English, Arabic, Italian, Russian and German.',
    },
  ]

  return (
    <section className="bg-[#2C3A6B] px-6 py-9">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-medium text-[#FBF0D0] mb-1.5">
          {t('whyTitle')}{' '}
          <span className="text-[#D4A843]">{t('whyHighlight')}</span>
        </h2>
        <p className="text-[#A0A8B4] text-sm mb-6">{t('whySub')}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-white/6 rounded-xl p-4 border border-[#D4A843]/20"
            >
              <div className="w-8 h-8 rounded-lg bg-[#B8860B] flex items-center justify-center mb-3">
                {r.icon}
              </div>
              <div className="text-[#FBF0D0] text-sm font-medium mb-1.5">{r.title}</div>
              <div className="text-[#A0A8B4] text-xs leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
