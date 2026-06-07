// ============================================
// Properties Page — v4
// Path: src/app/[locale]/properties/page.tsx
// Added: City selector (auto-hides if 1 city)
//        Filters areas per selected city
//        city_id in DB query
// ============================================

'use client'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, Crown,
  MapPin, Star, Users, Bed, Wifi, Wind,
  Car, Waves, Shield, Coffee, Eye
} from 'lucide-react'
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
  { id: 'duplex',     label: 'Duplex',    emoji: '🏠' },
]

const PRICE_TYPES = [
  { id: 'night', label: 'Per night' },
  { id: 'week',  label: 'Per week' },
  { id: 'month', label: 'Per month' },
]

const AMENITIES = [
  { id: 'wifi',         label: 'WiFi',     icon: Wifi,    col: 'wifi' },
  { id: 'ac',           label: 'AC',       icon: Wind,    col: 'ac' },
  { id: 'parking',      label: 'Parking',  icon: Car,     col: 'parking' },
  { id: 'pool_access',  label: 'Pool',     icon: Waves,   col: 'pool_access' },
  { id: 'security_24h', label: 'Security', icon: Shield,  col: 'security_24h' },
  { id: 'sea_view',     label: 'Sea view', icon: Eye,     col: 'sea_view' },
  { id: 'kitchen',      label: 'Kitchen',  icon: Coffee,  col: 'kitchen' },
]

const SORT_OPTIONS = [
  { id: 'rank',       label: 'Top rated' },
  { id: 'price_asc',  label: 'Price: Low → High' },
  { id: 'price_desc', label: 'Price: High → Low' },
  { id: 'newest',     label: 'Newest first' },
]

const QUICK_FILTERS = [
  { label: '🌊 Sea view',    amenity: 'sea_view' },
  { label: '🏊 Pool',        amenity: 'pool_access' },
  { label: '👨‍👩‍👧 Family (4+)', minGuests: 4 },
  { label: '🛏 Studio',      type: 'studio' },
  { label: '🏡 Villa',       type: 'villa' },
]

