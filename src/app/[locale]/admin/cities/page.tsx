// ============================================
// Admin Cities Manager
// Path: src/app/[locale]/admin/cities/page.tsx
// Super Admin controls which cities are active
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, ToggleLeft, ToggleRight, Building2, Car, Eye, EyeOff } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface City {
  id: string; name_en: string; name_ar: string; slug: string
  governorate: string; is_active: boolean; sort_order: number
  property_count?: number; car_count?: number
}

export default function CitiesManagerPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCities() }, [])

  const fetchCities = async () => {
    // Get all cities (not just active)
    const { data: allCities } = await supabase
      .from('cities')
      .select('*')
      .order('sort_order')

    // Get listing counts
    const { data: propCounts } = await supabase
      .from('properties')
      .select('city_id')
      .eq('review_status', 'approved')

    const { data: carCounts } = await supabase
      .from('cars')
      .select('city_id')
      .eq('review_status', 'approved')

    const propMap: Record<string, number> = {}
    const carMap: Record<string, number> = {}
    propCounts?.forEach(p => { if (p.city_id) propMap[p.city_id] = (propMap[p.city_id] || 0) + 1 })
    carCounts?.forEach(c => { if (c.city_id) carMap[c.city_id] = (carMap[c.city_id] || 0) + 1 })

    setCities((allCities || []).map(c => ({
      ...c,
      property_count: propMap[c.id] || 0,
      car_count: carMap[c.id] || 0,
    })))
    setLoading(false)
  }

  const toggleCity = async (id: string, current: boolean) => {
    await supabase.from('cities').update({ is_active: !current }).eq('id', id)
    setCities(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const activeCities  = cities.filter(c => c.is_active)
  const inactiveCities = cities.filter(c => !c.is_active)

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F7', padding: '28px 32px' }}>

      <div style={{ marginBottom: 28 }}>
        <p style={eyebrow}>— Cities Manager</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', fontWeight: 400 }}>
          City Visibility
        </h1>
        <p style={{ fontSize: 12, color: '#7a8aaa', marginTop: 6 }}>
          Only cities with <strong style={{ color: '#FBF0D0' }}>is_active = true</strong> appear on the site. A city auto-activates when it receives an approved listing.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#1e2d4f', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '14px 20px' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#4ade80', lineHeight: 1 }}>{activeCities.length}</p>
          <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 4 }}>Active cities</p>
        </div>
        <div style={{ background: '#1e2d4f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#7a8aaa', lineHeight: 1 }}>{inactiveCities.length}</p>
          <p style={{ fontSize: 11, color: '#7a8aaa', marginTop: 4 }}>Hidden cities</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7a8aaa' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cities.map(city => (
            <div key={city.id} style={{
              background: '#1e2d4f',
              border: `1px solid ${city.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 16,
              opacity: city.is_active ? 1 : 0.6,
            }}>

              <MapPin size={18} color={city.is_active ? '#4ade80' : '#7a8aaa'} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FBF0D0' }}>{city.name_en}</p>
                  <p style={{ fontSize: 13, color: '#7a8aaa' }}>{city.name_ar}</p>
                </div>
                <p style={{ fontSize: 11, color: '#7a8aaa' }}>{city.governorate}</p>
              </div>

              {/* Listing counts */}
              <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: city.property_count! > 0 ? '#60a5fa' : '#7a8aaa' }}>
                  <Building2 size={13} />
                  {city.property_count} properties
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: city.car_count! > 0 ? '#60a5fa' : '#7a8aaa' }}>
                  <Car size={13} />
                  {city.car_count} cars
                </div>
              </div>

              {/* Status */}
              <span style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 20,
                fontFamily: "'JetBrains Mono', monospace",
                background: city.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                color: city.is_active ? '#4ade80' : '#7a8aaa',
                border: `1px solid ${city.is_active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {city.is_active ? 'visible' : 'hidden'}
              </span>

              {/* Toggle */}
              <button onClick={() => toggleCity(city.id, city.is_active)} style={{
                padding: '6px 12px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                color: city.is_active ? '#fbbf24' : '#4ade80', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
              }}>
                {city.is_active
                  ? <><EyeOff size={14} /> Hide</>
                  : <><Eye size={14} /> Show</>
                }
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: 'rgba(42,157,143,0.06)', border: '1px solid rgba(42,157,143,0.15)', borderRadius: 12 }}>
        <p style={{ fontSize: 12, color: '#2A9D8F', lineHeight: 1.6 }}>
          💡 <strong>Auto-activation:</strong> When a listing is approved in a hidden city, that city automatically becomes visible. You can manually override this at any time.
        </p>
      </div>
    </div>
  )
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9, letterSpacing: '0.3em',
  textTransform: 'uppercase', color: '#D4A843', marginBottom: 6,
}