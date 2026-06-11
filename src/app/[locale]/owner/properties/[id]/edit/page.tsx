'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Building2, MapPin, DollarSign, Image, CheckCircle,
  ChevronRight, ChevronLeft, AlertCircle, Loader2, ArrowLeft,
} from 'lucide-react'
import PhotoUpload from '@/components/owner/PhotoUpload'

const AMENITIES_LIST = [
  { id: 'wifi',          label: 'WiFi',              emoji: '📶' },
  { id: 'ac',            label: 'Air Conditioning',  emoji: '❄️' },
  { id: 'pool',          label: 'Swimming Pool',     emoji: '🏊' },
  { id: 'parking',       label: 'Parking',           emoji: '🅿️' },
  { id: 'security',      label: 'Security / Guard',  emoji: '🛡️' },
  { id: 'sea_view',      label: 'Sea View',          emoji: '🌊' },
  { id: 'balcony',       label: 'Balcony / Terrace', emoji: '🌅' },
  { id: 'elevator',      label: 'Elevator',          emoji: '🛗' },
  { id: 'gym',           label: 'Gym',               emoji: '💪' },
  { id: 'kitchen',       label: 'Full Kitchen',      emoji: '🍳' },
  { id: 'washer',        label: 'Washing Machine',   emoji: '🫧' },
  { id: 'dishwasher',    label: 'Dishwasher',        emoji: '🍽️' },
  { id: 'tv',            label: 'Smart TV',          emoji: '📺' },
  { id: 'water_heater',  label: 'Water Heater',      emoji: '🚿' },
  { id: 'bathtub',       label: 'Bathtub',           emoji: '🛁' },
  { id: 'breakfast',     label: 'Breakfast Included',emoji: '☕' },
  { id: 'cleaning',      label: 'Cleaning Service',  emoji: '🧹' },
  { id: 'crib',          label: 'Baby Crib',         emoji: '👶' },
  { id: 'pets_allowed',  label: 'Pets Allowed',      emoji: '🐾' },
  { id: 'smoking_allowed', label: 'Smoking Allowed', emoji: '🚬' },
]

const AREAS = [
  { id: 'naama_bay',  label: 'Naama Bay' },
  { id: 'sharks_bay', label: 'Sharks Bay' },
  { id: 'hadaba',     label: 'Hadaba' },
  { id: 'montazah',   label: 'Montazah' },
  { id: 'nabq',       label: 'Nabq Bay' },
  { id: 'um_el_sid',  label: 'Um El Sid' },
  { id: 'el_salam',   label: 'El Salam' },
  { id: 'old_market', label: 'Old Market' },
]

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', 'Chalet', 'Penthouse', 'Duplex']

const STEPS = [
  { id: 1, label: 'Location',  icon: MapPin },
  { id: 2, label: 'Details',   icon: Building2 },
  { id: 3, label: 'Amenities', icon: CheckCircle },
  { id: 4, label: 'Pricing',   icon: DollarSign },
  { id: 5, label: 'Photos',    icon: Image },
]

interface FormData {
  area: string; compound_id: string; building_number: string
  street_name: string; lat: string; lng: string; km_from_sea: string
  title: string; description: string
  property_type: string; bedrooms: number; bathrooms: number
  max_guests: number
  amenities: Record<string, boolean>
  price_per_night: number; price_per_week: number
  price_per_month: number; price_hidden: boolean
  photos: string[]
}