interface Property {
  id: string; slug: string; name: string; area: string; type: string
  price_per_night: number | null; price_per_week: number | null; price_per_month: number | null
  max_guests: number; bedrooms: number; photos: string[]
  display_rating: number | null; price_hidden: boolean
  wifi: boolean; ac: boolean; pool_access: boolean; sea_view: boolean
  parking: boolean; security_24h: boolean; kitchen: boolean
  created_at: string
}

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkIn = searchParams.get('check_in') || ''
  const checkOut = searchParams.get('check_out') || ''

  const [properties, setProperties] = useState<Property[]>([])
  const [areas, setAreas]           = useState<{ slug: string; name_en: string }[]>([])
  const [loading, setLoading]       = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // City
  const [selectedCity, setSelectedCity] = useState('sharm')
  const [cityId, setCityId]             = useState<string | null>(null)

  // Filters
  const [search, setSearch]     = useState('')
  const [area, setArea]         = useState('')
  const [type, setType]         = useState('')
  const [priceType, setPriceType] = useState('night')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [minGuests, setMinGuests] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [sortBy, setSortBy]     = useState('rank')

  // When city changes → fetch its areas + properties
  useEffect(() => {
    if (selectedCity) loadCityData(selectedCity)
  }, [selectedCity])

  const loadCityData = async (citySlug: string) => {
    setLoading(true)
    setArea('') // reset area when city changes

    // Get city id
    const { data: city } = await supabase
      .from('cities').select('id').eq('slug', citySlug).single()

    if (!city) { setLoading(false); return }
    setCityId(city.id)

    // Get areas for this city
    const { data: cityAreas } = await supabase
      .from('city_areas')
      .select('slug, name_en')
      .eq('city_id', city.id)
      .eq('is_active', true)
      .order('sort_order')
    setAreas(cityAreas || [])

    // Get properties for this city
    const { data } = await supabase
      .from('properties')
      .select('id, slug, name, area, type, price_per_night, price_per_week, price_per_month, max_guests, bedrooms, photos, display_rating, price_hidden, wifi, ac, pool_access, sea_view, parking, security_24h, kitchen, created_at')
      .eq('city_id', city.id)
      .eq('review_status', 'approved')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(100)

    setProperties(data || [])
    setLoading(false)
  }

  const hideProperty = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation()
    if (!user) return
    setHiddenIds(prev => new Set([...prev, propertyId]))
    await supabase.from('search_hidden').upsert({
      user_id: user.id,
      entity_type: 'property',
      entity_id: propertyId,
      reason: 'user_hidden'
    })
  }

  const getPrice = (p: Property) => {
    if (priceType === 'week')  return p.price_per_week
    if (priceType === 'month') return p.price_per_month
    return p.price_per_night
  }

  const toggleAmenity = (id: string) =>
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])

  const applyQuickFilter = (qf: typeof QUICK_FILTERS[0]) => {
    if (qf.amenity) toggleAmenity(qf.amenity)
    if (qf.type)    setType(t => t === qf.type ? '' : qf.type!)
    if (qf.minGuests) setMinGuests(g => g === qf.minGuests ? 0 : qf.minGuests!)
  }

  const filtered = useMemo(() => {
    let list = [...properties]
    if (search) list = list.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.area?.toLowerCase().includes(search.toLowerCase())
    )
    if (area) list = list.filter(p => p.area === area)
    if (type) list = list.filter(p => p.type === type)
    if (minGuests > 0) list = list.filter(p => p.max_guests >= minGuests)
    if (amenities.length > 0) list = list.filter(p =>
      amenities.every(a => (p as any)[a] === true)
    )
    const price = (p: Property) => getPrice(p) || 0
    if (minPrice > 0) list = list.filter(p => price(p) >= minPrice)
    if (maxPrice > 0) list = list.filter(p => price(p) <= maxPrice || price(p) === 0)
    if (sortBy === 'price_asc')  list.sort((a, b) => (getPrice(a) || 99999) - (getPrice(b) || 99999))
    if (sortBy === 'price_desc') list.sort((a, b) => (getPrice(b) || 0) - (getPrice(a) || 0))
    if (sortBy === 'newest')     list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'rank')       list.sort((a, b) => (b.display_rating || 0) - (a.display_rating || 0))
    return list
  }, [properties, search, area, type, priceType, minPrice, maxPrice, minGuests, amenities, sortBy])

  const activeCount =
    (area ? 1 : 0) + (type ? 1 : 0) +
    (minGuests > 0 ? 1 : 0) + amenities.length +
    (minPrice > 0 || maxPrice > 0 ? 1 : 0)

  const resetFilters = () => {
    setArea(''); setType(''); setMinPrice(0); setMaxPrice(0)
    setMinGuests(0); setAmenities([]); setSortBy('rank'); setSearch('')
  }

  const priceSuffix = priceType === 'week' ? '/week' : priceType === 'month' ? '/month' : '/night'

  const Pill = ({ active, onClick, children }: any) => (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: 13,
      fontWeight: active ? 600 : 400, cursor: 'pointer',
      background: active ? '#2C3A6B' : '#f3f4f6',
      color: active ? '#D4A843' : '#555',
      border: active ? '1px solid #2C3A6B' : '1px solid transparent',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>{children}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      {/* Sticky bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', paddingTop: 70 }}>

        {/* City selector — auto-hidden if only 1 city */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 0' }}>
          <CitySelector
            selectedCity={selectedCity}
            onChange={(slug) => setSelectedCity(slug)}
            variant="pills"
          />
        </div>

        {/* Search row */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, area…"
              style={{ width: '100%', padding: '11px 16px 11px 40px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' as const }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 13, color: '#555', cursor: 'pointer', outline: 'none' }}>
            {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: showFilters || activeCount > 0 ? '#2C3A6B' : '#f9fafb',
            color: showFilters || activeCount > 0 ? '#D4A843' : '#555',
            border: `1px solid ${showFilters || activeCount > 0 ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && <span style={{ background: '#D4A843', color: '#0e1428', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
          </button>
        </div>

        {/* Quick filters */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {QUICK_FILTERS.map((qf, i) => {
            const isActive =
              (qf.amenity && amenities.includes(qf.amenity)) ||
              (qf.type && type === qf.type) ||
              (qf.minGuests && minGuests === qf.minGuests)
            return (
              <button key={i} onClick={() => applyQuickFilter(qf)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12,
                background: isActive ? '#2C3A6B' : 'rgba(0,0,0,0.04)',
                color: isActive ? '#D4A843' : '#555',
                border: isActive ? '1px solid #2C3A6B' : '1px solid transparent',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}>{qf.label}</button>
            )
          })}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: '20px 24px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Areas — from DB for selected city */}
              {areas.length > 0 && (
                <div>
                  <p style={labelStyle}>Area</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {areas.map(a => (
                      <Pill key={a.slug} active={area === a.slug} onClick={() => setArea(area === a.slug ? '' : a.slug)}>
                        {a.name_en}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}

              {/* Property type */}
              <div>
                <p style={labelStyle}>Property type</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PROPERTY_TYPES.map(t => (
                    <Pill key={t.id} active={type === t.id} onClick={() => setType(type === t.id ? '' : t.id)}>
                      {t.emoji} {t.label}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p style={labelStyle}>Price</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRICE_TYPES.map(pt => (
                    <Pill key={pt.id} active={priceType === pt.id} onClick={() => setPriceType(pt.id)}>{pt.label}</Pill>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                    <input type="number" value={minPrice || ''} onChange={e => setMinPrice(Number(e.target.value))} placeholder="Min EGP" style={numInputStyle} />
                    <span style={{ alignSelf: 'center', color: '#9ca3af' }}>—</span>
                    <input type="number" value={maxPrice || ''} onChange={e => setMaxPrice(Number(e.target.value))} placeholder="Max EGP" style={numInputStyle} />
                  </div>
                </div>
              </div>

              {/* Guests + Amenities */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'start' }}>
                <div>
                  <p style={labelStyle}>Min guests</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,2,4,6,8].map(n => (
                      <button key={n} onClick={() => setMinGuests(minGuests === n ? 0 : n)} style={{
                        width: 38, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: minGuests === n && n > 0 ? '#2C3A6B' : '#f3f4f6',
                        color: minGuests === n && n > 0 ? '#D4A843' : '#555', border: 'none',
                      }}>{n === 0 ? 'Any' : `${n}+`}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={labelStyle}>Amenities</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AMENITIES.map(a => {
                      const Icon = a.icon
                      const active = amenities.includes(a.col)
                      return (
                        <button key={a.col} onClick={() => toggleAmenity(a.col)} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 14px', borderRadius: 20, fontSize: 13,
                          background: active ? '#2C3A6B' : '#f3f4f6',
                          color: active ? '#D4A843' : '#555',
                          border: active ? '1px solid #2C3A6B' : '1px solid transparent',
                          cursor: 'pointer',
                        }}>
                          <Icon size={13} /> {a.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={resetFilters} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={13} /> Reset all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          <strong style={{ color: '#2C3A6B' }}>{filtered.length}</strong> stays found
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount > 1 ? 's' : ''} active` : ''}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 320, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🏠</p>
            <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 12 }}>No stays match your filters</p>
            <button onClick={resetFilters} style={{ fontSize: 14, color: '#2A9D8F', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.map(p => {
              const price = getPrice(p)
              return (
                <article key={p.id}
                  onClick={() => router.push(`/en/properties/${p.slug || p.id}`)}
                  style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ position: 'relative', height: 200, background: '#f3f4f6', overflow: 'hidden' }}>
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏠</div>
                    }
                    {p.price_hidden && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,20,40,0.75)', color: '#D4A843', padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>
                        🔒 Login for price
                      </div>
                    )}
                    {p.display_rating && (
                      <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#fff', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#2C3A6B', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Star size={12} color="#D4A843" fill="#D4A843" />
                        {p.display_rating.toFixed(1)}
                      </div>
                    )}
                    {user && (
                      <button onClick={(e) => hideProperty(e, p.id)} title="Hide from search" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(14,20,40,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 14 }}>×</button>
                    )}
                    <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4 }}>
                      {p.pool_access && <span style={chipStyle}>🏊</span>}
                      {p.sea_view && <span style={chipStyle}>🌊</span>}
                      {p.wifi && <span style={chipStyle}>📶</span>}
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#2C3A6B', marginBottom: 6, fontWeight: 400, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <MapPin size={12} color="#D4A843" />
                      {p.area?.replace(/_/g, ' ')} · {p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} bed`} · {p.max_guests} guests
                    </p>
                    {!p.price_hidden && price ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#D4A843' }}>EGP {price.toLocaleString()}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{priceSuffix}</span>
                      </div>
                    ) : p.price_hidden ? (
                      <p style={{ fontSize: 12, color: '#D4A843', fontWeight: 500 }}>Login to see price →</p>
                    ) : (
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>Price on request</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }
const numInputStyle: React.CSSProperties = { width: 110, padding: '8px 12px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }
const chipStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '2px 6px', fontSize: 13 }