'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Phone, Star, ExternalLink } from 'lucide-react'

const AREAS = [
  { value: '', label_en: 'All Areas', label_ar: 'كل المناطق' },
  { value: 'naama_bay', label_en: 'Naama Bay', label_ar: 'نعمة باي' },
  { value: 'sharks_bay', label_en: 'Sharks Bay', label_ar: 'خليج الشارك' },
  { value: 'hadaba', label_en: 'Hadaba', label_ar: 'الحدبة' },
  { value: 'om_el_seed', label_en: 'Om El Seed', label_ar: 'أم السيد' },
]

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isAr = locale === 'ar'
  const [categories, setCategories] = useState<any[]>([])
  const [featured, setFeatured]     = useState<any[]>([])
  const [providers, setProviders]   = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [selectedCat, selectedArea])

  async function fetchCategories() {
    const res = await fetch('/api/services/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  async function fetchProviders() {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCat)  params.set('category_id', selectedCat)
    if (selectedArea) params.set('area', selectedArea)
    const res = await fetch(`/api/services?${params}`)
    const data = await res.json()
    setFeatured(data.featured || [])
    setProviders(data.providers || [])
    setLoading(false)
  }

  const filtered = [...featured, ...providers].filter(p => {
    if (!search) return true
    const name = (isAr ? p.business_name_ar : p.business_name) || p.business_name
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const featuredFiltered  = filtered.filter(p => p.featured)
  const regularFiltered   = filtered.filter(p => !p.featured)

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <div style={{ background: '#2C3A6B', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#D4A843', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            {isAr ? 'مزودو الخدمة' : 'Service Providers'}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 700, color: '#FAF9F6', marginBottom: 8 }}>
            {isAr ? 'أفضل الخدمات في شرم الشيخ' : 'Trusted Services in Sharm El Sheikh'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
            {isAr ? 'اكتشف مزودي الخدمة المعتمدين في منطقتك' : 'Discover verified service providers in your area'}
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <Search style={{ position: 'absolute', left: isAr ? 'auto' : 14, right: isAr ? 14 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#888', width: 16, height: 16 }} />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن خدمة...' : 'Search services...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 10, border: 'none', fontSize: 14, background: '#fff', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCat('')}
            style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, border: '1px solid', cursor: 'pointer', background: selectedCat === '' ? '#2C3A6B' : '#fff', color: selectedCat === '' ? '#fff' : '#555', borderColor: selectedCat === '' ? '#2C3A6B' : '#ddd', fontWeight: 500 }}>
            {isAr ? 'الكل' : 'All'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id === selectedCat ? '' : cat.id)}
              style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, border: '1px solid', cursor: 'pointer', background: selectedCat === cat.id ? '#2C3A6B' : '#fff', color: selectedCat === cat.id ? '#fff' : '#555', borderColor: selectedCat === cat.id ? '#2C3A6B' : '#ddd' }}>
              {cat.icon} {isAr ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>

        {/* Area Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {AREAS.map(area => (
            <button
              key={area.value}
              onClick={() => setSelectedArea(area.value === selectedArea ? '' : area.value)}
              style={{ padding: '5px 14px', borderRadius: 100, fontSize: 11, border: '1px solid', cursor: 'pointer', background: selectedArea === area.value ? '#D4A843' : '#fff', color: selectedArea === area.value ? '#2C3A6B' : '#777', borderColor: selectedArea === area.value ? '#D4A843' : '#ddd', fontWeight: selectedArea === area.value ? 600 : 400 }}>
              📍 {isAr ? area.label_ar : area.label_en}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e0dbd4', borderTopColor: '#D4A843', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredFiltered.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>
                  {isAr ? 'مميزون' : 'Featured'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {featuredFiltered.map(p => <ProviderCard key={p.id} provider={p} isAr={isAr} featured />)}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e8e4de', marginBottom: 28 }} />
              </>
            )}

            {/* All */}
            {regularFiltered.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: '#aaa', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>
                  {isAr ? 'كل مزودي الخدمة' : 'All Providers'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {regularFiltered.map(p => <ProviderCard key={p.id} provider={p} isAr={isAr} />)}
                </div>
              </>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>
                  {isAr ? 'لا يوجد مزودو خدمة حالياً' : 'No service providers found'}
                </p>
                <p style={{ fontSize: 13 }}>
                  {isAr ? 'جرب فلتر مختلف' : 'Try a different filter'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ProviderCard({ provider: p, isAr, featured = false }: { provider: any; isAr: boolean; featured?: boolean }) {
  const name    = (isAr ? p.business_name_ar : p.business_name) || p.business_name
  const catName = isAr ? p.service_provider_categories?.name_ar : p.service_provider_categories?.name_en
  const icon    = p.service_provider_categories?.icon || '🏢'
  const reviews = p.google_reviews_cache

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${featured ? '#D4A843' : '#e8e4de'}`, borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(44,58,107,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>

      {/* Cover */}
      <div style={{ height: 72, background: 'linear-gradient(135deg, #2C3A6B 0%, #3d4f8a 100%)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 16px 12px' }}>
        {featured && (
          <span style={{ position: 'absolute', top: 10, right: isAr ? 'auto' : 10, left: isAr ? 10 : 'auto', background: '#D4A843', color: '#2C3A6B', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 100, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {isAr ? 'مميز' : 'Featured'}
          </span>
        )}
        {p.logo_url ? (
          <img src={p.logo_url} alt={name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2px solid rgba(255,255,255,0.3)' }}>
            {icon}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: '#2C3A6B', marginBottom: 2 }}>{name}</p>
        <p style={{ fontSize: 11, color: '#D4A843', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>{icon} {catName}</p>

        {p.area && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', marginBottom: 10 }}>
            <MapPin size={12} /> {p.area.replace('_', ' ')}
          </div>
        )}

        {/* Google Reviews */}
        {reviews?.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12} fill={i <= Math.round(reviews.rating) ? '#D4A843' : 'none'} color={i <= Math.round(reviews.rating) ? '#D4A843' : '#ddd'} />
            ))}
            <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>{reviews.rating} ({reviews.total})</span>
            <span style={{ fontSize: 10, color: '#bbb', marginLeft: 4 }}>G</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {p.whatsapp && (
            <a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              WhatsApp
            </a>
          )}
          <a href={`/${isAr ? 'ar' : 'en'}/services/${p.id}`}
            style={{ flex: 1, background: '#f5f3ef', color: '#2C3A6B', fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', border: '1px solid #e0dbd4', textDecoration: 'none', display: 'block' }}>
            {isAr ? 'عرض' : 'View'}
          </a>
        </div>
      </div>
    </div>
  )
}
