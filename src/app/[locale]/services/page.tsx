// ============================================
// Services Directory Page
// Path: src/app/[locale]/services/page.tsx
// Public directory of service providers
// Controlled by feature flag + super admin visibility
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Phone, Crown, Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ServicesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [providers, setProviders]   = useState<any[]>([])
  const [selected, setSelected]     = useState<string | null>(null)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [userRole, setUserRole]     = useState<string | null>(null)

  useEffect(() => {
    // Get user role for visibility filtering
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: prof } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single()
        setUserRole(prof?.role || 'guest')
      }
    })
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: cats }, { data: provs }] = await Promise.all([
      supabase.from('service_categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('service_providers')
        .select('*, service_categories(name_en, icon, slug)')
        .eq('review_status', 'approved')
        .eq('is_active', true)
        .neq('visible_to', 'none')
        .order('featured', { ascending: false })
        .order('rating_avg', { ascending: false }),
    ])
    setCategories(cats || [])
    setProviders(provs || [])
    setLoading(false)
  }

  const filtered = providers.filter(p => {
    // Visibility: owner-only providers
    if (p.visible_to === 'owner' && userRole !== 'property_owner') return false

    // Category filter
    if (selected && p.category_id !== selected) return false

    // Search
    if (search && !p.business_name?.toLowerCase().includes(search.toLowerCase())) return false

    return true
  })

  const featuredProviders = filtered.filter(p => p.featured)
  const regularProviders  = filtered.filter(p => !p.featured)

  const renderStars = (avg: number) => {
    return [1,2,3,4,5].map(i => (
      <Star key={i} size={12}
        color="#D4A843"
        fill={i <= Math.round(avg) ? '#D4A843' : 'none'}
      />
    ))
  }

  const ProviderCard = ({ p }: { p: any }) => (
    <div
      onClick={() => router.push(`/en/services/${p.id}`)}
      style={{
        background: '#fff', borderRadius: 16,
        border: `1px solid ${p.featured ? 'rgba(212,168,67,0.3)' : 'rgba(0,0,0,0.06)'}`,
        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Cover / Logo */}
      <div style={{ height: 100, background: 'linear-gradient(135deg, #0e1428, #1a2240)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {p.logo_url
          ? <img src={p.logo_url} alt={p.business_name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(212,168,67,0.3)' }} />
          : <span style={{ fontSize: 40 }}>{p.service_categories?.icon || '🏢'}</span>
        }
        {p.featured && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 4, background: '#D4A843', color: '#0e1428', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
            <Crown size={10} /> Featured
          </div>
        )}
        {p.is_verified && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(42,157,143,0.9)', color: '#fff', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
            ✓ Verified
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 11, color: '#D4A843', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {p.service_categories?.name_en}
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#2C3A6B', fontWeight: 400, marginBottom: 6 }}>
          {p.business_name}
        </h3>

        {/* Rating */}
        {p.rating_count > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>{renderStars(p.rating_avg)}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2C3A6B' }}>{p.rating_avg?.toFixed(1)}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>({p.rating_count} reviews)</span>
          </div>
        ) : (
          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>No reviews yet</p>
        )}

        {p.area && (
          <p style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color="#D4A843" />
            {p.area.replace(/_/g, ' ')}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <Header />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#D4A843', textTransform: 'uppercase', marginBottom: 10 }}>
            — Local Services Directory
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 400, color: '#2C3A6B' }}>
            Services in Sharm El-Sheikh
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
            Trusted local providers — rated by property owners and guests like you.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto 28px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            style={{ width: '100%', padding: '11px 16px 11px 40px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, outline: 'none', color: '#2C3A6B', boxSizing: 'border-box' as const }} />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          <button onClick={() => setSelected(null)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            background: !selected ? '#2C3A6B' : '#fff',
            color: !selected ? '#D4A843' : '#6b7280',
            border: !selected ? '1px solid #2C3A6B' : '1px solid rgba(0,0,0,0.1)',
          }}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelected(selected === cat.id ? null : cat.id)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              background: selected === cat.id ? '#2C3A6B' : '#fff',
              color: selected === cat.id ? '#D4A843' : '#6b7280',
              border: selected === cat.id ? '1px solid #2C3A6B' : '1px solid rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {cat.icon} {cat.name_en}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, color: '#6b7280' }}>No services found</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredProviders.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#D4A843', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>Featured</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                  {featuredProviders.map(p => <ProviderCard key={p.id} p={p} />)}
                </div>
              </div>
            )}

            {/* All */}
            {regularProviders.length > 0 && (
              <div>
                {featuredProviders.length > 0 && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#9ca3af', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>All Services</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                  {regularProviders.map(p => <ProviderCard key={p.id} p={p} />)}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA for providers */}
        <div style={{ marginTop: 60, background: '#2C3A6B', borderRadius: 20, padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#FBF0D0', marginBottom: 8 }}>
            Are you a service provider?
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
            List your business and get real ratings from property owners and guests in Sharm.
          </p>
          <button onClick={() => router.push('/en/services/register')} style={{ padding: '12px 28px', background: '#D4A843', color: '#0e1428', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            Register Your Service →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}