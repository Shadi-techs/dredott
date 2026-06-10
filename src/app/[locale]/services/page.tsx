'use client'

import { useState, useEffect, use } from 'react'
import { Search, MapPin, Star, MessageCircle, ChevronRight, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ── i18n ─────────────────────────────────────────────────────────────────────
const TX: Record<string, {
  badge: string; h1: string; sub: string; placeholder: string
  allCats: string; allAreas: string; featured: string; all: string
  empty: string; emptySub: string; view: string; wa: string
  areas: Record<string, string>
}> = {
  en: {
    badge: 'Service Providers · Sharm El‑Sheikh',
    h1: 'Trusted Services on the Red Sea',
    sub: 'Verified providers for cleaning, maintenance, transfers and more',
    placeholder: 'Search services…', allCats: 'All', allAreas: 'All Areas',
    featured: 'Featured', all: 'All Providers',
    empty: 'No providers found', emptySub: 'Try a different filter',
    view: 'View', wa: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  ar: {
    badge: 'مزودو الخدمة · شرم الشيخ',
    h1: 'خدمات موثوقة على البحر الأحمر',
    sub: 'مزودون معتمدون للتنظيف والصيانة والنقل وأكثر',
    placeholder: 'ابحث عن خدمة…', allCats: 'الكل', allAreas: 'كل المناطق',
    featured: 'مميز', all: 'كل المزودين',
    empty: 'لا يوجد مزودو خدمة', emptySub: 'جرب فلتر مختلف',
    view: 'عرض', wa: 'واتساب',
    areas: { naama_bay: 'نعمة باي', sharks_bay: 'خليج الشارك', hadaba: 'الحدبة', om_el_seed: 'أم السيد' },
  },
  ru: {
    badge: 'Поставщики услуг · Шарм-эль-Шейх',
    h1: 'Проверенные услуги на Красном море',
    sub: 'Аккредитованные поставщики уборки, обслуживания и трансферов',
    placeholder: 'Найти услугу…', allCats: 'Все', allAreas: 'Все районы',
    featured: 'Рекомендуем', all: 'Все поставщики',
    empty: 'Ничего не найдено', emptySub: 'Попробуйте другой фильтр',
    view: 'Открыть', wa: 'WhatsApp',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Эль Сид' },
  },
  de: {
    badge: 'Dienstleister · Scharm el-Scheich',
    h1: 'Vertrauenswürdige Dienste am Roten Meer',
    sub: 'Geprüfte Anbieter für Reinigung, Wartung und Transfers',
    placeholder: 'Dienste suchen…', allCats: 'Alle', allAreas: 'Alle Gebiete',
    featured: 'Empfohlen', all: 'Alle Anbieter',
    empty: 'Keine Anbieter', emptySub: 'Anderen Filter versuchen',
    view: 'Ansehen', wa: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  it: {
    badge: 'Fornitori · Sharm El-Sheikh',
    h1: 'Servizi fidati sul Mar Rosso',
    sub: 'Fornitori verificati per pulizie, manutenzione e trasferimenti',
    placeholder: 'Cerca servizi…', allCats: 'Tutti', allAreas: 'Tutte le zone',
    featured: 'In evidenza', all: 'Tutti i fornitori',
    empty: 'Nessun fornitore', emptySub: 'Prova un altro filtro',
    view: 'Vedi', wa: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  uk: {
    badge: 'Постачальники · Шарм-ель-Шейх',
    h1: 'Перевірені послуги на Червоному морі',
    sub: 'Акредитовані постачальники прибирання, обслуговування та трансферів',
    placeholder: 'Пошук послуг…', allCats: 'Всі', allAreas: 'Всі райони',
    featured: 'Рекомендовано', all: 'Всі постачальники',
    empty: 'Нічого не знайдено', emptySub: 'Спробуйте інший фільтр',
    view: 'Переглянути', wa: 'WhatsApp',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Ель Сід' },
  },
}

const AREAS = ['naama_bay', 'sharks_bay', 'hadaba', 'om_el_seed']

// ─────────────────────────────────────────────────────────────────────────────
export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const tx   = TX[locale] || TX.en
  const isAr = locale === 'ar'

  const [categories, setCategories] = useState<any[]>([])
  const [providers, setProviders]   = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedCat, setSelectedCat]   = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [search, setSearch]             = useState('')

  useEffect(() => {
    fetch('/api/services/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ limit: '60' })
    if (selectedCat)  qs.set('category_id', selectedCat)
    if (selectedArea) qs.set('area', selectedArea)
    fetch(`/api/services?${qs}`)
      .then(r => r.json())
      .then(d => {
        setProviders([...(d.featured || []), ...(d.providers || [])])
        setLoading(false)
      })
  }, [selectedCat, selectedArea])

  const filtered = providers.filter(p => {
    if (!search) return true
    const name = (isAr ? p.business_name_ar : p.business_name) || p.business_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })
  const featuredList = filtered.filter(p => p.featured)
  const regularList  = filtered.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-[#FAF9F6]" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden flex items-center"
        style={{ background: 'linear-gradient(135deg, #0e1428 0%, #2C3A6B 60%, #1a2440 100%)' }}
      >
        {/* noise grain overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        {/* scrolling ticker at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-[rgba(14,20,40,0.7)] border-y border-[rgba(212,168,67,0.2)] py-3 overflow-hidden"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="flex whitespace-nowrap text-[11px] tracking-[0.3em] text-[#D4A843]" style={{ animation: 'marquee 25s linear infinite' }}>
            <span>CLEANING ✦ MAINTENANCE ✦ TRANSFERS ✦ PLUMBING ✦ AC REPAIR ✦ LAUNDRY ✦ SECURITY ✦ TRANSPORT ✦ </span>
            <span>CLEANING ✦ MAINTENANCE ✦ TRANSFERS ✦ PLUMBING ✦ AC REPAIR ✦ LAUNDRY ✦ SECURITY ✦ TRANSPORT ✦ </span>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full">
          <div className="text-[11px] tracking-[0.28em] text-[#D4A843] mb-5"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="inline-block w-1 h-1 rounded-full bg-[#D4A843] mr-3 align-middle" />
            {tx.badge}
            <span className="inline-block w-1 h-1 rounded-full bg-[#D4A843] ml-3 align-middle" />
          </div>

          <h1 className="text-5xl lg:text-7xl text-white leading-none mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
            {tx.h1.split(' on ')[0]}<br />
            <em className="text-[#D4A843]">{tx.h1.includes(' on ') ? 'on ' + tx.h1.split(' on ')[1] : ''}</em>
          </h1>

          <p className="text-white/60 text-base mb-10 max-w-lg">{tx.sub}</p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute top-1/2 -translate-y-1/2 text-[#9ca3af] w-4 h-4 pointer-events-none"
              style={{ [isAr ? 'right' : 'left']: 16 }} />
            <input
              type="text"
              placeholder={tx.placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-[rgba(212,168,67,0.25)] rounded-xl text-white placeholder-white/40 text-sm outline-none focus:border-[#D4A843] transition-colors"
              style={{ padding: isAr ? '13px 48px 13px 16px' : '13px 16px 13px 48px' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 p-1"
                style={{ [isAr ? 'left' : 'right']: 12 }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTERS ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[rgba(26,36,64,0.08)] sticky top-[64px] z-30">
        <div className="max-w-6xl mx-auto px-8 py-4">
          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCat === ''
                  ? 'bg-[#2C3A6B] text-[#D4A843] border-[#2C3A6B]'
                  : 'bg-white text-gray-500 border-[#e5e7eb] hover:border-[#2C3A6B] hover:text-[#2C3A6B]'
              }`}
            >
              {tx.allCats}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedCat === cat.id
                    ? 'bg-[#2C3A6B] text-[#D4A843] border-[#2C3A6B]'
                    : 'bg-white text-gray-500 border-[#e5e7eb] hover:border-[#2C3A6B] hover:text-[#2C3A6B]'
                }`}
              >
                {cat.icon} {isAr ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>

          {/* Area chips */}
          <div className="flex gap-2 flex-wrap mt-3">
            <button
              onClick={() => setSelectedArea('')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                selectedArea === ''
                  ? 'bg-[#D4A843] text-[#2C3A6B] border-[#D4A843]'
                  : 'bg-transparent text-gray-400 border-[#e5e7eb] hover:border-[#D4A843] hover:text-[#2C3A6B]'
              }`}
            >
              {tx.allAreas}
            </button>
            {AREAS.map(a => (
              <button
                key={a}
                onClick={() => setSelectedArea(a === selectedArea ? '' : a)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  selectedArea === a
                    ? 'bg-[#D4A843] text-[#2C3A6B] border-[#D4A843]'
                    : 'bg-transparent text-gray-400 border-[#e5e7eb] hover:border-[#D4A843] hover:text-[#2C3A6B]'
                }`}
              >
                {tx.areas[a] || a.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROVIDERS ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[rgba(26,36,64,0.08)] h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-6">🔍</p>
            <h3 className="text-3xl text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {tx.empty}
            </h3>
            <p className="text-gray-400 text-sm">{tx.emptySub}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredList.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[11px] tracking-[0.2em] text-[#B8860B]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    — {tx.featured.toUpperCase()}
                  </span>
                  <div className="flex-1 h-px bg-[rgba(212,168,67,0.2)]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredList.map((p, i) => (
                    <ProviderCard key={p.id} provider={p} index={i} locale={locale} isAr={isAr} tx={tx} featured />
                  ))}
                </div>
              </section>
            )}

            {/* All providers */}
            {regularList.length > 0 && (
              <section>
                {featuredList.length > 0 && (
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-[11px] tracking-[0.2em] text-gray-400"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      — {tx.all.toUpperCase()}
                    </span>
                    <div className="flex-1 h-px bg-[rgba(26,36,64,0.06)]" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularList.map((p, i) => (
                    <ProviderCard key={p.id} provider={p} index={i} locale={locale} isAr={isAr} tx={tx} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

// ── Provider Card — matches property/car card style ───────────────────────────
function ProviderCard({ provider: p, index, locale, isAr, tx, featured = false }: {
  provider: any; index: number; locale: string; isAr: boolean
  tx: typeof TX['en']; featured?: boolean
}) {
  const name    = (isAr ? p.business_name_ar : p.business_name) || p.business_name || ''
  const catName = isAr ? p.service_provider_categories?.name_ar : p.service_provider_categories?.name_en
  const icon    = p.service_provider_categories?.icon || '🏢'
  const reviews = p.google_reviews_cache
  const area    = p.area ? (tx.areas[p.area as keyof typeof tx.areas] || p.area.replace(/_/g, ' ')) : null

  return (
    <article
      className={`group cursor-pointer bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg relative
        ${featured
          ? 'border-2 border-[#D4A843]/40 hover:border-[#D4A843]'
          : 'border border-[rgba(26,36,64,0.08)] hover:border-[#2A9D8F]'
        }`}
      onClick={() => window.location.href = `/${locale}/services/${p.id}`}
    >
      {/* ── Photo / logo area ── */}
      <div className="relative h-48 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2440 0%, #2C3A6B 100%)' }}>

        {/* № badge */}
        <div className="absolute top-4 left-4 z-10 text-xs tracking-wider text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          № {String(index + 1).padStart(2, '0')}
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10 bg-[#D4A843] text-[#2C3A6B] text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ⭐ {tx.featured}
          </div>
        )}

        {/* Logo centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          {p.logo_url ? (
            <img
              src={p.logo_url}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
              {icon}
            </div>
          )}
        </div>

        {/* Category tag at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0e1428]/80 to-transparent px-4 py-3">
          <span className="text-[10px] tracking-[0.15em] text-[#D4A843] font-medium"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {icon} {catName?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        <h3 className="text-xl text-[#2C3A6B] mb-1 group-hover:text-[#2A9D8F] transition-colors leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {name}
        </h3>

        {/* Rating */}
        {reviews?.rating ? (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3 h-3"
                  fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                  color={i <= Math.round(reviews.rating) ? '#D4A843' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[#2C3A6B]">{reviews.rating}</span>
            <span className="text-xs text-gray-400">({reviews.total})</span>
          </div>
        ) : (
          <div className="mb-3" />
        )}

        {/* Area */}
        {area && (
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#B8860B]" />
            {area}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          {p.whatsapp && (
            <a
              href={`https://wa.me/${p.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#22c55e] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              <MessageCircle size={13} />
              {tx.wa}
            </a>
          )}
          <a
            href={`/${locale}/services/${p.id}`}
            onClick={e => e.stopPropagation()}
            className={`flex items-center justify-center gap-1 text-[#2C3A6B] hover:text-[#2A9D8F] text-xs font-semibold py-2.5 rounded-lg border border-[rgba(26,36,64,0.12)] hover:border-[#2A9D8F] transition-all ${p.whatsapp ? 'px-4' : 'flex-1'}`}
          >
            {tx.view}
            <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </article>
  )
}
