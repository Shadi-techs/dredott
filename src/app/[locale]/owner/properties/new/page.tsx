// ============================================
// Add Property Form — v2
// Path: src/app/[locale]/owner/properties/new/page.tsx
// Updates:
//   - PhotoUpload replaces URL input
//   - Full amenities checklist (collected now, shown later)
//   - lat/lng field (required, not shown to visitors yet)
//   - km from sea (approximate)
//   - Listing limit check before submit
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Building2, MapPin, DollarSign, Image, Sparkles,
  ChevronRight, ChevronLeft, CheckCircle, Plus,
  AlertCircle, Loader2, Info, Navigation
} from 'lucide-react'
import PhotoUpload from '@/components/owner/PhotoUpload'

// ── All amenities — collected now, displayed later ──
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

interface Compound { id: string; name: string; area: string }

interface FormData {
  area: string; compound_id: string; building_number: string
  street_name: string; suggest_compound: string
  lat: string; lng: string; km_from_sea: string
  title: string; description: string; ai_description_draft: string
  property_type: string; bedrooms: number; bathrooms: number
  max_guests: number; floor_area: number
  amenities: Record<string, boolean>
  price_per_night: number; price_per_week: number
  price_per_month: number; price_hidden: boolean
  photos: string[]
}

export default function AddPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep]                     = useState(1)
  const [compounds, setCompounds]           = useState<Compound[]>([])
  const [loading, setLoading]               = useState(false)
  const [aiLoading, setAiLoading]           = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [showSuggest, setShowSuggest]       = useState(false)
  const [errors, setErrors]                 = useState<Record<string, string>>({})

  const [form, setForm] = useState<FormData>({
    area: '', compound_id: '', building_number: '', street_name: '',
    suggest_compound: '', lat: '', lng: '', km_from_sea: '',
    title: '', description: '', ai_description_draft: '',
    property_type: 'Apartment', bedrooms: 1, bathrooms: 1,
    max_guests: 2, floor_area: 0,
    amenities: {},
    price_per_night: 0, price_per_week: 0, price_per_month: 0,
    price_hidden: true, photos: [],
  })

  useEffect(() => { if (form.area) fetchCompounds() }, [form.area])

  const fetchCompounds = async () => {
    const { data } = await supabase
      .from('compounds').select('id, name, area')
      .eq('area_key', form.area).eq('is_active', true).order('sort_order')
    setCompounds(data || [])
  }

  const set = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const toggleAmenity = (id: string) => {
    setForm(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [id]: !prev.amenities[id] },
    }))
  }

  const generateAI = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/owner/ai-description', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type: form.property_type, area: form.area,
          bedrooms: form.bedrooms, bathrooms: form.bathrooms,
          max_guests: form.max_guests, floor_area: form.floor_area,
          title: form.title, amenities: form.amenities,
          km_from_sea: form.km_from_sea,
        }),
      })
      const data = await res.json()
      if (data.description) { set('ai_description_draft', data.description); set('description', data.description) }
    } finally { setAiLoading(false) }
  }

  const submitSuggestion = async () => {
    if (!form.suggest_compound.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('compound_suggestions').insert({
      owner_id: user.id, name: form.suggest_compound,
      area: form.area, status: 'pending',
    })
    setShowSuggest(false); set('suggest_compound', '')
    alert('Suggestion submitted! We\'ll review it within 24 hours.')
  }

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.area) errs.area = 'Please select an area'
      if (!form.compound_id && !form.building_number) errs.location = 'Select a compound or enter building number'
      if (!form.lat || !form.lng) errs.coordinates = 'Please enter your property coordinates (required for future map feature)'
    }
    if (s === 2) {
      if (!form.title.trim()) errs.title = 'Title is required'
      if (!form.description.trim()) errs.description = 'Description is required'
      if (form.description.split(' ').length < 20) errs.description = 'Description must be at least 20 words'
    }
    if (s === 4) {
      if (!form.price_per_night && !form.price_per_month) errs.price = 'Enter at least one price'
    }
    if (s === 5) {
      if (form.photos.length < 2) errs.photos = 'Please add at least 2 photos'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => { if (validate(step)) setStep(s => s + 1) }
  const prevStep = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    if (!validate(5)) return
    setLoading(true)

    // Check listing limit
    const limitRes = await fetch('/api/owner/check-limit')
    const limitData = await limitRes.json()
    if (!limitData.allowed) {
      setErrors({ submit: limitData.reason })
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('properties').insert({
        owner_id:             user.id,
        title:                form.title,
        description:          form.description,
        ai_description_draft: form.ai_description_draft || null,
        ai_description_used:  form.description === form.ai_description_draft,
        area:                 form.area,
        compound_id:          form.compound_id || null,
        building_number:      form.building_number || null,
        street_name:          form.street_name || null,
        lat:                  form.lat ? parseFloat(form.lat) : null,
        lng:                  form.lng ? parseFloat(form.lng) : null,
        km_from_sea:          form.km_from_sea ? parseFloat(form.km_from_sea) : null,
        type:                 form.property_type.toLowerCase(),
        bedrooms:             form.bedrooms,
        bathrooms:            form.bathrooms,
        max_guests:           form.max_guests,
        floor_area:           form.floor_area || null,
        amenities:            form.amenities,
        price_per_night:      form.price_per_night || null,
        price_per_week:       form.price_per_week || null,
        price_per_month:      form.price_per_month || null,
        price_hidden:         form.price_hidden,
        photos:               form.photos,
        city:                 'Sharm El-Sheikh',
        governorate:          'South Sinai',
        review_status:        'pending_review',
        status:               'unavailable',
      })

      if (error) throw error

      await supabase.from('admin_notifications').insert({
        type: 'property_pending',
        category: 'listing',
        title: 'New Property Pending Review',
        body: `"${form.title}" submitted and waiting for approval.`,
        link: '/admin/properties/pending',
        priority: 'normal',
        read: false,
      })

      setSubmitted(true)
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ───────────────────────────
  if (submitted) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#2C3A6B] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Property Submitted!
        </h1>
        <p className="text-gray-600 mb-2">
          <strong>"{form.title}"</strong> is now under review.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Our team will review it within <strong>48 hours</strong> and notify you by email.
        </p>
        <div className="flex gap-3">
          <button onClick={() => router.push('/en/owner/properties')}
            className="flex-1 bg-[#2C3A6B] text-white py-3 rounded-xl font-medium text-sm">
            My Properties
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1) }}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium text-sm">
            Add Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2C3A6B] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Add New Property
          </h1>
          <p className="text-sm text-gray-500">Step {step} of {STEPS.length} — {STEPS[step-1].label}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-[#2C3A6B] text-white' : isDone ? 'bg-green-50 text-green-600' : 'text-gray-400'
                }`}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 ${step > s.id ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

          {/* ── STEP 1: Location ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#2C3A6B]">Where is your property?</h2>

              {/* Area */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                  Area <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AREAS.map(a => (
                    <button key={a.id} onClick={() => { set('area', a.id); set('compound_id', '') }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        form.area === a.id ? 'bg-[#2C3A6B] border-[#2C3A6B] text-white' : 'border-gray-200 text-gray-700 hover:border-[#2C3A6B]'
                      }`}>
                      {a.label}
                    </button>
                  ))}
                </div>
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
              </div>

              {/* Compound */}
              {form.area && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                    Compound <span className="text-gray-400 font-sans normal-case">(optional)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    <button onClick={() => set('compound_id', '')}
                      className={`py-2.5 px-3 rounded-xl border text-xs text-left ${form.compound_id === '' ? 'bg-gray-100 border-gray-400 font-medium' : 'border-gray-200 text-gray-600'}`}>
                      Not in a compound
                    </button>
                    {compounds.map(c => (
                      <button key={c.id} onClick={() => set('compound_id', c.id)}
                        className={`py-2.5 px-3 rounded-xl border text-xs text-left ${form.compound_id === c.id ? 'bg-[#2C3A6B] border-[#2C3A6B] text-white' : 'border-gray-200 text-gray-700'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowSuggest(true)} className="mt-2 flex items-center gap-1.5 text-xs text-[#2A9D8F] hover:underline">
                    <Plus className="w-3 h-3" /> Can't find your compound? Suggest it
                  </button>
                  {showSuggest && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-700 mb-2">We'll review and add it within 24 hours.</p>
                      <div className="flex gap-2">
                        <input value={form.suggest_compound} onChange={e => set('suggest_compound', e.target.value)}
                          placeholder="Compound name"
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-xs focus:outline-none" />
                        <button onClick={submitSuggestion} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">Submit</button>
                        <button onClick={() => setShowSuggest(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual address */}
              {form.area && !form.compound_id && (
                <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Please provide your building details since you're not in a compound.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Building Number *</label>
                    <input value={form.building_number} onChange={e => set('building_number', e.target.value)}
                      placeholder="e.g. Building 7" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2C3A6B]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Street Name *</label>
                    <input value={form.street_name} onChange={e => set('street_name', e.target.value)}
                      placeholder="e.g. Al Salam Street" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2C3A6B]" />
                  </div>
                </div>
              )}

              {/* Coordinates */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2 mb-3">
                  <Navigation className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">Property Coordinates <span className="text-red-400">*</span></p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Open Google Maps, right-click your property → "What's here?" → copy the coordinates.
                      This will be used for our map feature.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input value={form.lat} onChange={e => set('lat', e.target.value)}
                      placeholder="e.g. 27.9158"
                      className="w-full px-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input value={form.lng} onChange={e => set('lng', e.target.value)}
                      placeholder="e.g. 34.3293"
                      className="w-full px-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                {errors.coordinates && <p className="text-red-500 text-xs mt-2">{errors.coordinates}</p>}
              </div>

              {/* Distance from sea */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                  Approximate distance from sea
                </label>
                <div className="flex items-center gap-3">
                  <input type="number" value={form.km_from_sea || ''} onChange={e => set('km_from_sea', e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-32 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2C3A6B]" />
                  <span className="text-sm text-gray-500">km from the sea</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Used to help guests find sea-view and beachfront properties.</p>
              </div>

              {errors.location && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.location}</p>}
            </div>
          )}

          {/* ── STEP 2: Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#2C3A6B]">Tell us about your property</h2>

              {/* Type */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t} onClick={() => set('property_type', t)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${form.property_type === t ? 'bg-[#2C3A6B] border-[#2C3A6B] text-white' : 'border-gray-200 text-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
                  Listing Title <span className="text-red-400">*</span>
                </label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Cozy Sea-View Studio in Naama Bay"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2C3A6B]" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Bedrooms', field: 'bedrooms' as const, min: 0, max: 20 },
                  { label: 'Bathrooms', field: 'bathrooms' as const, min: 1, max: 10 },
                  { label: 'Max Guests', field: 'max_guests' as const, min: 1, max: 30 },
                  { label: 'Area (m²)', field: 'floor_area' as const, min: 0, max: 2000 },
                ].map(({ label, field, min, max }) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => set(field, Math.max(min, (form[field] as number) - 1))}
                        className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-sm font-bold">−</button>
                      <span className="flex-1 text-center text-sm font-medium text-[#2C3A6B]">{form[field]}</span>
                      <button onClick={() => set(field, Math.min(max, (form[field] as number) + 1))}
                        className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-sm font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-500">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <button onClick={generateAI} disabled={aiLoading || !form.title}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium disabled:opacity-50">
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {aiLoading ? 'Generating…' : 'AI Write'}
                  </button>
                </div>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
                  placeholder="Describe your property — views, amenities, nearby attractions…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2C3A6B] resize-none" />
                <div className="flex items-center justify-between mt-1">
                  {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
                  <span className="text-xs text-gray-400">{form.description.split(' ').filter(Boolean).length} words</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Amenities ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-[#2C3A6B] mb-1">What does your property offer?</h2>
                <p className="text-xs text-gray-500">Select all that apply. These help guests find your property and will appear on your listing.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_LIST.map(a => {
                  const isSelected = !!form.amenities[a.id]
                  return (
                    <button key={a.id} onClick={() => toggleAmenity(a.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected ? 'bg-[#2C3A6B] border-[#2C3A6B] text-white' : 'border-gray-200 text-gray-700 hover:border-[#2C3A6B]'
                      }`}>
                      <span className="text-base flex-shrink-0">{a.emoji}</span>
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-gray-400">
                Selected: {Object.values(form.amenities).filter(Boolean).length} amenities
              </p>
            </div>
          )}

          {/* ── STEP 4: Pricing ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#2C3A6B]">Set your prices</h2>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700">Prices are in <strong>EGP</strong>. Enter at least one price (nightly or monthly).</p>
              </div>

              {[
                { label: 'Price per night', field: 'price_per_night' as const, suffix: 'EGP / night' },
                { label: 'Price per week',  field: 'price_per_week' as const,  suffix: 'EGP / week' },
                { label: 'Price per month', field: 'price_per_month' as const, suffix: 'EGP / month' },
              ].map(({ label, field, suffix }) => (
                <div key={field}>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">{label}</label>
                  <div className="relative">
                    <input type="number" min={0} value={form[field] || ''} onChange={e => set(field, Number(e.target.value))}
                      placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2C3A6B] pr-28" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
                  </div>
                </div>
              ))}

              {errors.price && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.price}</p>}

              {/* Price visibility toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-[#2C3A6B]">Hide price until login</p>
                  <p className="text-xs text-gray-500 mt-0.5">Visitors must register to see the price (recommended)</p>
                </div>
                <button onClick={() => set('price_hidden', !form.price_hidden)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.price_hidden ? 'bg-[#2C3A6B]' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.price_hidden ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Photos ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-[#2C3A6B] mb-1">Add photos</h2>
                <p className="text-xs text-gray-500">At least 2 photos required. Photos are auto-compressed for fast loading.</p>
              </div>

              <PhotoUpload
                photos={form.photos}
                onChange={(photos) => set('photos', photos)}
                maxPhotos={10}
                bucket="property-photos"
              />

              {errors.photos && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.photos}
                </p>
              )}

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-xs">{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-5 border-t border-gray-100">
            {step > 1 && (
              <button onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < STEPS.length ? (
              <button onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-[#2C3A6B] text-white rounded-xl text-sm font-medium hover:bg-[#243058]">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#2C3A6B] text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Submitting…' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}