export default function EditPropertyPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [originalTitle, setOriginalTitle] = useState('')

  const [form, setForm] = useState<FormData>({
    area: '', compound_id: '', building_number: '', street_name: '',
    lat: '', lng: '', km_from_sea: '',
    title: '', description: '',
    property_type: 'Apartment', bedrooms: 1, bathrooms: 1,
    max_guests: 2,
    amenities: {},
    price_per_night: 0, price_per_week: 0, price_per_month: 0,
    price_hidden: true, photos: [],
  })

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }

    setOriginalTitle(data.title || data.name || '')
    setForm({
      area:           data.area || '',
      compound_id:    data.compound_id || '',
      building_number: data.building_number || '',
      street_name:    data.street_name || '',
      lat:            data.lat != null ? String(data.lat) : '',
      lng:            data.lng != null ? String(data.lng) : '',
      km_from_sea:    data.km_from_sea != null ? String(data.km_from_sea) : '',
      title:          data.title || data.name || '',
      description:    data.description || '',
      property_type:  data.type
        ? data.type.charAt(0).toUpperCase() + data.type.slice(1)
        : 'Apartment',
      bedrooms:       data.bedrooms || 1,
      bathrooms:      data.bathrooms || 1,
      max_guests:     data.max_guests || 2,
      amenities:      (data.amenities as Record<string, boolean>) || {},
      price_per_night:  data.price_per_night || 0,
      price_per_week:   data.price_per_week || 0,
      price_per_month:  data.price_per_month || 0,
      price_hidden:     data.price_hidden ?? true,
      photos:           data.photos || [],
    })
    setLoading(false)
  }

  const set = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const toggleAmenity = (aid: string) => {
    setForm(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [aid]: !prev.amenities[aid] },
    }))
  }

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 2) {
      if (!form.title.trim()) errs.title = 'Title is required'
      if (!form.description.trim()) errs.description = 'Description is required'
      if (form.description.split(' ').length < 10) errs.description = 'Description must be at least 10 words'
    }
    if (s === 4) {
      if (!form.price_per_night && !form.price_per_month) errs.price = 'Enter at least one price'
    }
    if (s === 5) {
      if (form.photos.length < 1) errs.photos = 'Please add at least 1 photo'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => { if (validate(step)) setStep(s => s + 1) }
  const prevStep = () => setStep(s => s - 1)

  const handleSave = async () => {
    if (!validate(5)) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title:           form.title,
          name:            form.title,
          description:     form.description,
          area:            form.area || null,
          compound_id:     form.compound_id || null,
          building_number: form.building_number || null,
          street_name:     form.street_name || null,
          lat:             form.lat ? parseFloat(form.lat) : null,
          lng:             form.lng ? parseFloat(form.lng) : null,
          km_from_sea:     form.km_from_sea ? parseFloat(form.km_from_sea) : null,
          type:            form.property_type.toLowerCase(),
          bedrooms:        form.bedrooms,
          bathrooms:       form.bathrooms,
          max_guests:      form.max_guests,
          amenities:       form.amenities,
          price_per_night: form.price_per_night || null,
          price_per_week:  form.price_per_week || null,
          price_per_month: form.price_per_month || null,
          price_hidden:    form.price_hidden,
          photos:          form.photos,
          review_status:   'pending_review',
          status:          'unavailable',
          updated_at:      new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      await supabase.from('admin_notifications').insert({
        type: 'property_updated',
        category: 'listing',
        title: 'Property Updated — Pending Re-Review',
        body: `"${form.title}" was edited by the owner and needs re-approval.`,
        link: '/admin/properties/pending',
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
        <h2 className="text-xl font-bold text-[#2C3A6B] mb-2">Property not found</h2>
        <p className="text-gray-500 mb-6">This property doesn't exist or you don't have permission to edit it.</p>
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
          <strong>"{form.title}"</strong> has been updated and sent for review.
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
              Edit Property
            </h1>
            {originalTitle && (
              <p className="text-xs text-gray-500">{originalTitle}</p>
            )}
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

        {/* Step 1 — Location */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Location
            </h2>
            <div>
              <label className={labelCls}>Area</label>
              <select value={form.area} onChange={e => set('area', e.target.value)} className={inputCls}>
                <option value="">Select area...</option>
                {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
            </div>
            <div>
              <label className={labelCls}>Building Number / Address</label>
              <input value={form.building_number} onChange={e => set('building_number', e.target.value)}
                placeholder="e.g. Building 5, Block A" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Street Name</label>
              <input value={form.street_name} onChange={e => set('street_name', e.target.value)}
                placeholder="Street name (optional)" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Latitude</label>
                <input value={form.lat} onChange={e => set('lat', e.target.value)}
                  placeholder="e.g. 27.9158" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Longitude</label>
                <input value={form.lng} onChange={e => set('lng', e.target.value)}
                  placeholder="e.g. 34.3285" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Distance from Sea (km)</label>
              <input value={form.km_from_sea} onChange={e => set('km_from_sea', e.target.value)}
                placeholder="e.g. 0.5" className={inputCls} type="number" step="0.1" min="0" />
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Property Details
            </h2>
            <div>
              <label className={labelCls}>Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Spacious sea-view apartment in Naama Bay" className={inputCls} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className={labelCls}>Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={5} placeholder="Describe your property..." className={inputCls} />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className={labelCls}>Property Type</label>
              <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={inputCls}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Bedrooms</label>
                <input type="number" min={0} max={20} value={form.bedrooms}
                  onChange={e => set('bedrooms', parseInt(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Bathrooms</label>
                <input type="number" min={1} max={20} value={form.bathrooms}
                  onChange={e => set('bathrooms', parseInt(e.target.value) || 1)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max Guests</label>
                <input type="number" min={1} max={30} value={form.max_guests}
                  onChange={e => set('max_guests', parseInt(e.target.value) || 1)} className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Amenities */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Amenities
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES_LIST.map(a => (
                <button key={a.id} type="button"
                  onClick={() => toggleAmenity(a.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm text-left transition-all ${
                    form.amenities[a.id]
                      ? 'border-[#2C3A6B] bg-[#2C3A6B]/5 text-[#2C3A6B] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  <span className="text-base">{a.emoji}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Pricing */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Pricing (EGP)
            </h2>
            <div>
              <label className={labelCls}>Price per Night</label>
              <input type="number" min={0} value={form.price_per_night || ''}
                onChange={e => set('price_per_night', parseFloat(e.target.value) || 0)}
                placeholder="0" className={inputCls} />
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
            {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.price_hidden}
                onChange={e => set('price_hidden', e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Hide price (show "Price on Request")</span>
            </label>
          </div>
        )}

        {/* Step 5 — Photos */}
        {step === 5 && (
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

          {step < 5 ? (
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
