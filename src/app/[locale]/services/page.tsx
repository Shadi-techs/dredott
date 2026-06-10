'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Phone, Star, ExternalLink,
  MessageCircle, ArrowRight, ChevronRight, X
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─── i18n ────────────────────────────────────────────────────────────────────
const TX: Record<string, {
  tagline: string; headline: string; sub: string
  searchPlaceholder: string; allCats: string; allAreas: string
  featured: string; allProviders: string; noResults: string; noResultsSub: string
  loading: string; view: string; whatsapp: string; providers: string
  areas: Record<string, string>
}> = {
  en: {
    tagline: 'Service Providers',
    headline: 'Trusted Services in Sharm El‑Sheikh',
    sub: 'Verified providers for cleaning, maintenance, transfers and more',
    searchPlaceholder: 'Search services…',
    allCats: 'All Services', allAreas: 'All Areas',
    featured: 'Featured', allProviders: 'All Providers',
    noResults: 'No providers found', noResultsSub: 'Try a different filter',
    loading: 'Loading…', view: 'View', whatsapp: 'WhatsApp', providers: 'providers',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  ar: {
    tagline: 'مزودو الخدمة',
    headline: 'خدمات موثوقة في شرم الشيخ',
    sub: 'مزودون معتمدون للتنظيف والصيانة والنقل وأكثر',
    searchPlaceholder: 'ابحث عن خدمة…',
    allCats: 'كل الخدمات', allAreas: 'كل المناطق',
    featured: 'مميز', allProviders: 'كل مزودي الخدمة',
    noResults: 'لا يوجد مزودو خدمة', noResultsSub: 'جرب فلتر مختلف',
    loading: 'جاري التحميل…', view: 'عرض', whatsapp: 'واتساب', providers: 'مزود',
    areas: { naama_bay: 'نعمة باي', sharks_bay: 'خليج الشارك', hadaba: 'الحدبة', om_el_seed: 'أم السيد' },
  },
  ru: {
    tagline: 'Поставщики услуг',
    headline: 'Проверенные услуги в Шарм-эль-Шейхе',
    sub: 'Аккредитованные поставщики уборки, обслуживания, трансферов и многого другого',
    searchPlaceholder: 'Найти услугу…',
    allCats: 'Все услуги', allAreas: 'Все районы',
    featured: 'Рекомендуем', allProviders: 'Все поставщики',
    noResults: 'Ничего не найдено', noResultsSub: 'Попробуйте другой фильтр',
    loading: 'Загрузка…', view: 'Открыть', whatsapp: 'WhatsApp', providers: 'поставщики',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Эль Сид' },
  },
  de: {
    tagline: 'Dienstleister',
    headline: 'Vertrauenswürdige Dienste in Scharm el-Scheich',
    sub: 'Geprüfte Anbieter für Reinigung, Wartung, Transfers und mehr',
    searchPlaceholder: 'Dienste suchen…',
    allCats: 'Alle Dienste', allAreas: 'Alle Gebiete',
    featured: 'Empfohlen', allProviders: 'Alle Anbieter',
    noResults: 'Keine Anbieter gefunden', noResultsSub: 'Anderen Filter versuchen',
    loading: 'Laden…', view: 'Anzeigen', whatsapp: 'WhatsApp', providers: 'Anbieter',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  it: {
    tagline: 'Fornitori di servizi',
    headline: 'Servizi fidati a Sharm El-Sheikh',
    sub: 'Fornitori verificati per pulizie, manutenzione, trasferimenti e altro',
    searchPlaceholder: 'Cerca servizi…',
    allCats: 'Tutti i servizi', allAreas: 'Tutte le zone',
    featured: 'In evidenza', allProviders: 'Tutti i fornitori',
    noResults: 'Nessun fornitore trovato', noResultsSub: 'Prova un filtro diverso',
    loading: 'Caricamento…', view: 'Vedi', whatsapp: 'WhatsApp', providers: 'fornitori',
    areas: { naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', hadaba: 'Hadaba', om_el_seed: 'Om El Seed' },
  },
  uk: {
    tagline: 'Постачальники послуг',
    headline: 'Перевірені послуги в Шарм-ель-Шейху',
    sub: 'Акредитовані постачальники прибирання, обслуговування та трансферів',
    searchPlaceholder: 'Пошук послуг…',
    allCats: 'Всі послуги', allAreas: 'Всі райони',
    featured: 'Рекомендовано', allProviders: 'Всі постачальники',
    noResults: 'Нічого не знайдено', noResultsSub: 'Спробуйте інший фільтр',
    loading: 'Завантаження…', view: 'Переглянути', whatsapp: 'WhatsApp', providers: 'постачальники',
    areas: { naama_bay: 'Наама Бей', sharks_bay: 'Шаркс Бей', hadaba: 'Хадаба', om_el_seed: 'Ом Ель Сід' },
  },
}

const AREAS = ['naama_bay', 'sharks_bay', 'hadaba', 'om_el_seed']

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const tx         = TX[locale] || TX.en
  const isAr       = locale === 'ar'
  const router     = useRouter()

  const [categories, setCategories] = useState<any[]>([])
  const [providers, setProviders]   = useState<any[]>([])
  const [counts, setCounts]         = useState<Record<string, number>>({})
  const [loading, setLoading]       = useState(true)
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [search, setSearch]         = useState('')
  const searchRef                   = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchProviders() }, [selectedCat, selectedArea])

  async function fetchCategories() {
    const res  = await fetch('/api/services/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  async function fetchProviders() {
    setLoading(true)
    const qs = new URLSearchParams({ limit: '60' })
    if (selectedCat)  qs.set('category_id', selectedCat)
    if (selectedArea) qs.set('area', selectedArea)
    const res  = await fetch(`/api/services?${qs}`)
    const data = await res.json()
    const all  = [...(data.featured || []), ...(data.providers || [])]
    setProviders(all)
    // build counts per category from full result (unfiltered cat)
    if (!selectedCat) {
      const c: Record<string, number> = {}
      all.forEach(p => { if (p.category_id) c[p.category_id] = (c[p.category_id] || 0) + 1 })
      setCounts(c)
    }
    setLoading(false)
  }

  const filtered = providers.filter(p => {
    if (!search) return true
    const name = (isAr ? p.business_name_ar : p.business_name) || p.business_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const featuredList = filtered.filter(p => p.featured)
  const regularList  = filtered.filter(p => !p.featured)

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #0e1428 0%, #2C3A6B 55%, #1a3a5c 100%)',
        padding: '80px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: isAr ? 'auto' : -80, left: isAr ? -80 : 'auto', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(212,168,67,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: isAr ? 'auto' : -40, left: isAr ? -40 : 'auto', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(212,168,67,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#D4A843', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>
            — {tx.tagline}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, color: '#FAF9F6', lineHeight: 1.15, marginBottom: 10, maxWidth: 620 }}>
            {tx.headline}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(201,206,221,0.7)', marginBottom: 32, maxWidth: 480 }}>
            {tx.sub}
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <Search style={{
              position: 'absolute',
              top: '50%', transform: 'translateY(-50%)',
              [isAr ? 'right' : 'left']: 16,
              color: '#9ca3af', width: 16, height: 16, pointerEvents: 'none',
            }} />
            <input
              ref={searchRef}
              type="text"
              placeholder={tx.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: isAr ? '13px 48px 13px 16px' : '13px 16px 13px 48px',
                borderRadius: 12, border: '1.5px solid rgba(212,168,67,0.25)',
                fontSize: 14, background: 'rgba(255,255,255,0.05)',
                color: '#fff', outline: 'none', backdropFilter: 'blur(8px)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,168,67,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(212,168,67,0.25)'}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [isAr ? 'left' : 'right']: 14,
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4,
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY GRID ─────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e4de' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* All button */}
            <CategoryChip
              active={selectedCat === ''}
              onClick={() => setSelectedCat('')}
              icon="✦"
              label={tx.allCats}
            />
            {categories.map(cat => (
              <CategoryChip
                key={cat.id}
                active={selectedCat === cat.id}
                onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}
                icon={cat.icon}
                label={isAr ? cat.name_ar : cat.name_en}
                count={counts[cat.id]}
              />
            ))}
          </div>

          {/* Area filter */}
          {selectedCat === '' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedArea('')}
                style={{
                  padding: '4px 12px', borderRadius: 100, fontSize: 11, border: '1px solid',
                  cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                  background: selectedArea === '' ? '#D4A843' : 'transparent',
                  color: selectedArea === '' ? '#2C3A6B' : '#9ca3af',
                  borderColor: selectedArea === '' ? '#D4A843' : '#e0dbd4',
                }}>
                {tx.allAreas}
              </button>
              {AREAS.map(a => (
                <button key={a} onClick={() => setSelectedArea(a === selectedArea ? '' : a)} style={{
                  padding: '4px 12px', borderRadius: 100, fontSize: 11, border: '1px solid',
                  cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                  background: selectedArea === a ? '#D4A843' : 'transparent',
                  color: selectedArea === a ? '#2C3A6B' : '#9ca3af',
                  borderColor: selectedArea === a ? '#D4A843' : '#e0dbd4',
                }}>
                  {tx.areas[a] || a}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PROVIDERS ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e8e4de', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13 }}>{tx.loading}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#2C3A6B', marginBottom: 8 }}>{tx.noResults}</p>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>{tx.noResultsSub}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredList.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <SectionLabel label={tx.featured} gold />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 20,
                }}>
                  {featuredList.map(p => (
                    <ProviderCard key={p.id} provider={p} locale={locale} isAr={isAr} tx={tx} featured />
                  ))}
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #e8e4de 30%, #e8e4de 70%, transparent)', marginTop: 48 }} />
              </section>
            )}

            {/* Regular */}
            {regularList.length > 0 && (
              <section>
                {featuredList.length > 0 && <SectionLabel label={tx.allProviders} />}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 20,
                }}>
                  {regularList.map(p => (
                    <ProviderCard key={p.id} provider={p} locale={locale} isAr={isAr} tx={tx} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 640px) {
          .provider-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Category Chip ────────────────────────────────────────────────────────────
function CategoryChip({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: string; label: string; count?: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 16px', borderRadius: 100,
        fontSize: 13, fontWeight: active ? 600 : 400,
        border: `1.5px solid ${active ? '#2C3A6B' : '#e0dbd4'}`,
        background: active ? '#2C3A6B' : '#fff',
        color: active ? '#D4A843' : '#555',
        cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600,
          background: active ? 'rgba(212,168,67,0.2)' : '#f3f4f6',
          color: active ? '#D4A843' : '#9ca3af',
          padding: '1px 6px', borderRadius: 100,
        }}>{count}</span>
      )}
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <span style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
        color: gold ? '#D4A843' : '#9ca3af',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: gold ? 'rgba(212,168,67,0.2)' : '#e8e4de' }} />
    </div>
  )
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({ provider: p, locale, isAr, tx, featured = false }: {
  provider: any; locale: string; isAr: boolean; tx: typeof TX['en']; featured?: boolean
}) {
  const name    = (isAr ? p.business_name_ar : p.business_name) || p.business_name || ''
  const catName = isAr ? p.service_provider_categories?.name_ar : p.service_provider_categories?.name_en
  const icon    = p.service_provider_categories?.icon || '🏢'
  const reviews = p.google_reviews_cache
  const area    = p.area ? (tx.areas[p.area as keyof typeof tx.areas] || p.area.replace('_', ' ')) : null

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${featured ? 'rgba(212,168,67,0.5)' : '#e8e4de'}`,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = '0 12px 32px rgba(44,58,107,0.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
      onClick={() => window.location.href = `/${locale}/services/${p.id}`}
    >
      {/* ── Card Header ── */}
      <div style={{
        height: 88,
        background: 'linear-gradient(135deg, #0e1428 0%, #2C3A6B 60%, #1a3a5c 100%)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Featured badge */}
        {featured && (
          <div style={{
            position: 'absolute', top: 12,
            [isAr ? 'left' : 'right']: 12,
            background: '#D4A843', color: '#0e1428',
            fontSize: 9, fontWeight: 800,
            padding: '3px 10px', borderRadius: 100,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            ⭐ {tx.featured}
          </div>
        )}

        {/* Category tag */}
        <div style={{
          position: 'absolute', top: 12,
          [isAr ? 'right' : 'left']: 12,
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(201,206,221,0.8)',
          fontSize: 10, fontWeight: 500,
          padding: '3px 10px', borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)',
        }}>
          {icon} {catName}
        </div>

        {/* Logo — overlaps bottom edge */}
        <div style={{
          position: 'absolute', bottom: -20,
          [isAr ? 'right' : 'left']: 20,
          width: 48, height: 48,
          borderRadius: 12,
          background: '#fff',
          border: '2px solid #e8e4de',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          {p.logo_url
            ? <img src={p.logo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
            : icon
          }
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: '28px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Name */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20, fontWeight: 600,
          color: '#2C3A6B', lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {name}
        </h3>

        {/* Rating */}
        {reviews?.rating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12}
                  fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'}
                  color={i <= Math.round(reviews.rating) ? '#D4A843' : '#d1d5db'}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3A6B' }}>{reviews.rating}</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>({reviews.total})</span>
            <span style={{ fontSize: 10, color: '#d1d5db', marginLeft: 2 }}>Google</span>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }} />
        )}

        {/* Area */}
        {area && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#6b7280', marginBottom: 16,
          }}>
            <MapPin size={12} color="#D4A843" />
            {area}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          {p.whatsapp && (
            <a
              href={`https://wa.me/${p.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#25D366', color: '#fff',
                fontSize: 13, fontWeight: 600,
                padding: '10px 14px', borderRadius: 10,
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
            >
              <MessageCircle size={14} />
              {tx.whatsapp}
            </a>
          )}
          <a
            href={`/${locale}/services/${p.id}`}
            onClick={e => e.stopPropagation()}
            style={{
              flex: p.whatsapp ? '0 0 auto' : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: 'transparent', color: '#2C3A6B',
              fontSize: 13, fontWeight: 600,
              padding: '10px 16px', borderRadius: 10,
              border: '1.5px solid #e0dbd4',
              textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#2C3A6B' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#e0dbd4' }}
          >
            {tx.view}
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
