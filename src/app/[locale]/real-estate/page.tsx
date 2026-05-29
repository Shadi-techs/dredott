// ============================================
// Real Estate Listings Page
// Path: src/app/[locale]/real-estate/page.tsx
// Feature flag controlled — hidden by default
// Commission model: 2.5% from buyer
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { MapPin, Bed, Maximize2, Search, SlidersHorizontal, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CitySelector from '@/components/CitySelector'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PROPERTY_TYPES = [
  { id: 'apartment',  label: 'Apartment', emoji: '🏢' },
  { id: 'villa',      label: 'Villa',     emoji: '🏡' },
  { id: 'studio',     label: 'Studio',    emoji: '🛏' },
  { id: 'chalet',     label: 'Chalet',    emoji: '⛺' },
  { id: 'penthouse',  label: 'Penthouse', emoji: '🌇' },
  { id: 'land',       label: 'Land',      emoji: '🌿' },
  { id: 'commercial', label: 'Commercial',emoji: '🏗️' },
]

export default function RealEstatePage() {
  const router = useRouter()
  const [listings, setListings]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedCity, setSelectedCity] = useState('sharm')
  const [search, setSearch]       = useState('')
  const [type, setType]           = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice]   = useState(0)
  const [maxPrice, setMaxPrice]   = useState(0)
  const [currency, setCurrency]   = useState('EGP')

  useEffect(() => { fetchListings() }, [selectedCity])

  const fetchListings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('real_estate_listings')
      .select('*')
      .eq('review_status', 'approved')
      .eq('status', 'available')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l => {
    if (type && l.property_type !== type) return false
    if (search && !l.title?.toLowerCase().includes(search.toLowerCase()) && !l.area?.toLowerCase().includes(search.toLowerCase())) return false
    if (minPrice > 0 && l.price < minPrice) return false
    if (maxPrice > 0 && l.price > maxPrice) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', paddingTop: 70 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 0' }}>
          <CitySelector selectedCity={selectedCity} onChange={setSelectedCity} variant="pills" />
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 14px', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or area…"
              style={{ width: '100%', padding: '11px 16px 11px 40px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' as const }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: showFilters ? '#2C3A6B' : '#f9fafb',
            color: showFilters ? '#D4A843' : '#555',
            border: `1px solid ${showFilters ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12, fontSize: 13, cursor: 'pointer',
          }}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '16px 24px 20px', background: '#fff' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'start' }}>
              <div>
                <p style={labelStyle}>Property Type</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(type === t.id ? '' : t.id)} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      background: type === t.id ? '#2C3A6B' : '#f3f4f6',
                      color: type === t.id ? '#D4A843' : '#555',
                      border: type === t.id ? '1px solid #2C3A6B' : '1px solid transparent',
                    }}>{t.emoji} {t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={labelStyle}>Currency</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['EGP', 'USD', 'EUR'].map(c => (
                    <button key={c} onClick={() => setCurrency(c)} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      background: currency === c ? '#2C3A6B' : '#f3f4f6',
                      color: currency === c ? '#D4A843' : '#555',
                      border: currency === c ? '1px solid #2C3A6B' : '1px solid transparent',
                    }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={labelStyle}>Price Range ({currency})</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" value={minPrice || ''} onChange={e => setMinPrice(Number(e.target.value))} placeholder="Min" style={{ width: 100, padding: '7px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 12, outline: 'none', color: '#2C3A6B' }} />
                  <span style={{ color: '#9ca3af' }}>—</span>
                  <input type="number" value={maxPrice || ''} onChange={e => setMaxPrice(Number(e.target.value))} placeholder="Max" style={{ width: 100, padding: '7px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 12, outline: 'none', color: '#2C3A6B' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* Commission notice */}
        <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <p style={{ fontSize: 13, color: '#92400e' }}>
            <strong>For real estate sales</strong> — 2.5% commission from buyer only. Seller lists for free. Handled by licensed agent Wassim Abdelsalam.
          </p>
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          <strong style={{ color: '#2C3A6B' }}>{filtered.length}</strong> properties for sale
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 360, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🏗️</p>
            <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 8 }}>No properties for sale yet</p>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Check back soon or contact us to list your property.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(l => (
              <article key={l.id}
                onClick={() => router.push(`/en/real-estate/${l.id}`)}
                style={{ background: '#fff', borderRadius: 16, border: `1px solid ${l.is_featured ? 'rgba(212,168,67,0.3)' : 'rgba(0,0,0,0.06)'}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ height: 220, background: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
                  {l.photos?.[0]
                    ? <img src={l.photos[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏗️</div>
                  }
                  {l.is_featured && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#D4A843', color: '#0e1428', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      ⭐ Featured
                    </div>
                  )}
                  {l.price_negotiable && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(42,157,143,0.9)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      Negotiable
                    </div>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {l.property_type} · {l.furnished || 'unfurnished'}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#2C3A6B', fontWeight: 400, marginBottom: 8, lineHeight: 1.3 }}>
                    {l.title}
                  </h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                    <MapPin size={12} color="#D4A843" />
                    {l.area?.replace(/_/g, ' ')}{l.compound && ` · ${l.compound}`}
                  </p>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                    {l.bedrooms && <span><Bed size={12} style={{ display: 'inline', marginRight: 3 }} />{l.bedrooms} bed</span>}
                    {l.floor_area && <span><Maximize2 size={12} style={{ display: 'inline', marginRight: 3 }} />{l.floor_area} m²</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#D4A843' }}>
                      {l.currency} {l.price?.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    2.5% buyer commission · Agent: Wassim Abdelsalam
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.25em',
  textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8,
}