'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Car, MapPin, DollarSign, Image, CheckCircle,
  ChevronRight, ChevronLeft, AlertCircle, Loader2, ArrowLeft,
} from 'lucide-react'
import PhotoUpload from '@/components/owner/PhotoUpload'

const STEPS = [
  { id: 1, label: 'Details', icon: Car },
  { id: 2, label: 'Features', icon: CheckCircle },
  { id: 3, label: 'Pricing', icon: DollarSign },
  { id: 4, label: 'Photos', icon: Image },
]

interface FormData {
  brand: string; model: string; year: number
  car_type: string; seats: number; doors: number
  transmission: string; fuel_type: string
  color: string; description: string
  lat: string; lng: string; km_limit: string
  price_per_day: number; price_per_week: number; price_per_month: number
  price_hidden: boolean
  ac: boolean; gps: boolean; bluetooth: boolean
  backup_camera: boolean; child_seat_available: boolean
  photos: string[]
}

export default function EditCarPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [originalName, setOriginalName] = useState('')

  const [form, setForm] = useState<FormData>({
    brand: '', model: '', year: new Date().getFullYear(),
    car_type: 'Sedan', seats: 5, doors: 4,
    transmission: 'automatic', fuel_type: 'petrol',
    color: '', description: '',
    lat: '', lng: '', km_limit: '',
    price_per_day: 0, price_per_week: 0, price_per_month: 0,
    price_hidden: false,
    ac: false, gps: false, bluetooth: false,
    backup_camera: false, child_seat_available: false,
    photos: [],
  })

  useEffect(() => { loadCar() }, [id])

  const loadCar = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }

    setOriginalName(data.name || `${data.brand} ${data.model} ${data.year}`)
    setForm({
      brand:        data.brand || '',
      model:        data.model || '',
      year:         data.year || new Date().getFullYear(),
      car_type:     data.car_type || 'Sedan',
      seats:        data.seats || 5,
      doors:        data.doors || 4,
      transmission: data.transmission || 'automatic',
      fuel_type:    data.fuel_type || 'petrol',
      color:        data.color || '',
      description:  data.description || '',
      lat:          data.lat != null ? String(data.lat) : '',
      lng:          data.lng != null ? String(data.lng) : '',
      km_limit:     data.km_limit != null ? String(data.km_limit) : '',
      price_per_day:   data.price_per_day || 0,
      price_per_week:  data.price_per_week || 0,
      price_per_month: data.price_per_month || 0,
      price_hidden:    data.price_hidden ?? false,
      ac:                   data.ac ?? false,
      gps:                  data.gps ?? false,
      bluetooth:            data.bluetooth ?? false,
      backup_camera:        data.backup_camera ?? false,
      child_seat_available: data.child_seat_available ?? false,
      photos: data.photos || [],
    })
    setLoading(false)
  }

  const set = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (s: number): boolean => {
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

  const handleSave = async () => {
    if (!validate(4)) return
    setSaving(true)
    try {
      const carName = `${form.brand} ${form.model} ${form.year}`
      const { error } = await supabase
        .from('cars')
        .update({
          name:                 carName,
          name_en:              carName,
          brand:                form.brand,
          model:                form.model,
          year:                 form.year,
          seats:                form.seats,
          doors:                form.doors,
          transmission:         form.transmission,
          fuel_type:            form.fuel_type,
          description:          form.description || null,
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
          status:               'unavailable',
          updated_at:           new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      await supabase.from('admin_notifications').insert({
        type: 'car_updated',
        category: 'listing',
        title: 'Car Updated — Pending Re-Review',
        body: `"${carName}" was edited by the owner and needs re-approval.`,
        link: '/admin/cars/pending',
        priority: 'normal',
        read: false,
      })

      setSaved(true)
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2C3A6B] animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#2C3A6B] mb-2">Car not found</h2>
        <p className="text-gray-500 mb-6">This car doesn't exist or you don't have permission to edit it.</p>
        <button onClick={() => router.push(`/${locale}/owner/listings`)}
          className="bg-[#2C3A6B] text-white px-6 py-3 rounded-xl font-medium text-sm">
          Back to My Listings
        </button>
      </div>
    </div>
  )

  if (saved) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Changes Saved!
        </h1>
        <p className="text-gray-600 mb-2">
          <strong>"{form.brand} {form.model} {form.year}"</strong> has been updated and sent for review.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Our team will review your changes within <strong>48 hours</strong>.
        </p>
        <div className="flex gap-3">
          <button onClick={() => router.push(`/${locale}/owner/listings`)}
            className="flex-1 bg-[#2C3A6B] text-white py-3 rounded-xl font-medium text-sm">
            My Listings
          </button>
          <button onClick={() => { setSaved(false); setStep(1) }}
            className="flex-1 border-2 border-[#2C3A6B] text-[#2C3A6B] py-3 rounded-xl font-medium text-sm">
            Edit Again
          </button>
        </div>
      </div>
    </div>
  )

  const inputCls = `w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2C3A6B] bg-white transition-colors`
  const labelCls = `block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide`

  const FEATURES = [
    { key: 'ac',                   label: 'Air Conditioning', emoji: '❄️' },
    { key: 'gps',                  label: 'GPS Navigation',   emoji: '🧭' },
    { key: 'bluetooth',            label: 'Bluetooth',        emoji: '🎵' },
    { key: 'backup_camera',        label: 'Backup Camera',    emoji: '📷' },
    { key: 'child_seat_available', label: 'Child Seat',       emoji: '👶' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push(`/${locale}/owner/listings`)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2C3A6B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Edit Car
            </h1>
            {originalName && <p className="text-xs text-gray-500">{originalName}</p>}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => isDone && setStep(s.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${
                    isActive ? 'bg-[#2C3A6B] text-white' :
                    isDone ? 'bg-green-50 text-green-600 cursor-pointer' :
                    'text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-2 h-px bg-gray-200 flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Car Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Brand *</label>
                <input value={form.brand} onChange={e => set('brand', e.target.value)}
                  placeholder="Toyota, BMW..." className={inputCls} />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
              </div>
              <div>
                <label className={labelCls}>Model *</label>
                <input value={form.model} onChange={e => set('model', e.target.value)}
                  placeholder="Camry, X5..." className={inputCls} />
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Year</label>
                <input type="number" min={2000} max={2030} value={form.year}
                  onChange={e => set('year', parseInt(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <input value={form.color} onChange={e => set('color', e.target.value)}
                  placeholder="White, Black..." className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Seats</label>
                <select value={form.seats} onChange={e => set('seats', parseInt(e.target.value))} className={inputCls}>
                  {[2,4,5,6,7,8,9,12].map(n => <option key={n} value={n}>{n} seats</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Transmission</label>
                <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className={inputCls}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Fuel</label>
                <select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} className={inputCls}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Describe the car..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Daily KM Limit</label>
              <input type="number" min={0} value={form.km_limit}
                onChange={e => set('km_limit', e.target.value)}
                placeholder="Leave blank for unlimited" className={inputCls} />
            </div>
          </div>
        )}

        {/* Step 2 — Features */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Features
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(f => (
                <button key={f.key} type="button"
                  onClick={() => set(f.key as keyof FormData, !(form as any)[f.key])}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
                    (form as any)[f.key]
                      ? 'border-[#2C3A6B] bg-[#2C3A6B]/5 text-[#2C3A6B] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <span className="text-base">{f.emoji}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Pricing */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Pricing (EGP)
            </h2>
            <div>
              <label className={labelCls}>Price per Day *</label>
              <input type="number" min={0} value={form.price_per_day || ''}
                onChange={e => set('price_per_day', parseFloat(e.target.value) || 0)}
                placeholder="0" className={inputCls} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className={labelCls}>Price per Week</label>
              <input type="number" min={0} value={form.price_per_week || ''}
                onChange={e => set('price_per_week', parseFloat(e.target.value) || 0)}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Price per Month</label>
              <input type="number" min={0} value={form.price_per_month || ''}
                onChange={e => set('price_per_month', parseFloat(e.target.value) || 0)}
                placeholder="0" className={inputCls} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.price_hidden}
                onChange={e => set('price_hidden', e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Hide price (show "Price on Request")</span>
            </label>
          </div>
        )}

        {/* Step 4 — Photos */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Photos
            </h2>
            <PhotoUpload photos={form.photos} onChange={photos => set('photos', photos)} />
            {errors.photos && <p className="text-xs text-red-500">{errors.photos}</p>}
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> Saving changes will send your listing back for review. It will be hidden until our team approves it (usually within 48 hours).
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={prevStep}
              className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#2C3A6B] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button onClick={() => router.push(`/${locale}/owner/listings`)}
              className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#2C3A6B] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-[#2C3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#1e2a4f] transition-colors">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-white rounded-xl text-sm font-semibold hover:bg-[#b8922e] disabled:opacity-60 transition-colors">
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
