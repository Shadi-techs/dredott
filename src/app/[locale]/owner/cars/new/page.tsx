// ============================================
// Add Car Form
// Path: src/app/[locale]/owner/cars/new/page.tsx
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Car, MapPin, DollarSign, Image,
  ChevronRight, ChevronLeft, CheckCircle,
  AlertCircle, Loader2, Navigation
} from 'lucide-react'
import PhotoUpload from '@/components/owner/PhotoUpload'

const CAR_TYPES = ['Sedan', 'SUV', 'Jeep', 'Minivan', 'Convertible', 'Luxury', 'Van', 'Pickup']
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid']
const TRANSMISSIONS = ['automatic', 'manual']
const STEPS = [
  { id: 1, label: 'Car Details', icon: Car },
  { id: 2, label: 'Location',   icon: MapPin },
  { id: 3, label: 'Pricing',    icon: DollarSign },
  { id: 4, label: 'Photos',     icon: Image },
]

export default function AddCarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep]         = useState(1)
  const [cities, setCities]     = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear(),
    car_type: 'Sedan', seats: 5, doors: 4,
    transmission: 'automatic', fuel_type: 'petrol',
    color: '', description: '',
    // Location
    city_id: '', city_name: '',
    lat: '', lng: '',
    km_limit: '',
    // Pricing
    price_per_day: 0, price_per_week: 0, price_per_month: 0,
    price_hidden: true,
    // Features
    ac: true, gps: false, bluetooth: false,
    backup_camera: false, child_seat_available: false,
    // Photos
    photos: [] as string[],
    // Auto fields
    name: '', name_ar: '',
  })

  useEffect(() => {
    supabase.from('cities').select('id, name_en, name_ar, slug')
      .eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        setCities(data || [])
        if (data && data.length > 0) {
          setForm(f => ({ ...f, city_id: data[0].id, city_name: data[0].name_en }))
        }
      })
  }, [])

  const set = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (s: number) => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.brand.trim()) errs.brand = 'Brand is required'
      if (!form.model.trim()) errs.model = 'Model is required'
    }
    if (s === 3) {
      if (!form.price_per_day) errs.price = 'Daily price is required'
    }
    if (s === 4) {
      if (form.photos.length < 1) errs.photos = 'Please add at least 1 photo'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => { if (validate(step)) setStep(s => s + 1) }
  const prevStep = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    if (!validate(4)) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const carName = `${form.brand} ${form.model} ${form.year}`

      const { error } = await supabase.from('cars').insert({
        owner_id:             user.id,
        name:                 carName,
        name_en:              carName,
        slug:                 `${form.brand.toLowerCase()}-${form.model.toLowerCase()}-${form.year}-${Date.now()}`,
        brand:                form.brand,
        model:                form.model,
        year:                 form.year,
        seats:                form.seats,
        doors:                form.doors,
        transmission:         form.transmission,
        fuel_type:            form.fuel_type,
        description:          form.description || null,
        city_id:              form.city_id || null,
        city:                 form.city_name,
        lat:                  form.lat ? parseFloat(form.lat) : null,
        lng:                  form.lng ? parseFloat(form.lng) : null,
        km_limit:             form.km_limit ? parseInt(form.km_limit) : null,
        price_per_day:        form.price_per_day,
        price_per_week:       form.price_per_week || null,
        price_per_month:      form.price_per_month || null,
        price_hidden:         form.price_hidden,
        ac:                   form.ac,
        gps:                  form.gps,
        bluetooth:            form.bluetooth,
        backup_camera:        form.backup_camera,
        child_seat_available: form.child_seat_available,
        photos:               form.photos,
        review_status:        'pending_review',
        status:               'available',
      })

      if (error) throw error
      setSubmitted(true)
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={36} color="#22c55e" />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', marginBottom: 12 }}>Car Submitted!</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.7 }}>
          <strong>{form.brand} {form.model} {form.year}</strong> is now under review. We'll notify you within 48 hours.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/en/owner')} style={{ flex: 1, padding: '11px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            My Dashboard
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1) }} style={{ flex: 1, padding: '11px', background: '#fff', color: '#2C3A6B', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, cursor: 'pointer' }}>
            Add Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2C3A6B', fontWeight: 400, marginBottom: 4 }}>Add New Car</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Step {step} of {STEPS.length} — {STEPS[step-1].label}</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone   = step > s.id
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: isActive ? '#2C3A6B' : isDone ? 'rgba(34,197,94,0.1)' : 'transparent',
                  color: isActive ? '#D4A843' : isDone ? '#22c55e' : '#9ca3af',
                }}>
                  {isDone ? <CheckCircle size={14} /> : <Icon size={14} />}
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: isDone ? '#22c55e' : '#e5e7eb', margin: '0 4px' }} />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

          {/* STEP 1: Car Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', marginBottom: 4 }}>Car Details</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Brand *</label>
                  <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota, BMW, Mercedes..." style={inp} />
                  {errors.brand && <p style={err}>{errors.brand}</p>}
                </div>
                <div>
                  <label style={lbl}>Model *</label>
                  <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Camry, X5, E-Class..." style={inp} />
                  {errors.model && <p style={err}>{errors.model}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Year</label>
                  <input type="number" min={2000} max={2026} value={form.year} onChange={e => set('year', parseInt(e.target.value))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Seats</label>
                  <select value={form.seats} onChange={e => set('seats', parseInt(e.target.value))} style={sel}>
                    {[2,4,5,6,7,8,9,12].map(n => <option key={n} value={n}>{n} seats</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Car Type</label>
                  <select value={form.car_type} onChange={e => set('car_type', e.target.value)} style={sel}>
                    {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Transmission</label>
                  <select value={form.transmission} onChange={e => set('transmission', e.target.value)} style={sel}>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Fuel Type</label>
                  <select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} style={sel}>
                    {FUEL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Color</label>
                <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="White, Black, Silver..." style={inp} />
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                  placeholder="Describe your car — condition, special features, ideal for..." style={{ ...inp, resize: 'none' as const }} />
              </div>

              {/* Features */}
              <div>
                <label style={lbl}>Features</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { key: 'ac',                   label: '❄️ AC' },
                    { key: 'gps',                  label: '🗺️ GPS' },
                    { key: 'bluetooth',            label: '📶 Bluetooth' },
                    { key: 'backup_camera',        label: '📷 Backup Camera' },
                    { key: 'child_seat_available', label: '👶 Child Seat' },
                  ].map(f => (
                    <button key={f.key} onClick={() => set(f.key as any, !(form as any)[f.key])} style={{
                      padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                      background: (form as any)[f.key] ? '#2C3A6B' : '#f3f4f6',
                      color: (form as any)[f.key] ? '#D4A843' : '#555',
                    }}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', marginBottom: 4 }}>Location</h2>

              {/* City selector */}
              {cities.length > 1 && (
                <div>
                  <label style={lbl}>City *</label>
                  <select
                    value={form.city_id}
                    onChange={e => {
                      const city = cities.find(c => c.id === e.target.value)
                      set('city_id', e.target.value)
                      set('city_name', city?.name_en || '')
                    }}
                    style={sel}
                  >
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
              )}

              {/* Coordinates */}
              <div style={{ padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <Navigation size={16} color="#3b82f6" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 2 }}>Car Location Coordinates</p>
                    <p style={{ fontSize: 12, color: '#3b82f6' }}>
                      Open Google Maps → right-click your location → "What's here?" → copy coordinates.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Latitude</label>
                    <input value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="27.9158" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 4 }}>Longitude</label>
                    <input value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="34.3293" style={inp} />
                  </div>
                </div>
              </div>

              {/* KM limit */}
              <div>
                <label style={lbl}>Daily KM Limit</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="number" value={form.km_limit} onChange={e => set('km_limit', e.target.value)}
                    placeholder="e.g. 200" style={{ ...inp, width: 120 }} />
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>km per day (leave empty = unlimited)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', marginBottom: 4 }}>Pricing</h2>

              <div style={{ padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#1e40af' }}>Prices in <strong>EGP</strong>. Daily price is required.</p>
              </div>

              {[
                { label: 'Price per day *', field: 'price_per_day' as const, suffix: 'EGP/day' },
                { label: 'Price per week',  field: 'price_per_week' as const, suffix: 'EGP/week' },
                { label: 'Price per month', field: 'price_per_month' as const, suffix: 'EGP/month' },
              ].map(({ label, field, suffix }) => (
                <div key={field}>
                  <label style={lbl}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min={0} value={(form as any)[field] || ''}
                      onChange={e => set(field, Number(e.target.value))}
                      placeholder="0" style={{ ...inp, paddingRight: 90 }} />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>{suffix}</span>
                  </div>
                </div>
              ))}
              {errors.price && <p style={err}>{errors.price}</p>}

              {/* Price hidden toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#2C3A6B' }}>Hide price until login</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Guests must register to see price (recommended)</p>
                </div>
                <button onClick={() => set('price_hidden', !form.price_hidden)} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.price_hidden ? '#2C3A6B' : '#d1d5db', position: 'relative', transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'all 0.2s',
                    left: form.price_hidden ? 'calc(100% - 21px)' : 3,
                  }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2C3A6B', marginBottom: 4 }}>Photos</h2>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Add at least 1 photo. Photos are auto-compressed.</p>
              </div>

              <PhotoUpload
                photos={form.photos}
                onChange={photos => set('photos', photos)}
                maxPhotos={8}
                bucket="car-photos"
              />

              {errors.photos && <p style={err}>{errors.photos}</p>}
              {errors.submit && (
                <div style={{ padding: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#ef4444' }}>{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {step > 1 && (
              <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length ? (
              <button onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#2C3A6B', color: '#D4A843', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={16} />}
                {loading ? 'Submitting…' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, color: '#2C3A6B', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' as const }
const sel: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 14, color: '#2C3A6B', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' as const, cursor: 'pointer' }
const err: React.CSSProperties = { fontSize: 12, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }