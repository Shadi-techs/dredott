'use client'
// ============================================
// DredottSTAY — Admin Property Editor
// 6 tabs: Details, Photos, Amenities, Calendar,
//         Reviews, Owner
// ============================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Save, Eye, Share2, Trash2, Plus, X, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { Property } from '@/types'

const TABS = ['Details & Pricing', 'Photos & Media', 'Amenities', 'Calendar', 'Reviews', 'Owner']

const propertySchema = z.object({
  name: z.string().min(3, 'Required'),
  name_ar: z.string().optional(),
  name_it: z.string().optional(),
  name_ru: z.string().optional(),
  name_de: z.string().optional(),
  description: z.string().min(20, 'Min 20 characters'),
  area: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  status: z.string(),
  bedrooms: z.number().min(1),
  max_guests: z.number().min(1),
  price_per_night: z.number().min(1),
  price_per_week: z.number().optional(),
  price_per_month: z.number().optional(),
  price_per_3months: z.number().optional(),
  price_per_6months: z.number().optional(),
  utilities_per_month: z.number().default(0),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  video_tour_url: z.string().optional(),
  walkthrough_url: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

const AREAS = ['naama_bay', 'sharks_bay', 'old_market', 'ras_um_sid', 'hadaba', 'montazah', 'nabq']
const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay', sharks_bay: 'Sharks Bay', old_market: 'Old Market',
  ras_um_sid: 'Ras Um Sid', hadaba: 'Hadaba', montazah: 'Montazah', nabq: 'Nabq',
}

const DEFAULT_AMENITIES = [
  'wifi', 'ac', 'kitchen', 'tv', 'washing_machine',
  'pool_access', 'balcony', 'sea_view', 'parking', 'security_24h'
]
const OPTIONAL_AMENITIES = [
  'beach_access', 'baby_cot', 'kid_friendly', 'snorkeling_gear',
  'bbq_area', 'garden_view', 'elevator', 'gym_access', 'daily_cleaning', 'airport_transfer'
]
const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi', ac: 'A/C', kitchen: 'Kitchen', tv: 'TV', washing_machine: 'Washing machine',
  pool_access: 'Pool access', balcony: 'Balcony', sea_view: 'Sea view', parking: 'Parking',
  security_24h: 'Security 24/7', beach_access: 'Beach access', baby_cot: 'Baby cot',
  kid_friendly: 'Kid-friendly', snorkeling_gear: 'Snorkeling gear', bbq_area: 'BBQ area',
  garden_view: 'Garden view', elevator: 'Elevator', gym_access: 'Gym access',
  daily_cleaning: 'Daily cleaning', airport_transfer: 'Airport transfer',
}

interface AdminPropertyEditorProps {
  property?: Property
  reviews?: any[]
  isSuperAdmin: boolean
  pendingReviewsCount: number
}

