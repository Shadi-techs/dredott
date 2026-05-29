// ============================================
// CitySelector Component
// Path: src/components/CitySelector.tsx
//
// Shows only cities that have real approved listings
// Single city → no selector shown (transparent)
// Multiple cities → dropdown/tabs appear automatically
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, ChevronDown } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface City {
  id: string
  name_en: string
  name_ar: string
  slug: string
  property_count: number
  car_count: number
}

interface Props {
  selectedCity: string        // slug e.g. 'sharm'
  onChange: (slug: string) => void
  locale?: string
  variant?: 'dropdown' | 'tabs' | 'pills'
}

export default function CitySelector({
  selectedCity, onChange, locale = 'en', variant = 'pills'
}: Props) {
  const [cities, setCities] = useState<City[]>([])
  const [open, setOpen]     = useState(false)
  const isAr = locale === 'ar'

  useEffect(() => { fetchCities() }, [])

  const fetchCities = async () => {
    const { data } = await supabase
      .from('active_cities_summary')
      .select('id, name_en, name_ar, slug, property_count, car_count')
      .order('sort_order')
    setCities(data || [])

    // Auto-select first city if none selected
    if (!selectedCity && data && data.length > 0) {
      onChange(data[0].slug)
    }
  }

  const selected = cities.find(c => c.slug === selectedCity)

  // Only 1 city → render nothing (transparent)
  if (cities.length <= 1) return null

  // ── PILLS variant ─────────────────────────────────────────
  if (variant === 'pills') return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {cities.map(city => (
        <button
          key={city.slug}
          onClick={() => onChange(city.slug)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
            fontSize: 13, fontWeight: selectedCity === city.slug ? 600 : 400,
            background: selectedCity === city.slug ? '#2C3A6B' : '#f3f4f6',
            color: selectedCity === city.slug ? '#D4A843' : '#555',
            border: selectedCity === city.slug ? '1px solid #2C3A6B' : '1px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          <MapPin size={12} color={selectedCity === city.slug ? '#D4A843' : '#9ca3af'} />
          {isAr ? city.name_ar : city.name_en}
          <span style={{
            fontSize: 10, opacity: 0.7,
            color: selectedCity === city.slug ? 'rgba(212,168,67,0.8)' : '#9ca3af',
          }}>
            {(city.property_count + city.car_count)}
          </span>
        </button>
      ))}
    </div>
  )

  // ── DROPDOWN variant ──────────────────────────────────────
  if (variant === 'dropdown') return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', background: '#f9fafb',
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
          fontSize: 14, color: '#2C3A6B', cursor: 'pointer', fontWeight: 500,
        }}
      >
        <MapPin size={15} color="#D4A843" />
        {selected ? (isAr ? selected.name_ar : selected.name_en) : 'Select city'}
        <ChevronDown size={14} color="#9ca3af" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 50,
          background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 200, overflow: 'hidden',
        }}>
          {cities.map(city => (
            <button
              key={city.slug}
              onClick={() => { onChange(city.slug); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '11px 16px', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 13,
                color: selectedCity === city.slug ? '#2C3A6B' : '#374151',
                fontWeight: selectedCity === city.slug ? 600 : 400,
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={13} color={selectedCity === city.slug ? '#D4A843' : '#9ca3af'} />
                {isAr ? city.name_ar : city.name_en}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                {city.property_count + city.car_count} listings
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // ── TABS variant ──────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      {cities.map(city => (
        <button
          key={city.slug}
          onClick={() => onChange(city.slug)}
          style={{
            padding: '10px 20px', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 14,
            color: selectedCity === city.slug ? '#2C3A6B' : '#6b7280',
            fontWeight: selectedCity === city.slug ? 600 : 400,
            borderBottom: selectedCity === city.slug ? '2px solid #D4A843' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
          }}
        >
          {isAr ? city.name_ar : city.name_en}
        </button>
      ))}
    </div>
  )
}