// ============================================
// Cars Page — v5
// Multilingual + Responsive + Smart filters
// ============================================
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Search, SlidersHorizontal, X, Star, Lock } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import CitySelector from '@/components/CitySelector'
import { CARS_TX } from '@/lib/translations/cars'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Car {
  id: string; name: string; name_en: string | null; name_ar: string | null
  brand: string; model: string; year: number
  seats: number; price_per_day: number; price_per_week: number | null
  price_hidden: boolean; internal_score: number | null
  photos: string[]; transmission: string; fuel_type: string
  km_limit: number | null; payment_method?: string
}

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid']
const PAYMENT_METHODS = [
  { id: 'cash', emoji: '💵' },
  { id: 'card', emoji: '💳' },
  { id: 'bank_transfer', emoji: '🏦' },
]

export default function CarsPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tx = CARS_TX[locale as keyof typeof CARS_TX] || CARS_TX.en
  const isRTL = locale === 'ar'
  const router = useRouter()

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hiddenCarIds, setHiddenCarIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCity, setSelectedCity] = useState('sharm')
  const [isMobile, setIsMobile] = useState(false)

  const [search, setSearch] = useState('')
  const [transmission, setTransmission] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [minSeats, setMinSeats] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [sortBy, setSortBy] = useState<'score'|'price_asc'|'price_desc'>('score')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setIsLoggedIn(!!data.user); setCurrentUser(data.user) })
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { fetchCars(selectedCity) }, [selectedCity])

  const fetchCars = async (citySlug: string) => {
    setLoading(true)
    const { data: city } = await supabase.from('cities').select('id').eq('slug', citySlug).single()
    if (!city) { setCars([]); setLoading(false); return }
    const { data } = await supabase
      .from('cars')
      .select('id, name, name_en, name_ar, brand, model, year, seats, transmission, fuel_type, price_per_day, price_per_week, price_hidden, internal_score, photos, km_limit, payment_method, listing_type')
      .eq('city_id', city.id)
      .eq('review_status', 'approved')
      .eq('status', 'available')
      .limit(100)
    setCars(data || [])
    setLoading(false)
  }

  const hideCar = async (e: React.MouseEvent, carId: string) => {
    e.stopPropagation()
    if (!currentUser) return
    setHiddenCarIds(prev => new Set([...prev, carId]))
    await supabase.from('search_hidden').upsert({ user_id: currentUser.id, entity_type: 'car', entity_id: carId, reason: 'user_hidden' })
  }

  const filtered = useMemo(() => {
    let list = cars.filter(c => !hiddenCarIds.has(c.id))
    if (search) list = list.filter(c =>
      c.brand?.toLowerCase().includes(search.toLowerCase()) ||
      c.model?.toLowerCase().includes(search.toLowerCase()) ||
      c.name_en?.toLowerCase().includes(search.toLowerCase())
    )
    if (transmission) list = list.filter(c => c.transmission === transmission)
    if (fuelType) list = list.filter(c => c.fuel_type === fuelType)
    if (minSeats > 0) list = list.filter(c => c.seats >= minSeats)
    if (maxPrice > 0) list = list.filter(c => c.price_per_day <= maxPrice)
    if (paymentMethod) list = list.filter(c => c.payment_method === paymentMethod || !c.payment_method)
    if (sortBy === 'price_asc') list.sort((a,b) => a.price_per_day - b.price_per_day)
    if (sortBy === 'price_desc') list.sort((a,b) => b.price_per_day - a.price_per_day)
    if (sortBy === 'score') list.sort((a,b) => (b.internal_score||0) - (a.internal_score||0))
    return list
  }, [cars, hiddenCarIds, search, transmission, fuelType, minSeats, maxPrice, paymentMethod, sortBy])

  const activeCount = (transmission ? 1 : 0) + (fuelType ? 1 : 0) + (minSeats > 0 ? 1 : 0) + (maxPrice > 0 ? 1 : 0) + (paymentMethod ? 1 : 0)
  const resetFilters = () => { setTransmission(''); setFuelType(''); setMinSeats(0); setMaxPrice(0); setPaymentMethod(''); setSearch('') }

  const Pill = ({ active, onClick, children }: any) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? '#2C3A6B' : '#f3f4f6', color: active ? '#D4A843' : '#555', border: active ? '1px solid #2C3A6B' : '1px solid transparent', whiteSpace: 'nowrap' }}>{children}</button>
  )

  const labelStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />

      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', paddingTop: 70 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 0' }}>
          <CitySelector selectedCity={selectedCity} onChange={setSelectedCity} variant="pills" />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', gap: 10, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
            <Search size={16} style={{ position: 'absolute', left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tx.search_placeholder}
              style={{ width: '100%', padding: isRTL ? '11px 40px 11px 16px' : '11px 16px 11px 40px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' as const }} />
          </div>
          {!isMobile && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 13, color: '#555', cursor: 'pointer', outline: 'none' }}>
              <option value="score">{tx.top_rated}</option>
              <option value="price_asc">{tx.price_low_high}</option>
              <option value="price_desc">{tx.price_high_low}</option>
            </select>
          )}
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: showFilters || activeCount > 0 ? '#2C3A6B' : '#f9fafb', color: showFilters || activeCount > 0 ? '#D4A843' : '#555', border: `1px solid ${showFilters || activeCount > 0 ? '#2C3A6B' : 'rgba(0,0,0,0.08)'}`, borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <SlidersHorizontal size={15} />
            {tx.filters}
            {activeCount > 0 && <span style={{ background: '#D4A843', color: '#0e1428', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{activeCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fff', padding: '20px 24px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, auto)', gap: 24 }}>
                <div>
                  <p style={labelStyle}>{tx.transmission}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Pill active={transmission === ''} onClick={() => setTransmission('')}>{tx.any}</Pill>
                    <Pill active={transmission === 'automatic'} onClick={() => setTransmission(transmission === 'automatic' ? '' : 'automatic')}>{tx.automatic}</Pill>
                    <Pill active={transmission === 'manual'} onClick={() => setTransmission(transmission === 'manual' ? '' : 'manual')}>{tx.manual}</Pill>
                  </div>
                </div>

                <div>
                  <p style={labelStyle}>{tx.fuel_type}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Pill active={fuelType === ''} onClick={() => setFuelType('')}>{tx.any}</Pill>
                    {FUEL_TYPES.map(f => (
                      <Pill key={f} active={fuelType === f} onClick={() => setFuelType(fuelType === f ? '' : f)}>
                        {tx[f as keyof typeof tx]}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={labelStyle}>{tx.payment_method}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Pill active={paymentMethod === ''} onClick={() => setPaymentMethod('')}>{tx.any}</Pill>
                    {PAYMENT_METHODS.map(pm => (
                      <Pill key={pm.id} active={paymentMethod === pm.id} onClick={() => setPaymentMethod(paymentMethod === pm.id ? '' : pm.id)}>
                        {pm.emoji} {tx[pm.id as keyof typeof tx]}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'start' }}>
                <div>
                  <p style={labelStyle}>{tx.min_seats}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0,4,5,7,9].map(n => (
                      <button key={n} onClick={() => setMinSeats(minSeats === n ? 0 : n)} style={{ width: 38, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: minSeats === n && n > 0 ? '#2C3A6B' : '#f3f4f6', color: minSeats === n && n > 0 ? '#D4A843' : '#555', border: 'none' }}>
                        {n === 0 ? tx.any : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={labelStyle}>{tx.max_price_day}</p>
                  <input type="number" value={maxPrice || ''} onChange={e => setMaxPrice(Number(e.target.value))} placeholder="Max EGP" style={{ width: 130, padding: '8px 12px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }} />
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={resetFilters} style={{ alignSelf: 'flex-start', fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={13} /> {tx.reset}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>
        {!isLoggedIn && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Lock size={18} color="#d97706" />
              <p style={{ fontWeight: 600, color: '#92400e', fontSize: 13, margin: 0 }}>{tx.login_banner}</p>
            </div>
            <Link href={`/${locale}/login`} style={{ background: '#0e1428', color: '#D4A843', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{tx.sign_in}</Link>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          <strong style={{ color: '#2C3A6B' }}>{filtered.length}</strong> {tx.cars_found}
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '280px'}, 1fr))`, gap: 20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 300, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🚗</p>
            <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 12 }}>{tx.no_cars}</p>
            <button onClick={resetFilters} style={{ fontSize: 14, color: '#2A9D8F', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{tx.clear_filters}</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : '280px'}, 1fr))`, gap: isMobile ? 16 : 20 }}>
            {filtered.map(car => (
              <article key={car.id}
                onClick={() => router.push(`/${locale}/cars/${car.id}`)}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ position: 'relative', height: 180, background: '#f3f4f6', overflow: 'hidden' }}>
                  {car.photos?.[0]
                    ? <img src={car.photos[0]} alt={`${car.brand} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🚗</div>
                  }
                  <div style={{ position: 'absolute', top: 10, right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto', display: 'flex', gap: 6 }}>
                    <span style={{ background: car.listing_type === 'sale' ? '#2C3A6B' : '#2A9D8F', color: '#fff', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{car.listing_type === 'sale' ? (locale === 'ar' ? 'للبيع' : 'FOR SALE') : (locale === 'ar' ? 'للإيجار' : 'FOR RENT')}</span>
                    {currentUser && (
                      <button onClick={e => hideCar(e, car.id)} style={{ background: 'rgba(14,20,40,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 14 }}>×</button>
                    )}
                    <span style={{ background: 'rgba(255,255,255,0.9)', color: '#374151', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{car.transmission}</span>
                  </div>
                  {car.internal_score && (
                    <div style={{ position: 'absolute', bottom: 10, left: isRTL ? 'auto' : 10, right: isRTL ? 10 : 'auto', background: '#fff', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#2C3A6B', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                      <Star size={12} color="#D4A843" fill="#D4A843" />
                      {car.internal_score.toFixed(1)}
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#2C3A6B', fontWeight: 400 }}>
                      {car.name_en || car.name || `${car.brand} ${car.model}`}
                    </h3>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{car.year}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    <span>💺 {car.seats} {tx.seats}</span>
                    <span>⛽ {car.fuel_type}</span>
                    {car.km_limit && <span>📏 {car.km_limit} {tx.km_day}</span>}
                  </div>
                  {car.price_hidden && !isLoggedIn ? (
                    <p style={{ fontSize: 12, color: '#D4A843', fontWeight: 500 }}>{tx.login_price}</p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#D4A843' }}>EGP {car.price_per_day?.toLocaleString()}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{tx.per_day}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}</style>
    </div>
  )
}
