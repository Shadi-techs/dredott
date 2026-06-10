// ============================================
// Properties Page — v5
// Multilingual + Responsive + Smart filters
// ============================================
'use client'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search, SlidersHorizontal, X,
  MapPin, Star, Wifi, Wind,
  Car, Waves, Shield, Coffee, Eye, Calendar
} from 'lucide-react'
import Header from '@/components/Header'
import CitySelector from '@/components/CitySelector'
import { PROPERTIES_TX } from '@/lib/translations/properties'
import { usePageFlag } from '@/lib/hooks/usePageFlag'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PROPERTY_TYPES = [
  { id: 'apartment', emoji: '🏢', labels: { en: 'Apartment', ar: 'شقة', ru: 'Квартира', uk: 'Квартира', de: 'Wohnung', it: 'Appartamento' } },
  { id: 'villa',     emoji: '🏡', labels: { en: 'Villa',     ar: 'فيلا',  ru: 'Вилла',    uk: 'Вілла',    de: 'Villa',    it: 'Villa' } },
  { id: 'studio',    emoji: '🛏', labels: { en: 'Studio',    ar: 'استوديو', ru: 'Студия', uk: 'Студія',   de: 'Studio',   it: 'Monolocale' } },
  { id: 'chalet',    emoji: '⛺', labels: { en: 'Chalet',    ar: 'شاليه',  ru: 'Шале',    uk: 'Шале',     de: 'Chalet',   it: 'Chalet' } },
  { id: 'penthouse', emoji: '🌇', labels: { en: 'Penthouse', ar: 'بنتهاوس', ru: 'Пентхаус', uk: 'Пентхаус', de: 'Penthouse', it: 'Attico' } },
  { id: 'duplex',    emoji: '🏠', labels: { en: 'Duplex',    ar: 'دوبلكس',  ru: 'Дуплекс',  uk: 'Дуплекс',  de: 'Duplex',   it: 'Duplex' } },
]

const AMENITIES = [
  { col: 'wifi',         emoji: '📶', icon: Wifi,    labels: { en: 'WiFi',     ar: 'واي فاي', ru: 'WiFi',    uk: 'WiFi',    de: 'WLAN',       it: 'WiFi' } },
  { col: 'ac',           emoji: '❄️', icon: Wind,    labels: { en: 'AC',       ar: 'تكييف',   ru: 'Кондиционер', uk: 'Кондиціонер', de: 'Klimaanlage', it: 'Aria condizionata' } },
  { col: 'parking',      emoji: '🚗', icon: Car,     labels: { en: 'Parking',  ar: 'موقف',    ru: 'Парковка', uk: 'Паркування', de: 'Parkplatz', it: 'Parcheggio' } },
  { col: 'pool_access',  emoji: '🏊', icon: Waves,   labels: { en: 'Pool',     ar: 'حمام سباحة', ru: 'Бассейн', uk: 'Басейн', de: 'Pool',       it: 'Piscina' } },
  { col: 'security_24h', emoji: '🛡', icon: Shield,  labels: { en: 'Security', ar: 'أمن 24س',  ru: 'Охрана',  uk: 'Охорона', de: 'Sicherheit', it: 'Sicurezza' } },
  { col: 'sea_view',     emoji: '🌊', icon: Eye,     labels: { en: 'Sea view', ar: 'إطلالة بحر', ru: 'Вид на море', uk: 'Вид на море', de: 'Meerblick', it: 'Vista mare' } },
  { col: 'kitchen',      emoji: '🍳', icon: Coffee,  labels: { en: 'Kitchen',  ar: 'مطبخ',    ru: 'Кухня',   uk: 'Кухня',   de: 'Küche',      it: 'Cucina' } },
]

const PAYMENT_METHODS = [
  { id: 'cash',          emoji: '💵', labels: { en: 'Cash', ar: 'نقدي', ru: 'Наличные', uk: 'Готівка', de: 'Bargeld', it: 'Contanti' } },
  { id: 'card',          emoji: '💳', labels: { en: 'Card', ar: 'بطاقة', ru: 'Карта', uk: 'Картка', de: 'Karte', it: 'Carta' } },
  { id: 'bank_transfer', emoji: '🏦', labels: { en: 'Bank transfer', ar: 'تحويل بنكي', ru: 'Перевод', uk: 'Переказ', de: 'Überweisung', it: 'Bonifico' } },
]

interface Property {
  id: string; slug: string; name: string; area: string; type: string
  price_per_night: number | null; price_per_week: number | null; price_per_month: number | null
  max_guests: number; bedrooms: number; photos: string[]
  display_rating: number | null; price_hidden: boolean
  wifi: boolean; ac: boolean; pool_access: boolean; sea_view: boolean
  parking: boolean; security_24h: boolean; kitchen: boolean
  payment_method?: string; created_at: string
}

