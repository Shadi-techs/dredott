'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, Star, Search, ChevronRight, Shield, Award, Clock, Heart, Car } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { HOME_TX } from '@/lib/translations/home'
import { useCurrency } from '@/contexts/CurrencyContext'

interface Property {
  id: string
  slug: string
  name: string
  area: string
  price_per_night: number
  bedrooms: number
  max_guests: number
  photos: string[]
  display_rating?: number
  price_hidden: boolean
}

interface FeaturedCar {
  id: string
  name: string
  name_en: string | null
  brand: string
  model: string
  year: number
  seats: number
  price_per_day: number
  price_hidden: boolean
  photos: string[]
  transmission: string
  internal_score: number | null
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const router   = useRouter()
  const pathname = usePathname()
  const { displayPrice } = useCurrency()
  const locale   = pathname.split('/')[1] || 'en'
  const htx      = HOME_TX[locale as keyof typeof HOME_TX] || HOME_TX.en
  const isRTL    = locale === 'ar'

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [featuredCars, setFeaturedCars] = useState<FeaturedCar[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [loadingCars, setLoadingCars] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [showStickySearch, setShowStickySearch] = useState(false)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [soundOn, setSoundOn] = useState(false)

  const go = (path: string) => router.push(`/${locale}${path}`)

  const toggleSound = () => {
    const audio = document.getElementById('sea-audio') as HTMLAudioElement
    if (!audio) return
    if (soundOn) { audio.pause(); setSoundOn(false) }
    else { audio.volume = 0.3; audio.play(); setSoundOn(true) }
  }

  useEffect(() => {
    fetchFeaturedProperties()
    fetchFeaturedCars()

    const handleScroll = () => {
      const y = window.scrollY
      setScrollY(y)
      setShowStickySearch(y > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchFeaturedProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('review_status', 'approved')
      .in('status', ['available', 'active', 'live'])
      .order('display_rating', { ascending: false })
      .limit(6)
    if (data) setFeaturedProperties(data)
    setLoadingProps(false)
  }

  const fetchFeaturedCars = async () => {
    const { data: city } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', 'sharm')
      .single()
    if (!city) { setLoadingCars(false); return }

    const { data } = await supabase
      .from('cars')
      .select('id, name, name_en, brand, model, year, seats, transmission, price_per_day, price_hidden, internal_score, photos')
      .eq('city_id', city.id)
      .eq('review_status', 'approved')
      .in('status', ['available', 'active', 'live'])
      .order('internal_score', { ascending: false })
      .limit(6)
    if (data) setFeaturedCars(data)
    setLoadingCars(false)
  }

  const parallaxY = scrollY * 0.4
  const heroOpacity = Math.max(0, 1 - scrollY / 600)

  const searchAndGo = () => {
    const p = new URLSearchParams()
    if (checkIn)  p.set('check_in',  checkIn)
    if (checkOut) p.set('check_out', checkOut)
    go(`/stays?${p.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Sticky Search Bar ── */}
      {showStickySearch && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '10px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <select style={{ flex: 1, padding: '8px 12px', background: '#FAF9F6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }}>
              <option value="all">{htx.area_all}</option>
              <option value="naama">Naama Bay</option>
              <option value="sharks">Sharks Bay</option>
              <option value="hadaba">Hadaba</option>
            </select>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]}
              style={{ flex: 1, padding: '8px 12px', background: '#FAF9F6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }} />
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]}
              style={{ flex: 1, padding: '8px 12px', background: '#FAF9F6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#2C3A6B', outline: 'none' }} />
            <button onClick={searchAndGo}
              style={{ padding: '8px 20px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {htx.search_btn}
            </button>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `translateY(${parallaxY}px) scale(1.05)`, willChange: 'transform' }}>
          <source src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(14, 20, 40, 0.55) 100%), linear-gradient(to bottom, rgba(14, 20, 40, 0.4) 0%, rgba(14, 20, 40, 0.2) 40%, rgba(14, 20, 40, 0.7) 100%)` }} />

        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")` }} />

        <div className="absolute top-1/4 left-8 transform -rotate-90 origin-left text-[11px] tracking-[0.28em] text-[#D4A843] opacity-60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span>26°48'N</span><span className="mx-2">/</span><span>34°00'E</span><span className="mx-2">/</span><span>RED SEA</span>
        </div>
        <div className="absolute top-1/4 right-8 transform rotate-90 origin-right text-[11px] tracking-[0.28em] text-[#D4A843] opacity-60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span>VOL. VII</span><span className="mx-2">/</span><span>2026</span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center" style={{ opacity: heroOpacity }}>
          <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] text-[#D4A843] mb-7" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="w-1 h-1 rounded-full bg-[#D4A843]" />
            {htx.badge}
            <span className="w-1 h-1 rounded-full bg-[#D4A843]" />
          </div>

          <h1 className="text-6xl lg:text-8xl text-white leading-none mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {htx.h1_line1}<br />
            <em>{htx.h1_em}</em><span>{htx.h1_rest}</span>
          </h1>

          <p className="text-lg text-white/80 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {htx.sub1}<br />
            {htx.sub2}
          </p>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-4xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <label className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{htx.where}</label>
                <select className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm" defaultValue="all">
                  <option value="all">{htx.area_all}</option>
                  <option value="naama">Naama Bay</option>
                  <option value="sharks">Sharks Bay</option>
                  <option value="hadaba">Hadaba</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{htx.checkin}</label>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm" />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{htx.checkout}</label>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn} className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm" />
              </div>
              <button onClick={searchAndGo}
                className="bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2">
                <Search size={14} />{htx.search_btn}
              </button>
            </div>
          </div>

          <a onClick={() => go('/stays')} className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm cursor-pointer transition-colors">
            {htx.browse_all}<ChevronRight size={14} />
          </a>
        </div>

        <audio id="sea-audio" loop preload="none">
          <source src="https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3" type="audio/mpeg" />
        </audio>

        <button onClick={toggleSound} style={{ position: 'absolute', bottom: 80, right: 32, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(14,20,40,0.6)', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 100, padding: '8px 10px', color: '#D4A843', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
          <span style={{ fontSize: 18 }}>{soundOn ? '🔊' : '🔇'}</span>
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-[rgba(14,20,40,0.7)] border-y border-[rgba(212,168,67,0.2)] py-3 overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="flex animate-marquee whitespace-nowrap text-[11px] tracking-[0.3em] text-[#D4A843]">
            <span>NAAMA BAY ✦ RAS MOHAMMED ✦ TIRAN ISLAND ✦ MONTAZAH ✦ SHARKS BAY ✦ HADABA ✦ ST. CATHERINE ✦ </span>
            <span>NAAMA BAY ✦ RAS MOHAMMED ✦ TIRAN ISLAND ✦ MONTAZAH ✦ SHARKS BAY ✦ HADABA ✦ ST. CATHERINE ✦ </span>
          </div>
        </div>
      </section>

      {/* ── Category Picker ── */}
      <section className="py-20 bg-white border-b border-[rgba(26,36,64,0.06)]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.24em] text-[#B8860B] mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {htx.what_looking}
            </div>
            <h2 className="text-4xl lg:text-5xl text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {htx.stays_cars} <em>{htx.stays_cars_em}</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Properties Card */}
            <div
              onClick={() => go('/stays')}
              className="group cursor-pointer relative rounded-2xl overflow-hidden h-72 flex items-end"
              style={{ background: 'linear-gradient(135deg, #1a2440 0%, #2C3A6B 100%)' }}
            >
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1428]/80 via-[#0e1428]/30 to-transparent" />
              <div className="relative z-10 p-8 w-full">
                <div className="text-[10px] tracking-[0.24em] text-[#D4A843] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {htx.stay_count}
                </div>
                <h3 className="text-3xl text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {htx.find_stay}
                </h3>
                <p className="text-white/60 text-sm mb-4">{htx.stay_sub}</p>
                <span className="inline-flex items-center gap-2 text-[#D4A843] text-sm font-medium group-hover:gap-3 transition-all">
                  {htx.browse_props} <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* Cars Card */}
            <div
              onClick={() => go('/cars')}
              className="group cursor-pointer relative rounded-2xl overflow-hidden h-72 flex items-end"
              style={{ background: 'linear-gradient(135deg, #1a3830 0%, #2A9D8F 100%)' }}
            >
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e1a]/80 via-[#0a1e1a]/30 to-transparent" />
              <div className="relative z-10 p-8 w-full">
                <div className="text-[10px] tracking-[0.24em] text-[#D4A843] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {htx.car_tag}
                </div>
                <h3 className="text-3xl text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {htx.rent_car}
                </h3>
                <p className="text-white/60 text-sm mb-4">{htx.car_sub}</p>
                <span className="inline-flex items-center gap-2 text-[#D4A843] text-sm font-medium group-hover:gap-3 transition-all">
                  {htx.browse_cars} <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-24 bg-[#FAF9F6]" id="properties">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {htx.section_stays}
              </div>
              <h2 className="text-5xl lg:text-6xl text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {htx.hand_picked} <em>{htx.the_bay}</em>
              </h2>
              <p className="text-gray-500 text-sm max-w-xl">{htx.every_listing}</p>
            </div>
            <a onClick={() => go('/stays')} className="hidden lg:flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium cursor-pointer transition-colors text-sm">
              {htx.view_all_props} <ChevronRight size={14} />
            </a>
          </div>

          {loadingProps ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 6).map((property, index) => (
                <article key={property.id} onClick={() => go(`/stays/${property.slug}`)}
                  className="group cursor-pointer bg-white rounded-xl border border-[rgba(26,36,64,0.08)] hover:border-[#D4A843] transition-all duration-300 overflow-hidden hover:shadow-lg relative">
                  <div className="absolute top-4 left-4 z-10 text-xs tracking-wider text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    № {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {property.photos[0] ? (
                      <img src={property.photos[0]} alt={property.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2C3A6B] to-[#2A9D8F]">
                        <MapPin className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    {property.price_hidden && (
                      <div className="absolute top-4 right-4 bg-[#B8860B] text-[#FFF8DC] px-3 py-1 rounded-full text-xs font-bold">🔒</div>
                    )}
                    {property.display_rating && (
                      <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow">
                        <Star className="w-3.5 h-3.5 text-[#D4A843]" fill="#D4A843" />
                        <span className="text-sm font-bold text-[#2C3A6B]">{property.display_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl text-[#2C3A6B] mb-1 group-hover:text-[#2A9D8F] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {property.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B8860B]" />
                      {property.area.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{property.bedrooms} {property.bedrooms === 1 ? htx.bed : htx.beds} · {property.max_guests} {htx.guests}</span>
                      {!property.price_hidden && (
                        <div className="text-right">
                          <span className="text-xl font-bold text-[#B8860B]">{displayPrice(property.price_per_night)}</span>
                          <span className="text-xs text-gray-400 ml-1">{htx.per_night}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 text-center lg:hidden">
            <button onClick={() => go('/stays')} className="inline-flex items-center gap-2 text-[#2A9D8F] font-medium text-sm">
              {htx.view_all_props} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Cars ── */}
      <section className="py-24 bg-white" id="cars">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {htx.section_fleet}
              </div>
              <h2 className="text-5xl lg:text-6xl text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {htx.explore} <em>{htx.on_terms}</em>
              </h2>
              <p className="text-gray-500 text-sm max-w-xl">{htx.fleet_sub}</p>
            </div>
            <a onClick={() => go('/cars')} className="hidden lg:flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium cursor-pointer transition-colors text-sm">
              {htx.view_all_cars} <ChevronRight size={14} />
            </a>
          </div>

          {loadingCars ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />)}
            </div>
          ) : featuredCars.length === 0 ? (
            <div onClick={() => go('/cars')}
              className="cursor-pointer border-2 border-dashed border-[#D4A843]/40 rounded-2xl py-16 flex flex-col items-center gap-4 hover:border-[#D4A843] transition-colors">
              <Car className="w-12 h-12 text-[#D4A843]/60" />
              <p className="text-[#2C3A6B] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>{htx.browse_cars}</p>
              <span className="inline-flex items-center gap-1 text-[#2A9D8F] text-sm">{htx.view_all_cars} <ChevronRight size={13} /></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car, index) => (
                <article key={car.id} onClick={() => go('/cars')}
                  className="group cursor-pointer bg-white rounded-xl border border-[rgba(26,36,64,0.08)] hover:border-[#2A9D8F] transition-all duration-300 overflow-hidden hover:shadow-lg relative">
                  <div className="absolute top-4 left-4 z-10 text-xs tracking-wider text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    № {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {car.photos?.[0] ? (
                      <img src={car.photos[0]} alt={car.name_en || car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a3830] to-[#2A9D8F]">
                        <Car className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    {car.price_hidden && (
                      <div className="absolute top-4 right-4 bg-[#B8860B] text-[#FFF8DC] px-3 py-1 rounded-full text-xs font-bold">🔒</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl text-[#2C3A6B] mb-1 group-hover:text-[#2A9D8F] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {car.name_en || car.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {car.brand} · {car.year} · {car.transmission} · {car.seats} {htx.seats}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{htx.per_day}</span>
                      {!car.price_hidden && (
                        <div className="text-right">
                          <span className="text-xl font-bold text-[#2A9D8F]">{displayPrice(car.price_per_day)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 text-center lg:hidden">
            <button onClick={() => go('/cars')} className="inline-flex items-center gap-2 text-[#2A9D8F] font-medium text-sm">
              {htx.view_all_cars} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Quote ── */}
      <section className="py-16 bg-[#FAF9F6] border-y border-[rgba(26,36,64,0.06)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <span className="absolute -top-8 -left-4 text-[120px] leading-none text-[#D4A843] opacity-20" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"</span>
              <p className="text-2xl lg:text-3xl text-[#2C3A6B] leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                {htx.quote}<br />
                {htx.quote2} <em className="font-semibold">{htx.friend}</em>
              </p>
              <div className="mt-6 text-sm tracking-[0.2em] text-[#B8860B]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{htx.the_team}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '50+', label: htx.stat_props },
                { num: '4.9★', label: htx.stat_rating },
                { num: '1,200+', label: htx.stat_guests },
                { num: '24/7', label: htx.stat_support },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-[#2C3A6B] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{stat.num}</div>
                  <div className="text-xs tracking-[0.18em] text-[#6b7280]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Dredott ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {htx.section_why}
            </div>
            <h2 className="text-5xl lg:text-6xl text-[#2C3A6B] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {htx.five_star}<br /><em>{htx.no_lobby}</em>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">{htx.why_sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MapPin,  title: htx.loc_title,   desc: htx.loc_desc },
              { icon: Award,  title: htx.wa_title,    desc: htx.wa_desc },
              { icon: Shield, title: htx.verif_title, desc: htx.verif_desc },
              { icon: Heart,  title: htx.lang_title,  desc: htx.lang_desc },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="text-center">
                  <div className="text-xs tracking-widest text-[#B8860B] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    0{i + 1} <span className="mx-2">·</span>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FBF0D0] to-[#D4A843] rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-[#8B6914]" />
                  </div>
                  <h3 className="text-xl text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(14,20,40,0.85)] to-[rgba(42,157,143,0.75)]" />

        <div className="relative z-10 text-center px-8">
          <div className="text-[11px] tracking-[0.2em] text-[#D4A843] mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {htx.final_tag}
          </div>
          <h2 className="text-5xl lg:text-6xl text-white mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {htx.your_story}<br /><em>{htx.starts_here}</em>
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">{htx.final_sub}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => go('/stays')} className="bg-white hover:bg-gray-100 text-[#2C3A6B] px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg">
              {htx.browse_stays_btn}
            </button>
            <a href="https://wa.me/201200481043" target="_blank"
              className="bg-[#D4A843] hover:bg-[#B8860B] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg flex items-center gap-2">
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.45 1.32 4.94L2 22l5.27-1.38a9.94 9.94 0 004.77 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0012.04 2zm.01 2c2.11 0 4.09.82 5.58 2.31a7.85 7.85 0 012.31 5.6c0 4.36-3.55 7.91-7.91 7.91h-.01a7.93 7.93 0 01-4.04-1.11l-.29-.17-2.99.78.8-2.91-.19-.3a7.94 7.94 0 011.46-9.81A7.86 7.86 0 0112.05 4z" />
              </svg>
              {htx.wa_us}
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  )
}
