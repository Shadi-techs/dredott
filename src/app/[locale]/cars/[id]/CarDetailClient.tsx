// ============================================
// Car Detail Page
// Path: src/app/[locale]/cars/[id]/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import { viewContent } from '@/lib/facebook-pixel'
import {
  ArrowLeft, Users, Settings, Fuel, Car,
  ChevronLeft, ChevronRight, X,
  MessageCircle, Lock, Crown, MapPin,
  Check, CalendarDays
} from 'lucide-react'
import { useTrackView } from '@/lib/hooks/useTrackView'
import { useCurrency } from '@/contexts/CurrencyContext'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CarDetailPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const id     = params.id as string
  const isAr   = locale === 'ar'
  const { displayPrice } = useCurrency()

  const [car, setCar]                 = useState<any>(null)
  const [owner, setOwner]             = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [user, setUser]               = useState<any>(null)
  const [photoIndex, setPhotoIndex]   = useState(0)
  const [lightbox, setLightbox]       = useState(false)
  const [notFound, setNotFound]       = useState(false)
  const [pickupDate, setPickupDate]   = useState('')
  const [returnDate, setReturnDate]   = useState('')

  useTrackView({ listing_type: 'car', listing_id: car?.id, enabled: !!car?.id })

  useEffect(() => {
    loadCar()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [id])

  const loadCar = async () => {
    const { data } = await supabase
      .from('cars')
      .select('id, name, name_en, name_ar, brand, model, year, seats, transmission, fuel_type, price_per_day, price_per_week, price_per_month, price_hidden, photos, internal_score, city, km_limit, description, ac, gps, review_status, owner_id')
      .eq('id', id)
      .eq('review_status', 'approved')
      .single()

    if (!data) { setNotFound(true); setLoading(false); return }
    setCar(data)
    viewContent({ content_name: `${data.brand} ${data.model} ${data.year || ''}`.trim(), content_category: 'car', content_ids: [data.id] })

    if (data.owner_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, avatar_url')
        .eq('id', data.owner_id)
        .single()
      if (profile) setOwner(profile)
    }

    setLoading(false)
  }

  const handleContact = () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/cars/${id}&reason=contact`)
      return
    }
    const phone = owner?.phone?.replace(/\D/g, '') || ''
    let msg = `Hi, I'm interested in your car: ${car.brand} ${car.model} ${car.year}`
    if (pickupDate) msg += `\nPick-up: ${pickupDate}`
    if (returnDate) msg += `\nReturn: ${returnDate}`
    const encoded = encodeURIComponent(msg)
    window.open(phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank')
  }

  const today = new Date().toISOString().split('T')[0]
  const photos       = car?.photos?.filter(Boolean) || []
  const priceVisible = !car?.price_hidden || !!user

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #D4A843', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
        <p style={{ fontSize: 48 }}>🚗</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B' }}>
          {isAr ? 'السيارة غير موجودة' : 'Car not found'}
        </h2>
        <button onClick={() => router.push(`/${locale}/cars`)} style={{ padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {isAr ? 'تصفح كل السيارات' : 'Browse all cars'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>

      {/* Lightbox */}
      {lightbox && photos.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={20} />
          </button>
          <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronLeft size={22} />
          </button>
          <img src={photos[photoIndex]} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronRight size={22} />
          </button>
          <p style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{photoIndex + 1} / {photos.length}</p>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          <ArrowLeft size={16} /> {isAr ? 'عودة' : 'Back to cars'}
        </button>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#2C3A6B', lineHeight: 1.2 }}>
              {car.brand} {car.model} <span style={{ color: '#9ca3af', fontSize: 26 }}>{car.year}</span>
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#D4A843" />
            {car.city || 'Sharm El-Sheikh'}, Egypt
          </p>
        </div>

        {/* Gallery */}
        {photos.length > 0 && (
          <div style={{ marginBottom: 28, borderRadius: 16, overflow: 'hidden', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4, height: 340 }}>
            <div style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setPhotoIndex(0); setLightbox(true) }}>
              <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
              {photos.slice(1, 3).map((photo: string, i: number) => (
                <div key={i} style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => { setPhotoIndex(i + 1); setLightbox(true) }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 1 && photos.length > 3 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 600 }}>
                      +{photos.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>

          {/* LEFT */}
          <div>
            {/* Specs */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: 20, background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', marginBottom: 24 }}>
              {[
                { icon: Car,      label: isAr ? 'سيارة' : 'Car' },
                { icon: Users,    label: `${car.seats || 5} ${isAr ? 'مقاعد' : 'seats'}` },
                { icon: Settings, label: isAr ? (car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي') : (car.transmission || 'Automatic') },
                { icon: Fuel,     label: isAr ? (car.fuel_type === 'petrol' ? 'بنزين' : car.fuel_type) : (car.fuel_type || 'Petrol') },
                ...(car.km_limit ? [{ icon: Check, label: `${car.km_limit} km/day` }] : []),
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={18} color="#D4A843" />
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, textTransform: 'capitalize' }}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Features */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {car.ac && <span style={{ padding: '6px 14px', background: 'rgba(44,58,107,0.08)', borderRadius: 20, fontSize: 13, color: '#2C3A6B', fontWeight: 500 }}>❄️ {isAr ? 'تكييف' : 'AC'}</span>}
              {car.gps && <span style={{ padding: '6px 14px', background: 'rgba(44,58,107,0.08)', borderRadius: 20, fontSize: 13, color: '#2C3A6B', fontWeight: 500 }}>🗺️ GPS</span>}
            </div>

            {/* Description */}
            {car.description && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#2C3A6B', marginBottom: 12 }}>
                  {isAr ? 'عن السيارة' : 'About this car'}
                </h2>
                <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8 }}>{car.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Booking card */}
          <div>
            <div style={{ position: 'sticky', top: 80, background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                {priceVisible ? (
                  <div>
                    {car.price_per_day && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: '#D4A843' }}>
                          {displayPrice(car.price_per_day)}
                        </span>
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>/{isAr ? 'يوم' : 'day'}</span>
                      </div>
                    )}
                    {car.price_per_week  && <p style={{ fontSize: 13, color: '#6b7280' }}>{displayPrice(car.price_per_week)} / {isAr ? 'أسبوع' : 'week'}</p>}
                    {car.price_per_month && <p style={{ fontSize: 13, color: '#6b7280' }}>{displayPrice(car.price_per_month)} / {isAr ? 'شهر' : 'month'}</p>}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={18} color="#D4A843" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#2C3A6B' }}>{isAr ? 'سجّل الدخول لرؤية السعر' : 'Login to see price'}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{isAr ? 'التسجيل مجاني' : 'Free registration'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Date range */}
              {user && (
                <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      {isAr ? 'الاستلام' : 'Pick-up'}
                    </label>
                    <input type="date" min={today} value={pickupDate}
                      onChange={e => { setPickupDate(e.target.value); if (returnDate && e.target.value > returnDate) setReturnDate('') }}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#374151', background: '#fafafa' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      {isAr ? 'الإعادة' : 'Return'}
                    </label>
                    <input type="date" min={pickupDate || today} value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#374151', background: '#fafafa' }} />
                  </div>
                </div>
              )}

              {/* CTA */}
              <button onClick={handleContact} style={{
                width: '100%', padding: '13px',
                background: user ? '#25D366' : '#2C3A6B',
                color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 10,
              }}>
                {user
                  ? <><MessageCircle size={18} /> {isAr ? 'تواصل عبر واتساب' : 'Contact on WhatsApp'}</>
                  : <><Lock size={16} /> {isAr ? 'سجّل دخول للتواصل' : 'Sign in to contact'}</>
                }
              </button>

              {!user && (
                <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
                  {isAr ? 'أنشئ حساباً مجانياً لرؤية الأسعار والتواصل' : 'Create a free account to contact owners and see prices'}
                </p>
              )}

              {/* Owner card */}
              {user && owner && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2C3A6B', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {owner.avatar_url
                      ? <img src={owner.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : `${owner.first_name?.[0] || ''}${owner.last_name?.[0] || ''}`
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#2C3A6B' }}>{owner.first_name} {owner.last_name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>{isAr ? 'مالك السيارة' : 'Car owner'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