export default function AdminPropertyEditor({
  property, reviews = [], isSuperAdmin, pendingReviewsCount
}: AdminPropertyEditorProps) {
  const supabase = createClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [amenities, setAmenities] = useState<Record<string, boolean>>(
    (property?.amenities as unknown as Record<string, boolean> | undefined) || Object.fromEntries([...DEFAULT_AMENITIES, ...OPTIONAL_AMENITIES].map(k => [k, false]))
  )

  const isNew = !property

  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: property ? {
      name: property.name,
      name_ar: property.name_ar || '',
      name_it: property.name_it || '',
      name_ru: property.name_ru || '',
      name_de: property.name_de || '',
      description: property.description || '',
      area: property.area,
      type: property.type,
      status: property.status,
      bedrooms: property.bedrooms,
      max_guests: property.max_guests,
      price_per_night: property.price_per_night,
      price_per_week: property.price_per_week,
      price_per_month: property.price_per_month,
      price_per_3months: property.price_per_3months,
      price_per_6months: property.price_per_6months,
      utilities_per_month: property.utilities_per_month,
      meta_title: property.meta_title || '',
      meta_description: property.meta_description || '',
      video_tour_url: property.video_tour_url || '',
      walkthrough_url: property.walkthrough_url || '',
    } : { status: 'available', bedrooms: 2, max_guests: 4 }
  })

  const onSave = async (data: PropertyFormData) => {
    setSaving(true)
    try {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const payload = { ...data, amenities, slug, view_count: property?.view_count || 0 }

      if (isNew) {
        const { data: newProp, error } = await supabase.from('properties').insert(payload).select('slug').single()
        if (error) throw error
        router.push(`/admin/properties/${newProp.slug}`)
      } else {
        const { error } = await supabase.from('properties').update(payload).eq('id', property!.id)
        if (error) throw error
      }
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleAmenity = (key: string) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const approveReview = async (reviewId: string) => {
    await supabase.from('reviews').update({ status: 'approved' }).eq('id', reviewId)
    router.refresh()
  }

  const rejectReview = async (reviewId: string) => {
    await supabase.from('reviews').update({ status: 'rejected' }).eq('id', reviewId)
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-[#D4A843]/20 px-5 py-3 flex items-center gap-3 flex-wrap">
        <Link href="/admin/properties" className="text-[#A0A8B4] hover:text-[#2C3A6B] flex items-center gap-1 text-sm">
          <ChevronLeft size={15} /> Properties
        </Link>
        <h1 className="text-sm font-medium text-[#2C3A6B] flex-1">
          {isNew ? 'Add new property' : property?.name}
        </h1>
        <div className="flex gap-2">
          {!isNew && (
            <>
              <a href={`/en/properties/${property?.slug}`} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                <Eye size={12} /> Preview
              </a>
              <button className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                <Share2 size={12} /> Share with owner
              </button>
              {isSuperAdmin && (
                <button className="text-[#E24B4A] border border-[#E24B4A]/40 text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 hover:bg-[#FCEBEB] transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </>
          )}
          <button onClick={(handleSubmit as any)(onSave)} disabled={saving}
            className="btn-primary text-xs py-1.5 flex items-center gap-1 disabled:opacity-60">
            <Save size={12} /> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#D4A843]/20 px-5 flex overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === i ? 'text-[#2C3A6B] border-[#B8860B]' : 'text-[#A0A8B4] border-transparent hover:text-[#2C3A6B]'
            }`}>
            {tab}
            {tab === 'Reviews' && pendingReviewsCount > 0 && (
              <span className="ml-1.5 bg-[#E24B4A] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingReviewsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* TAB 0 — Details & Pricing */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic info */}
            <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D4A843]/20">
                <span className="text-sm font-medium text-[#2C3A6B]">Basic info</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">PROPERTY NAME (EN)</label>
                  <input {...register('name')} placeholder="Naama Bay Apartment" className="input-field" />
                  {errors.name && <p className="text-xs text-[#E24B4A] mt-1">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[{field: 'name_ar', lang: 'AR'}, {field: 'name_it', lang: 'IT'}, {field: 'name_ru', lang: 'RU'}, {field: 'name_de', lang: 'DE'}].map(({field, lang}) => (
                    <div key={field}>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">NAME ({lang})</label>
                      <input {...register(field as any)} placeholder={`Name in ${lang}`} className="input-field text-xs" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">AREA</label>
                    <select {...register('area')} className="input-field">
                      <option value="">Select area...</option>
                      {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a]}</option>)}
                    </select>
                    {errors.area && <p className="text-xs text-[#E24B4A] mt-1">{errors.area.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">TYPE</label>
                    <select {...register('type')} className="input-field">
                      <option value="">Select type...</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="studio">Studio</option>
                      <option value="chalet">Chalet</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">BEDROOMS</label>
                    <input {...register('bedrooms', {valueAsNumber: true})} type="number" min={1} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">MAX GUESTS</label>
                    <input {...register('max_guests', {valueAsNumber: true})} type="number" min={1} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">STATUS</label>
                    <select {...register('status')} className="input-field">
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="coming_soon">Coming soon</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">DESCRIPTION (EN)</label>
                  <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Describe the property..." />
                  {errors.description && <p className="text-xs text-[#E24B4A] mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#D4A843]/20">
                  <span className="text-sm font-medium text-[#2C3A6B]">Pricing (USD)</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    {field: 'price_per_night', label: 'Per night'},
                    {field: 'price_per_week', label: 'Per week'},
                    {field: 'price_per_month', label: 'Per month'},
                    {field: 'price_per_3months', label: '3 months'},
                    {field: 'price_per_6months', label: '6 months (max)'},
                    {field: 'utilities_per_month', label: 'Utilities/month'},
                  ].map(({field, label}) => (
                    <div key={field}>
                      <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">{label.toUpperCase()}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A8B4] text-sm">$</span>
                        <input
                          {...register(field as any, {valueAsNumber: true})}
                          type="number"
                          min={0}
                          step={0.01}
                          className="input-field pl-7"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#D4A843]/20">
                  <span className="text-sm font-medium text-[#2C3A6B]">SEO</span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">META TITLE</label>
                    <input {...register('meta_title')} className="input-field" placeholder="Property name — DredottStay" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">META DESCRIPTION</label>
                    <textarea {...register('meta_description')} rows={2} className="input-field resize-none" placeholder="160 characters max..." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1 — Photos & Media */}
        {activeTab === 1 && (
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center justify-between">
              <span className="text-sm font-medium text-[#2C3A6B]">Photos</span>
              <button className="btn-primary text-xs py-1.5 flex items-center gap-1">
                <Plus size={12} /> Add photos
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {(property?.photos || []).map((photo, i) => (
                  <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#E24B4A]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} className="text-white" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1.5 left-1.5 bg-[#2C3A6B]/80 text-[#D4A843] text-[10px] px-1.5 py-0.5 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-[#D4A843]/40 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#B8860B] hover:bg-[#FBF0D0] transition-colors">
                  <Plus size={18} className="text-[#D4A843]" />
                  <span className="text-[10px] text-[#A0A8B4]">Add photo</span>
                </div>
              </div>

              <div className="border-t border-[#D4A843]/20 pt-4">
                <p className="text-xs font-medium text-[#2C3A6B] mb-3">Videos (YouTube private links)</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">VIDEO TOUR URL</label>
                    <input {...register('video_tour_url')} placeholder="https://youtube.com/watch?v=..." className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">WALKTHROUGH URL</label>
                    <input {...register('walkthrough_url')} placeholder="https://youtube.com/watch?v=..." className="input-field" />
                  </div>
                </div>
                <p className="text-xs text-[#A0A8B4] mt-2">
                  YouTube private links — only visible to the person with the link. Not indexed on YouTube.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Amenities */}
        {activeTab === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D4A843]/20">
                <span className="text-sm font-medium text-[#2C3A6B]">Default amenities — always shown</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {DEFAULT_AMENITIES.map((key) => (
                  <div
                    key={key}
                    onClick={() => toggleAmenity(key)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      amenities[key]
                        ? 'bg-[#E1F5EE] border-[#2A9D8F] text-[#0F6E56]'
                        : 'bg-[#F8F8F8] border-[#D3D1C7] text-[#888780]'
                    }`}
                  >
                    <span className="text-xs font-medium">{AMENITY_LABELS[key]}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${amenities[key] ? 'bg-[#2A9D8F]' : 'bg-[#D3D1C7]'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${amenities[key] ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D4A843]/20">
                <span className="text-sm font-medium text-[#2C3A6B]">Optional extras — toggle to show on listing</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {OPTIONAL_AMENITIES.map((key) => (
                  <div
                    key={key}
                    onClick={() => toggleAmenity(key)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      amenities[key]
                        ? 'bg-[#E1F5EE] border-[#2A9D8F] text-[#0F6E56]'
                        : 'bg-[#F8F8F8] border-[#D3D1C7] text-[#888780]'
                    }`}
                  >
                    <span className="text-xs font-medium">{AMENITY_LABELS[key]}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${amenities[key] ? 'bg-[#2A9D8F]' : 'bg-[#D3D1C7]'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${amenities[key] ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — Calendar */}
        {activeTab === 3 && (
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20 flex items-center justify-between">
              <span className="text-sm font-medium text-[#2C3A6B]">Availability Calendar</span>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs py-1.5">Block dates</button>
                <button className="btn-primary text-xs py-1.5">Unblock</button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-3 flex-wrap mb-4 text-xs">
                {[
                  { color: '#FCEBEB', label: 'Manually blocked' },
                  { color: '#2A9D8F', label: 'Short-term booking' },
                  { color: '#2C3A6B', label: 'Long-term booking' },
                  { color: '#FAF9F6', label: 'Available', border: true },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm border border-[#D4A843]/20" style={{ background: l.color }} />
                    <span className="text-[#A0A8B4]">{l.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#A0A8B4] bg-[#FBF0D0] px-3 py-2 rounded-lg">
                Calendar dates are automatically blocked when a booking is confirmed and paid. Manual blocks can be added above.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4 — Reviews */}
        {activeTab === 4 && (
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20">
              <span className="text-sm font-medium text-[#2C3A6B]">Reviews ({reviews.length})</span>
            </div>
            <div className="divide-y divide-[#D4A843]/10">
              {reviews.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#2A9D8F] flex items-center justify-center text-xs font-medium text-white">
                      {r.profiles?.first_name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-[#2C3A6B]">{r.profiles?.first_name}</div>
                      <div className="text-[10px] text-[#A0A8B4]">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      r.status === 'approved' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                      r.status === 'edited_pending' ? 'bg-[#FCEBEB] text-[#A32D2D]' :
                      'bg-[#FBF0D0] text-[#8B6914]'
                    }`}>
                      {r.status === 'edited_pending' ? 'Edited — re-review' : r.status}
                    </span>
                  </div>

                  {/* Show old text for comparison if edited */}
                  {r.text_previous && (
                    <div className="mb-2 p-2.5 bg-[#FAF9F6] rounded-lg border border-[#D4A843]/20">
                      <p className="text-[10px] text-[#A0A8B4] mb-1">Previous (approved):</p>
                      <p className="text-xs text-[#888780] italic">{r.text_previous}</p>
                    </div>
                  )}

                  <p className="text-sm text-[#555] mb-3">{r.text}</p>

                  {['pending', 'edited_pending'].includes(r.status) && (
                    <div className="flex gap-2">
                      <button onClick={() => approveReview(r.id)}
                        className="bg-[#2A9D8F] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#228a7d] transition-colors">
                        ✓ Approve
                      </button>
                      <button onClick={() => rejectReview(r.id)}
                        className="bg-[#E24B4A] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#c03a39] transition-colors">
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-[#A0A8B4]">No reviews yet</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5 — Owner */}
        {activeTab === 5 && (
          <div className="bg-white border border-[#D4A843]/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D4A843]/20">
              <span className="text-sm font-medium text-[#2C3A6B]">Property Owner</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {property?.owner_id ? (
                <div className="bg-[#2C3A6B] rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#B8860B] flex items-center justify-center text-sm font-medium text-[#FFF8DC]">
                      K
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#FBF0D0]">Property Owner</div>
                      <div className="text-xs text-[#A0A8B4]">Owner portal access enabled</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[#B8860B] text-[#FFF8DC] text-xs px-3 py-1.5 rounded-lg">
                      Share portal link
                    </button>
                    {isSuperAdmin && (
                      <button className="border border-[#A0A8B4]/40 text-[#A0A8B4] text-xs px-3 py-1.5 rounded-lg">
                        Revoke access
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#D4A843]/40 rounded-lg p-6 text-center">
                  <p className="text-sm text-[#A0A8B4] mb-3">No owner assigned to this property</p>
                  <button className="btn-primary text-xs py-1.5 px-4">Assign owner</button>
                </div>
              )}

              {isSuperAdmin && (
                <div>
                  <label className="text-[10px] text-[#A0A8B4] font-medium tracking-widest block mb-1.5">COMMISSION RATE</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue={(property as any)?.commission_rate || 15} min={0} max={100}
                      className="input-field w-24" />
                    <span className="text-sm text-[#2C3A6B]">% to DREDOTT</span>
                    <span className="text-sm text-[#A0A8B4]">→</span>
                    <span className="text-sm text-[#2C3A6B] font-medium">
                      {100 - ((property as any)?.commission_rate || 15)}% to owner
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A8B4] mt-1">
                    Only Super Admin can change commission rates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
