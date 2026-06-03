// ============================================
// Home Page - Editorial Style
// Path: src/app/[locale]/page.tsx
// FIXED: createBrowserClient singleton outside component
// ============================================

'use client'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, Star, Search, ChevronRight, Shield, Award, Clock, Heart, Plus, Minus } from 'lucide-react'
import { useRouter } from 'next/navigation'



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

// ✅ Singleton خارج الـ component — instance واحدة بس في كل الـ app
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const router = useRouter()
  
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  
  // Property Filter State
  const [selectedArea, setSelectedArea] = useState('all')
  const [maxPrice, setMaxPrice] = useState(250)
  const [guests, setGuests] = useState(2)
  const [soundOn, setSoundOn] = useState(false)

  const toggleSound = () => {
    const audio = document.getElementById('sea-audio') as HTMLAudioElement
    if (!audio) return
    if (soundOn) {
      audio.pause()
      setSoundOn(false)
    } else {
      audio.volume = 0.3
      audio.play()
      setSoundOn(true)
    }
  }

  useEffect(() => {
    fetchFeaturedProperties()
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchFeaturedProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .order('display_rating', { ascending: false })
      .limit(6)
    
    if (data) setFeaturedProperties(data)
    setLoading(false)
  }

  const filteredProperties = useMemo(() => {
    return featuredProperties.filter(p =>
      (selectedArea === 'all' || p.area === selectedArea) &&
      p.price_per_night <= maxPrice &&
      p.max_guests >= guests
    )
  }, [featuredProperties, selectedArea, maxPrice, guests])

  const areas = [
    { id: 'all', label: 'All areas' },
    { id: 'naama_bay', label: 'Naama Bay' },
    { id: 'sharks_bay', label: 'Sharks Bay' },
    { id: 'old_market', label: 'Old Market' },
    { id: 'hadaba', label: 'Hadaba' },
  ]

  const parallaxY = scrollY * 0.4
  const heroOpacity = Math.max(0, 1 - scrollY / 600)

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      

      {/* Hero Section - Editorial with Video */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            transform: `translateY(${parallaxY}px) scale(1.05)`,
            willChange: 'transform'
          }}
        >
          <source src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>

        {/* Vignette Overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 30%, rgba(14, 20, 40, 0.55) 100%),
              linear-gradient(to bottom, rgba(14, 20, 40, 0.4) 0%, rgba(14, 20, 40, 0.2) 40%, rgba(14, 20, 40, 0.7) 100%)
            `
          }}
        />

        {/* Grain Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`
          }}
        />

        {/* Coordinates (Marginalia) */}
        <div 
          className="absolute top-1/4 left-8 transform -rotate-90 origin-left text-[11px] tracking-[0.28em] text-[#D4A843] opacity-60"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>26°48'N</span>
          <span className="mx-2">/</span>
          <span>34°00'E</span>
          <span className="mx-2">/</span>
          <span>RED SEA</span>
        </div>

        {/* Issue Number */}
        <div 
          className="absolute top-1/4 right-8 transform rotate-90 origin-right text-[11px] tracking-[0.28em] text-[#D4A843] opacity-60"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>VOL. VII</span>
          <span className="mx-2">/</span>
          <span>2026</span>
        </div>

        {/* Hero Content */}
        <div 
          className="relative z-10 max-w-6xl mx-auto px-8 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Eyebrow */}
          <div 
            className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] text-[#D4A843] mb-7"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="w-1 h-1 rounded-full bg-[#D4A843]" />
            SHARM EL SHEIKH · RED SEA · EGYPT
            <span className="w-1 h-1 rounded-full bg-[#D4A843]" />
          </div>

          {/* Headline */}
          <h1 
            className="text-6xl lg:text-8xl text-white leading-none mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Sharm El Sheikh,<br />
            <em>your</em> <span>way.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-white/80 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Hand-picked apartments and villas across the bay.<br />
            Booked on WhatsApp. Met at the airport. Lived in like a local.
          </p>

          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-4xl mx-auto mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <label 
                  className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  WHERE
                </label>
                <select 
                  className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm"
                  defaultValue="all"
                >
                  <option value="all">All areas</option>
                  <option value="naama">Naama Bay</option>
                  <option value="sharks">Sharks Bay</option>
                  <option value="hadaba">Hadaba</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  CHECK-IN
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm"
                />
              </div>

              <div>
                <label 
                  className="block text-[9px] tracking-[0.16em] text-[#6b7280] mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  CHECK-OUT
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] outline-none text-[#2C3A6B] text-sm"
                />
              </div>

              <button
                onClick={() => router.push('/en/properties')}
                className="bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Search size={14} />
                Search
              </button>
            </div>
          </div>

          <a 
            onClick={() => router.push('/en/properties')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm cursor-pointer transition-colors"
          >
            Browse all 50+ properties
            <ChevronRight size={14} />
          </a>
        </div>

        {/* Audio Element */}
        <audio id="sea-audio" loop preload="none">
          <source src="https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3" type="audio/mpeg" />
        </audio>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleSound}
          style={{
            position: 'absolute',
            bottom: 80,
            right: 32,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(14,20,40,0.6)',
            border: '1px solid rgba(212,168,67,0.4)',
            borderRadius: 100,
            padding: '8px 10px',
            color: '#D4A843',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 18 }}>{soundOn ? '🔊' : '🔇'}</span>
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>

        {/* Marquee */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-[rgba(14,20,40,0.7)] border-y border-[rgba(212,168,67,0.2)] py-3 overflow-hidden"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <div className="flex animate-marquee whitespace-nowrap text-[11px] tracking-[0.3em] text-[#D4A843]">
            <span>NAAMA BAY ✦ RAS MOHAMMED ✦ TIRAN ISLAND ✦ MONTAZAH ✦ SHARKS BAY ✦ HADABA ✦ ST. CATHERINE ✦ </span>
            <span>NAAMA BAY ✦ RAS MOHAMMED ✦ TIRAN ISLAND ✦ MONTAZAH ✦ SHARKS BAY ✦ HADABA ✦ ST. CATHERINE ✦ </span>
          </div>
        </div>
      </section>

      {/* Stats Bar - Editorial Quote Style */}
      <section className="py-16 bg-white border-y border-[rgba(26,36,64,0.08)]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <span 
                className="absolute -top-8 -left-4 text-[120px] leading-none text-[#D4A843] opacity-20"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                "
              </span>
              <p 
                className="text-2xl lg:text-3xl text-[#2C3A6B] leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
              >
                A small team, a curated list, and a single promise:<br />
                you'll be looked after the way we'd look after a <em className="font-semibold">friend.</em>
              </p>
              <div 
                className="mt-6 text-sm tracking-[0.2em] text-[#B8860B]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                — THE DredottTEAM
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '50+', label: 'Curated properties' },
                { num: '4.9★', label: 'Average rating' },
                { num: '1,200+', label: 'Happy guests' },
                { num: '24/7', label: 'WhatsApp support' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="text-4xl font-bold text-[#2C3A6B] mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {stat.num}
                  </div>
                  <div 
                    className="text-xs tracking-[0.18em] text-[#6b7280]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {stat.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sticky Metadata */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit">
              <div 
                className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-6"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                — CHAPTER ONE
              </div>
              <div className="space-y-2 text-xs text-[#6b7280]">
                <div>EST. 2019</div>
                <div>SHARM EL SHEIKH</div>
                <div>RUN BY HOSTS WHO LIVE HERE</div>
              </div>
            </div>

            {/* Story Body */}
            <div className="lg:col-span-9">
              <h2 
                className="text-4xl lg:text-5xl text-[#2C3A6B] leading-tight mb-8"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                We started with <em>one apartment</em> in Naama Bay,<br />
                a kettle, and a WhatsApp number.
              </h2>
              <div className="prose prose-lg max-w-none text-[#2C3A6B] space-y-6">
                <p className="text-base leading-relaxed">
                  Seven years later, the kettle is the same. The WhatsApp number, too. Only the list of keys has grown — fifty-something stays now, scattered across the bay, every one inspected, photographed, and looked after by people who actually live in Sharm.
                </p>
                <p className="text-base leading-relaxed">
                  We're not a hotel. We're not a booking platform. We're the friend with great taste who hands you the keys, picks you up at the airport, and tells you which reef to dive at sunrise.
                </p>
                <a 
                  onClick={() => router.push('/en/about')}
                  className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium cursor-pointer transition-colors"
                >
                  Read the full story
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 bg-white" id="properties">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div 
                className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                — THE STAYS · NO. 02
              </div>
              <h2 
                className="text-5xl lg:text-6xl text-[#2C3A6B] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Hand-picked across <em>the bay.</em>
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Filter live by area, price, and party size. Every listing is inspected by our team.
              </p>
            </div>
            <a 
              onClick={() => router.push('/en/properties')}
              className="hidden lg:flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium cursor-pointer transition-colors"
            >
              View all 50+
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Area Filter */}
            <div>
              <label className="block text-sm font-medium text-[#2C3A6B] mb-3">Area</label>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedArea(area.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedArea === area.id
                        ? 'bg-[#2C3A6B] text-white'
                        : 'bg-[#FAF9F6] text-[#6b7280] hover:bg-[#FBF0D0]'
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-[#2C3A6B] mb-3">
                  Max price <span className="text-[#B8860B]">${maxPrice}/night</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-[#FAF9F6] rounded-lg appearance-none cursor-pointer accent-[#2A9D8F]"
                />
              </div>

              {/* Guests Stepper */}
              <div>
                <label className="block text-sm font-medium text-[#2C3A6B] mb-3">Guests</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-full bg-[#FAF9F6] hover:bg-[#FBF0D0] flex items-center justify-center transition-colors"
                  >
                    <Minus size={16} className="text-[#2C3A6B]" />
                  </button>
                  <span className="text-lg font-medium text-[#2C3A6B] min-w-[40px] text-center">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(8, guests + 1))}
                    className="w-10 h-10 rounded-full bg-[#FAF9F6] hover:bg-[#FBF0D0] flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} className="text-[#2C3A6B]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div 
              className="text-sm tracking-wide text-[#6b7280]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <strong className="text-[#2C3A6B]">{filteredProperties.length}</strong>{' '}
              {filteredProperties.length === 1 ? 'stay' : 'stays'} match
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No stays match these filters. Try widening the price or changing the area.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <article
                  key={property.id}
                  onClick={() => router.push(`/en/properties/${property.slug}`)}
                  className="group cursor-pointer bg-white rounded-lg border border-[rgba(26,36,64,0.08)] hover:border-[#D4A843] transition-all duration-300 overflow-hidden hover:shadow-lg relative"
                >
                  {/* Property Number */}
                  <div 
                    className="absolute top-4 left-4 z-10 text-xs tracking-wider text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    № {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {property.photos[0] ? (
                      <img
                        src={property.photos[0]}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2C3A6B] to-[#2A9D8F]">
                        <MapPin className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {property.price_hidden && (
                      <div className="absolute top-4 right-4 bg-[#B8860B] text-[#FFF8DC] px-3 py-1.5 rounded-full text-xs font-bold">
                        🔒 Login to see price
                      </div>
                    )}

                    {property.display_rating && (
                      <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="w-4 h-4 text-[#D4A843]" fill="#D4A843" />
                        <span className="text-sm font-bold text-[#2C3A6B]">
                          {property.display_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 
                      className="text-xl text-[#2C3A6B] mb-2 group-hover:text-[#2A9D8F] transition-colors"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {property.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#B8860B]" />
                      {property.area.replace('_', ' ')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        {property.bedrooms} bed • {property.max_guests} guests
                      </div>
                      {!property.price_hidden && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#B8860B]">
                            ${property.price_per_night}
                          </div>
                          <div className="text-xs text-gray-500">per night</div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why DredottSection */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div 
              className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              — THE DredottWAY · NO. 05
            </div>
            <h2 
              className="text-5xl lg:text-6xl text-[#2C3A6B] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Five-star care,<br /><em>without the lobby.</em>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make your Sharm experience seamless from the moment you land to the morning you fly home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Prime locations',
                desc: 'Naama Bay, Sharks Bay, Old Market, Hadaba — sea views and beach access in every neighbourhood.',
              },
              {
                icon: Award,
                title: 'WhatsApp concierge',
                desc: 'A real person in your language confirms within minutes and stays one tap away through your stay.',
              },
              {
                icon: Shield,
                title: 'Verified properties',
                desc: 'Every listing is inspected, photographed, and managed end-to-end by the Dredottteam.',
              },
              {
                icon: Heart,
                title: 'Five languages',
                desc: 'English · Arabic · Italian · Russian · German. We match you with a host who speaks yours.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="text-center">
                  <div 
                    className="text-xs tracking-widest text-[#B8860B] mb-4"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    0{i + 1} <span className="mx-2">·</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FBF0D0] to-[#D4A843] rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-[#8B6914]" />
                  </div>
                  <h3 
                    className="text-xl text-[#2C3A6B] mb-3"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA with Video */}
      <section className="relative py-32 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(14,20,40,0.85)] to-[rgba(42,157,143,0.75)]" />

        <div className="relative z-10 text-center px-8">
          <div 
            className="text-[11px] tracking-[0.2em] text-[#D4A843] mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            — FIN · CHAPTER NINE
          </div>
          <h2 
            className="text-5xl lg:text-6xl text-white mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your Sharm story<br /><em>starts here.</em>
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Tell us your dates, we'll do the rest.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/en/properties')}
              className="bg-white hover:bg-gray-100 text-[#2C3A6B] px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              Browse stays →
            </button>
            <a
              href="https://wa.me/201200481043"
              target="_blank"
              className="bg-[#D4A843] hover:bg-[#B8860B] text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.45 1.32 4.94L2 22l5.27-1.38a9.94 9.94 0 004.77 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0012.04 2zm.01 2c2.11 0 4.09.82 5.58 2.31a7.85 7.85 0 012.31 5.6c0 4.36-3.55 7.91-7.91 7.91h-.01a7.93 7.93 0 01-4.04-1.11l-.29-.17-2.99.78.8-2.91-.19-.3a7.94 7.94 0 011.46-9.81A7.86 7.86 0 0112.05 4z" />
              </svg>
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      

      {/* Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}