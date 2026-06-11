'use client'

import { useState, useEffect, use } from 'react'
import { Search, MapPin, Star, MessageCircle, ChevronRight, X } from 'lucide-react'
import HeroAdBackground from '@/components/HeroAdBackground'
import { usePageFlag } from '@/lib/hooks/usePageFlag'

// ── i18n ─────────────────────────────────────────────────────────────────────
const TX: Record<string, {
  hero_tag: string; hero_title: string; hero_sub: string
  search_placeholder: string; all: string; all_areas: string
  featured_label: string; all_label: string
  empty: string; empty_sub: string; view: string; whatsapp: string
  areas: Record<string, string>
}> = {
  en: {
    hero_tag: 'SERVICE PROVIDERS · SHARM EL-SHEIKH',
    hero_title: 'Trusted Services on the Red Sea',
    hero_sub: 'VERIFIED · PROFESSIONAL · LOCAL',
    search_placeholder: 'Search services…',
    all: 'All', all_areas: 'All Areas',
    featured_label: 'Featured', all_label: 'All Providers',
    empty: 'No providers found', empty_sub: 'Try a different filter',
    view: 'View', whatsapp: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  ar: {
    hero_tag: 'مزودو الخدمة · شرم الشيخ',
    hero_title: 'خدمات موثوقة على البحر الأحمر',
    hero_sub: 'معتمدون · محترفون · محليون',
    search_placeholder: 'ابحث عن خدمة…',
    all: 'الكل', all_areas: 'كل المناطق',
    featured_label: 'مميز', all_label: 'كل المزودين',
    empty: 'لا يوجد مزودو خدمة', empty_sub: 'جرب فلتر مختلف',
    view: 'عرض', whatsapp: 'واتساب',
    areas: { naama_bay: 'نعمة باي', sharks_bay: 'خليج الشارك', hadaba: 'الحدبة', om_el_seed: 'أم السيد' },
  },
  ru: {
    hero_tag: 'ПОСТАВЩИКИ УСЛУГ · ШАРМ-ЭЛЬ-ШЕЙХ',
    hero_title: 'Проверенные услуги на Красном море',
    hero_sub: 'АККРЕДИТОВАННЫЕ · ПРОФЕССИОНАЛЬНЫЕ · МЕСТНЫЕ',
    search_placeholder: 'Найти услугу…',
    all: 'Все', all_areas: 'Все районы',
    featured_label: 'Рекомендуем', all_label: 'Все поставщики',
    empty: 'Ничего не найдено', empty_sub: 'Попробуйте другой фильтр',
    view: 'Открыть', whatsapp: 'WhatsApp',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Эль Сид' },
  },
  de: {
    hero_tag: 'DIENSTLEISTER · SCHARM EL-SCHEICH',
    hero_title: 'Vertrauenswürdige Dienste am Roten Meer',
    hero_sub: 'GEPRÜFT · PROFESSIONELL · LOKAL',
    search_placeholder: 'Dienste suchen…',
    all: 'Alle', all_areas: 'Alle Gebiete',
    featured_label: 'Empfohlen', all_label: 'Alle Anbieter',
    empty: 'Keine Anbieter', empty_sub: 'Anderen Filter versuchen',
    view: 'Ansehen', whatsapp: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  it: {
    hero_tag: 'FORNITORI · SHARM EL-SHEIKH',
    hero_title: 'Servizi fidati sul Mar Rosso',
    hero_sub: 'VERIFICATI · PROFESSIONALI · LOCALI',
    search_placeholder: 'Cerca servizi…',
    all: 'Tutti', all_areas: 'Tutte le zone',
    featured_label: 'In evidenza', all_label: 'Tutti i fornitori',
    empty: 'Nessun fornitore', empty_sub: 'Prova un altro filtro',
    view: 'Vedi', whatsapp: 'WhatsApp',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  uk: {
    hero_tag: 'ПОСТАЧАЛЬНИКИ ПОСЛУГ · ШАРМ-ЕЛЬ-ШЕЙХ',
    hero_title: 'Перевірені послуги на Червоному морі',
    hero_sub: 'АКРЕДИТОВАНІ · ПРОФЕСІЙНІ · МІСЦЕВІ',
    search_placeholder: 'Пошук послуг…',
    all: 'Всі', all_areas: 'Всі райони',
    featured_label: 'Рекомендовано', all_label: 'Всі постачальники',
    empty: 'Нічого не знайдено', empty_sub: 'Спробуйте інший фільтр',
    view: 'Переглянути', whatsapp: 'WhatsApp',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Ель Сід' },
  },
}

const AREAS = ['naama_bay', 'sharks_bay', 'hadaba', 'om_el_seed']

const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.25em',
  textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10,
}

const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} style={{
    padding: '6px 14px', borderRadius: 20, fontSize: 13,
    fontWeight: active ? 600 : 400, cursor: 'pointer',
    background: active ? '#2C3A6B' : '#f3f4f6',
    color: active ? '#D4A843' : '#555',
    border: active ? '1px solid #2C3A6B' : '1px solid transparent',
    whiteSpace: 'nowrap' as const,
  }}>
    {children}
  </button>
)