export default function PropertiesPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tx = PROPERTIES_TX[locale as keyof typeof PROPERTIES_TX] || PROPERTIES_TX.en
  const isRTL = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkInParam = searchParams.get('check_in') || ''
  const checkOutParam = searchParams.get('check_out') || ''

  const { enabled: pageEnabled, loading: flagLoading } = usePageFlag('properties_page_accessible')

  const [properties, setProperties] = useState<Property[]>([])
  const [areas, setAreas] = useState<{ slug: string; name_en: string; name_ar?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [selectedCity, setSelectedCity] = useState('sharm')
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('')
  const [type, setType] = useState('')
  const [priceType, setPriceType] = useState('night')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [minGuests, setMinGuests] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [checkIn, setCheckIn] = useState(checkInParam)
  const [checkOut, setCheckOut] = useState(checkOutParam)
  const [sortBy, setSortBy] = useState('rank')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadCityData(selectedCity) }, [selectedCity])

  const loadCityData = async (citySlug: string) => {
    setLoading(true)
    setArea('')
    const { data: city } = await supabase.from('cities').select('id').eq('slug', citySlug).single()
    if (!city) { setLoading(false); return }

    const { data: cityAreas } = await supabase
      .from('city_areas').select('slug, name_en, name_ar')
      .eq('city_id', city.id).eq('is_active', true).order('sort_order')
    setAreas(cityAreas || [])

    const { data } = await supabase
      .from('properties')
      .select('id, slug, name, area, type, price_per_night, price_per_week, price_per_month, max_guests, bedrooms, photos, display_rating, price_hidden, wifi, ac, pool_access, sea_view, parking, security_24h, kitchen, payment_method, created_at')
      .eq('city_id', city.id)
      .eq('review_status', 'approved')
      .in('status', ['available', 'active', 'live'])
      .order('created_at', { ascending: false })
      .limit(100)

    let filtered = data || []

    if (checkIn && checkOut && filtered.length > 0) {
      const ids = filtered.map(p => p.id)
      const { data: booked } = await supabase.from('bookings').select('property_id').in('property_id', ids).eq('status', 'confirmed').lt('check_in', checkOut).gt('check_out', checkIn)
      const { data: blocked } = await supabase.from('blocked_dates').select('entity_id').in('entity_id', ids).eq('entity_type', 'property').lt('start_date', checkOut).gt('end_date', checkIn)
      const blockedIds = new Set([...(booked || []).map((b: any) => b.property_id), ...(blocked || []).map((b: any) => b.entity_id)])
      filtered = filtered.filter(p => !blockedIds.has(p.id))
    }

    setProperties(filtered)
    setLoading(false)
  }

  const hideProperty = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) return
    setHiddenIds(prev => new Set([...prev, id]))
    await supabase.from('search_hidden').upsert({ user_id: user.id, entity_type: 'property', entity_id: id, reason: 'user_hidden' })
  }

  const getPrice = (p: Property) => {
    if (priceType === 'week') return p.price_per_week
    if (priceType === 'month') return p.price_per_month
    return p.price_per_night
  }

  const toggleAmenity = (col: string) =>
    setAmenities(prev => prev.includes(col) ? prev.filter(a => a !== col) : [...prev, col])

  const filtered = useMemo(() => {
    let list = properties.filter(p => !hiddenIds.has(p.id))
    if (search) list = list.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.area?.toLowerCase().includes(search.toLowerCase()))
    if (area) list = list.filter(p => p.area === area)
    if (type) list = list.filter(p => p.type === type)
    if (minGuests > 0) list = list.filter(p => p.max_guests >= minGuests)
    if (amenities.length > 0) list = list.filter(p => amenities.every(a => (p as any)[a] === true))
    if (paymentMethod) list = list.filter(p => p.payment_method === paymentMethod || !p.payment_method)
    const price = (p: Property) => getPrice(p) || 0
    if (minPrice > 0) list = list.filter(p => price(p) >= minPrice)
    if (maxPrice > 0) list = list.filter(p => price(p) <= maxPrice || price(p) === 0)
    if (sortBy === 'price_asc') list.sort((a, b) => (getPrice(a) || 99999) - (getPrice(b) || 99999))
    if (sortBy === 'price_desc') list.sort((a, b) => (getPrice(b) || 0) - (getPrice(a) || 0))
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'rank') list.sort((a, b) => (b.display_rating || 0) - (a.display_rating || 0))
    return list
  }, [properties, hiddenIds, search, area, type, priceType, minPrice, maxPrice, minGuests, amenities, paymentMethod, sortBy])

  const activeCount = (area ? 1 : 0) + (type ? 1 : 0) + (minGuests > 0 ? 1 : 0) + amenities.length + (minPrice > 0 || maxPrice > 0 ? 1 : 0) + (paymentMethod ? 1 : 0) + (checkIn ? 1 : 0)

  const resetFilters = () => { setArea(''); setType(''); setMinPrice(0); setMaxPrice(0); setMinGuests(0); setAmenities([]); setSortBy('rank'); setSearch(''); setPaymentMethod(''); setCheckIn(''); setCheckOut('') }

  const priceSuffix = priceType === 'week' ? `/${tx.per_week.toLowerCase()}` : priceType === 'month' ? `/${tx.per_month.toLowerCase()}` : `/${tx.per_night.toLowerCase()}`

  const Pill = ({ active, onClick, children }: any) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? '#2C3A6B' : '#f3f4f6', color: active ? '#D4A843' : '#555', border: active ? '1px solid #2C3A6B' : '1px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{children}</button>
  )

  const getAreaName = (a: typeof areas[0]) => locale === 'ar' && a.name_ar ? a.name_ar : a.name_en

  if (flagLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!pageEnabled) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', gap: 16, textAlign: 'center', padding: 32 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#2C3A6B' }}>🏠</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#2C3A6B', margin: 0 }}>Properties — Coming Soon</h1>
      <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 400 }}>This section is currently unavailable. Please check back later or contact us on WhatsApp.</p>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} style={{ background: '#2A9D8F', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>WhatsApp Us</a>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />

      {/* ── Hero Banner ── */}
      <div style={{ position: 'relative', paddingTop: 64, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0e1428 0%, #1a2440 50%, #0d2b26 100%)', padding: '40px 24px 48px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=60')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
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

      {/* Sticky bar */}
      <div style={{ position: 'sticky', top: 64, zIndex: 10, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 0' }}>
          <CitySelector selectedCity={selectedCity} onChange={setSelectedCity} variant="pills" />
        </div>

        {/* Search row */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', gap: 10, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
            <Search size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tx.search_placeholder}
              style={{ width: '100%', padding: isRTL ? '11px 40px 11px 16px' : '11px 16px 11px 40px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' as const }} />
          </div>
          {!isMobile && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 13, color: '#555', cursor: 'pointer', outline: 'none' }}>
              <option value="rank">{tx.top_rated}</option>
              <option value="price_asc">{tx.price_low_high}</option>
              <option value="price_desc">{tx.price_high_low}</option>
              <option value="newest">{tx.newest_first}</option>
            </select>
          )}
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: showFilters || activeCount > 0 ? '#2C3A6B' : '#f9fafb', color: showFilters || activeCount > 0 ? '#D4A843' : '#555', border: `1px solid ${showFilters || activeCount > 0 ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`, borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <SlidersHorizontal size={15} />
            {tx.filters}
            {activeCount > 0 && <span style={{ background: '#D4A843', color: '#0e1428', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
          </button>
        </div>

        {/* Quick filters + mobile sort */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {isMobile && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '5px 10px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, fontSize: 12, color: '#555', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
              <option value="rank">{tx.top_rated}</option>
              <option value="price_asc">{tx.price_low_high}</option>
              <option value="price_desc">{tx.price_high_low}</option>
              <option value="newest">{tx.newest_first}</option>
            </select>
          )}
          {AMENITIES.slice(0, isMobile ? 6 : 4).map(a => (
            <button key={a.col} onClick={() => toggleAmenity(a.col)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: amenities.includes(a.col) ? '#2C3A6B' : 'rgba(0,0,0,0.04)', color: amenities.includes(a.col) ? '#D4A843' : '#555', border: amenities.includes(a.col) ? '1px solid #2C3A6B' : '1px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {a.emoji} {a.labels[locale as keyof typeof a.labels] || a.labels.en}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: isMobile ? '16px 16px 20px' : '20px 24px 24px', maxHeight: isMobile ? '70vh' : 'none', overflowY: isMobile ? 'auto' : 'visible' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>

              {/* Dates */}
              <div>
                <p style={labelStyle}>{tx.check_in} / {tx.check_out}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} style={numInputStyle} />
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} style={numInputStyle} />
                </div>
              </div>

              {/* Areas */}
              {areas.length > 0 && (
                <div>
                  <p style={labelStyle}>{tx.area}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {areas.map(a => <Pill key={a.slug} active={area === a.slug} onClick={() => setArea(area === a.slug ? '' : a.slug)}>{getAreaName(a)}</Pill>)}
                  </div>
                </div>
              )}

              {/* Property type */}
              <div>
                <p style={labelStyle}>{tx.property_type}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PROPERTY_TYPES.map(t => (
                    <Pill key={t.id} active={type === t.id} onClick={() => setType(type === t.id ? '' : t.id)}>
                      {t.emoji} {t.labels[locale as keyof typeof t.labels] || t.labels.en}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p style={labelStyle}>{tx.payment_method}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <Pill key={pm.id} active={paymentMethod === pm.id} onClick={() => setPaymentMethod(paymentMethod === pm.id ? '' : pm.id)}>
                      {pm.emoji} {pm.labels[locale as keyof typeof pm.labels] || pm.labels.en}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p style={labelStyle}>{tx.price}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {['night','week','month'].map(pt => (
                    <Pill key={pt} active={priceType === pt} onClick={() => setPriceType(pt)}>
                      {pt === 'night' ? tx.per_night : pt === 'week' ? tx.per_week : tx.per_month}
                    </Pill>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                    <input type="number" value={minPrice || ''} onChange={e => setMinPrice(Number(e.target.value))} placeholder="Min EGP" style={numInputStyle} />
                    <span style={{ alignSelf: 'center', color: '#9ca3af' }}>—</span>
                    <input type="number" value={maxPrice || ''} onChange={e => setMaxPrice(Number(e.target.value))} placeholder="Max EGP" style={numInputStyle} />
                  </div>
                </div>
              </div>

              {/* Guests + Amenities */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr', gap: isMobile ? 16 : 32, alignItems: 'start' }}>
                <div>
                  <p style={labelStyle}>{tx.min_guests}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[0,2,4,6,8].map(n => (
                      <button key={n} onClick={() => setMinGuests(minGuests === n ? 0 : n)} style={{ width: 38, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: minGuests === n && n > 0 ? '#2C3A6B' : '#f3f4f6', color: minGuests === n && n > 0 ? '#D4A843' : '#555', border: 'none' }}>
                        {n === 0 ? tx.any : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={labelStyle}>{tx.amenities}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AMENITIES.map(a => {
                      const active = amenities.includes(a.col)
                      return (
                        <button key={a.col} onClick={() => toggleAmenity(a.col)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: 13, background: active ? '#2C3A6B' : '#f3f4f6', color: active ? '#D4A843' : '#555', border: active ? '1px solid #2C3A6B' : '1px solid transparent', cursor: 'pointer' }}>
                          {a.emoji} {a.labels[locale as keyof typeof a.labels] || a.labels.en}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={resetFilters} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={13} /> {tx.reset_filters}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          <strong style={{ color: '#2C3A6B' }}>{filtered.length}</strong> {tx.stays_found}
          {activeCount > 0 ? ` · ${activeCount} ${tx.filters_active}` : ''}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '300px'}, 1fr))`, gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 320, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🏠</p>
            <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 12 }}>{tx.no_results}</p>
            <button onClick={resetFilters} style={{ fontSize: 14, color: '#2A9D8F', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{tx.clear_filters}</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '300px'}, 1fr))`, gap: isMobile ? 16 : 24 }}>
            {filtered.map(p => {
              const price = getPrice(p)
              return (
                <article key={p.id}
                  onClick={() => router.push(`/${locale}/properties/${p.slug || p.id}`)}
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
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,20,40,0.75)', color: '#D4A843', padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>{tx.login_for_price}</div>
                    )}
                    {p.display_rating && (
                      <div style={{ position: 'absolute', bottom: 10, left: isRTL ? 'auto' : 10, right: isRTL ? 10 : 'auto', background: '#fff', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#2C3A6B', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                        <Star size={12} color="#D4A843" fill="#D4A843" />
                        {p.display_rating.toFixed(1)}
                      </div>
                    )}
                    {user && (
                      <button onClick={e => hideProperty(e, p.id)} title="Hide" style={{ position: 'absolute', top: 10, left: isRTL ? 'auto' : 10, right: isRTL ? 10 : 'auto', background: 'rgba(14,20,40,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 14 }}>×</button>
                    )}
                    <div style={{ position: 'absolute', bottom: 10, right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto', display: 'flex', gap: 4 }}>
                      {p.pool_access && <span style={chipStyle}>🏊</span>}
                      {p.sea_view && <span style={chipStyle}>🌊</span>}
                      {p.wifi && <span style={chipStyle}>📶</span>}
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#2C3A6B', marginBottom: 6, fontWeight: 400, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                    <p style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <MapPin size={12} color="#D4A843" />
                      {p.area?.replace(/_/g, ' ')} · {p.bedrooms === 0 ? tx.studio : `${p.bedrooms} ${tx.bed}`} · {p.max_guests} {tx.guests}
                    </p>
                    {!p.price_hidden && price ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#D4A843' }}>EGP {price.toLocaleString()}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{priceSuffix}</span>
                      </div>
                    ) : p.price_hidden ? (
                      <p style={{ fontSize: 12, color: '#D4A843', fontWeight: 500 }}>{tx.login_to_see_price}</p>
                    ) : (
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>{tx.price_on_request}</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }
const numInputStyle: React.CSSProperties = { width: 130, padding: '8px 12px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }
const chipStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '2px 6px', fontSize: 13 }