// ─────────────────────────────────────────────────────────────────────────────
export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const tx   = TX[locale] || TX.en
  const isRTL = locale === 'ar'

  const { enabled: pageEnabled, loading: flagLoading } = usePageFlag('module_services')

  const [categories, setCategories]     = useState<any[]>([])
  const [providers, setProviders]       = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedCat, setSelectedCat]   = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [search, setSearch]             = useState('')
  const [isMobile, setIsMobile]         = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
    const name = (isRTL ? p.business_name_ar : p.business_name) || p.business_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })
  const featuredList = filtered.filter(p => p.featured)
  const regularList  = filtered.filter(p => !p.featured)

  if (flagLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!pageEnabled) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', gap: 16, textAlign: 'center', padding: 32 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#2C3A6B' }}>🛠</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#2C3A6B', margin: 0 }}>Services — Coming Soon</h1>
      <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 400 }}>This section is currently unavailable. Please check back later or contact us on WhatsApp.</p>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} style={{ background: '#2A9D8F', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>WhatsApp Us</a>
    </div>
  )

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Hero — same structure as properties/cars ────────────────────── */}
      <div style={{ position: 'relative', paddingTop: 64, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0e1428 0%, #1a2c50 50%, #0d2b26 100%)', padding: '44px 24px 52px', position: 'relative' }}>
          <HeroAdBackground page="services" defaultImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=60" opacity={0.1} />
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: isRTL ? 'right' : 'left' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.26em', color: '#D4A843', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {tx.hero_tag}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 52px)', color: '#fff', margin: '0 0 10px', lineHeight: 1.1 }}>
              {tx.hero_title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '0.12em', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
              {tx.hero_sub}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar — same as properties/cars ─────────────────── */}
      <div style={{ position: 'sticky', top: 64, zIndex: 10, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>

        {/* Search row */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
            <Search size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tx.search_placeholder}
              style={{ width: '100%', padding: isRTL ? '11px 40px 11px 16px' : '11px 16px 11px 40px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Pill active={selectedCat === ''} onClick={() => setSelectedCat('')}>{tx.all}</Pill>
          {categories.map(cat => (
            <Pill key={cat.id} active={selectedCat === cat.id} onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}>
              {cat.icon} {isRTL ? cat.name_ar : cat.name_en}
            </Pill>
          ))}
        </div>

        {/* Area chips */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedArea('')}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontWeight: selectedArea === '' ? 600 : 400, background: selectedArea === '' ? '#D4A843' : 'transparent', color: selectedArea === '' ? '#2C3A6B' : '#9ca3af', border: `1px solid ${selectedArea === '' ? '#D4A843' : 'rgba(0,0,0,0.1)'}` }}>
            {tx.all_areas}
          </button>
          {AREAS.map(a => (
            <button key={a}
              onClick={() => setSelectedArea(a === selectedArea ? '' : a)}
              style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontWeight: selectedArea === a ? 600 : 400, background: selectedArea === a ? '#D4A843' : 'transparent', color: selectedArea === a ? '#2C3A6B' : '#9ca3af', border: `1px solid ${selectedArea === a ? '#D4A843' : 'rgba(0,0,0,0.1)'}` }}>
              📍 {tx.areas[a] || a.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 300, border: '1px solid rgba(0,0,0,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', marginBottom: 8 }}>{tx.empty}</h3>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>{tx.empty_sub}</p>
          </div>
        ) : (
          <>
            {featuredList.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <p style={{ ...labelStyle, marginBottom: 20 }}>— {tx.featured_label}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
                  {featuredList.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} locale={locale} isRTL={isRTL} tx={tx} featured />)}
                </div>
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '40px 0 0' }} />
              </div>
            )}
            {regularList.length > 0 && (
              <div>
                {featuredList.length > 0 && <p style={{ ...labelStyle, marginBottom: 20 }}>— {tx.all_label}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
                  {regularList.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} locale={locale} isRTL={isRTL} tx={tx} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}

// ── Card — same style as property/car cards ───────────────────────────────────
function ProviderCard({ provider: p, index, locale, isRTL, tx, featured = false }: {
  provider: any; index: number; locale: string; isRTL: boolean; tx: typeof TX['en']; featured?: boolean
}) {
  const name    = (isRTL ? p.business_name_ar : p.business_name) || p.business_name || ''
  const catName = (isRTL ? p.service_provider_categories?.name_ar : p.service_provider_categories?.name_en) || ''
  const icon    = p.service_provider_categories?.icon || '🏢'
  const reviews = p.google_reviews_cache
  const area    = p.area ? (tx.areas[p.area as keyof typeof tx.areas] || p.area.replace(/_/g, ' ')) : null

  return (
    <article
      style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
      onClick={() => window.location.href = `/${locale}/services/${p.id}`}
    >
      {/* Image / logo area */}
      <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg, #1a2440 0%, #2C3A6B 100%)', overflow: 'hidden' }}>
        {/* Featured badge */}
        {featured && (
          <div style={{ position: 'absolute', top: 10, [isRTL ? 'left' : 'right']: 10, zIndex: 2, background: '#D4A843', color: '#0e1428', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: "'JetBrains Mono', monospace" }}>
            ⭐ {tx.featured_label}
          </div>
        )}

        {/* Logo centered */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.logo_url ? (
            <img src={p.logo_url} alt={name} style={{ width: 76, height: 76, borderRadius: 18, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
          ) : (
            <div style={{ width: 76, height: 76, borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {icon}
            </div>
          )}
        </div>

        {/* Category tag bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(14,20,40,0.85))', padding: '20px 14px 10px' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: '#D4A843', fontFamily: "'JetBrains Mono', monospace" }}>
            {icon} {catName.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: 16 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#2C3A6B', marginBottom: 6, fontWeight: 400, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </h3>

        {/* Rating */}
        {reviews?.rating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'} color={i <= Math.round(reviews.rating) ? '#D4A843' : '#d1d5db'} />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B' }}>{reviews.rating}</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>({reviews.total})</span>
          </div>
        ) : <div style={{ marginBottom: 8 }} />}

        {/* Area */}
        {area && (
          <p style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
            <MapPin size={12} color="#D4A843" /> {area}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {p.whatsapp && (
            <a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 600, padding: '9px 12px', borderRadius: 10, textDecoration: 'none' }}>
              <MessageCircle size={13} /> {tx.whatsapp}
            </a>
          )}
          <a href={`/${locale}/services/${p.id}`} onClick={e => e.stopPropagation()}
            style={{ flex: p.whatsapp ? '0 0 auto' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#f3f4f6', color: '#2C3A6B', fontSize: 12, fontWeight: 600, padding: '9px 14px', borderRadius: 10, textDecoration: 'none' }}>
            {tx.view} <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </article>
  )
}
