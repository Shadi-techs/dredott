// ============================================
// Add Property Form - v10
// Path: src/app/[locale]/admin/properties/new/page.tsx
// ============================================

'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Save, Upload, Star, Lock, Users, CheckCircle } from 'lucide-react'

export default function AddPropertyPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    area: 'naama_bay',
    type: 'apartment',
    status: 'available',
    bedrooms: 1,
    max_guests: 2,
    price_per_night: 0,
    price_per_week: 0,
    price_per_month: 0,
    price_hidden: false,
    platform_managed: true,
    internal_score: 5,
    verified_location: false,
    verified_photos: false,
    legal_docs_checked: false,
    internal_notes: '',
    description: '',
    photos: [] as string[],
    cover_image_index: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('properties').insert([
      {
        ...formData,
        view_count: 0,
        wifi: false,
        ac: false,
        kitchen: false,
        tv: false,
        washing_machine: false,
        pool_access: false,
        balcony: false,
        sea_view: false,
        parking: false,
        security_24h: false,
        beach_access: false,
        baby_cot: false,
        kid_friendly: false,
        snorkeling_gear: false,
        bbq_area: false,
        garden_view: false,
        elevator: false,
        gym_access: false,
        daily_cleaning: false,
        airport_transfer: false,
      }
    ])

    if (!error) {
      router.push('/en/admin/properties')
    }
    
    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-1">Create a new property listing with v10 features</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Luxury Apartment Naama Bay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="luxury-apartment-naama-bay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="naama_bay">Naama Bay</option>
                <option value="sharks_bay">Sharks Bay</option>
                <option value="old_market">Old Market</option>
                <option value="ras_um_sid">Ras Um Sid</option>
                <option value="hadaba">Hadaba</option>
                <option value="montazah">Montazah</option>
                <option value="nabq">Nabq</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="chalet">Chalet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
              <input
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price/Night (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price/Week (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.price_per_week}
                onChange={(e) => setFormData({ ...formData, price_per_week: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price/Month (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.price_per_month}
                onChange={(e) => setFormData({ ...formData, price_per_month: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.price_hidden}
              onChange={(e) => setFormData({ ...formData, price_hidden: e.target.checked })}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Hide price from visitors</div>
              <div className="text-xs text-gray-500">Require login to see price (lead gen)</div>
            </div>
          </label>
        </div>

        {/* v10: Lead Gen Model */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Method</h2>
          
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.platform_managed}
              onChange={(e) => setFormData({ ...formData, platform_managed: e.target.checked })}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Platform Managed</div>
              <div className="text-xs text-gray-500">Full booking flow (if OFF, WhatsApp contact only)</div>
            </div>
          </label>
        </div>

        {/* v10: Internal Quality Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Quality Audit</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quality Score (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.internal_score}
                onChange={(e) => setFormData({ ...formData, internal_score: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg accent-teal-600"
              />
              <div className="w-16 text-center">
                <div className="text-3xl font-bold text-teal-600">{formData.internal_score}</div>
                <div className="text-xs text-gray-500">/ 10</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 bg-gray-50 rounded-lg p-3">
              <Star className="w-4 h-4 text-teal-600 fill-teal-600" />
              <span className="text-sm text-gray-600">Public rating:</span>
              <span className="text-sm font-semibold text-gray-900">
                {((formData.internal_score / 10) * 5).toFixed(1)} stars
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.verified_location}
                onChange={(e) => setFormData({ ...formData, verified_location: e.target.checked })}
                className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Verified Location</div>
                <div className="text-xs text-gray-500">Address confirmed on Google Maps</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.verified_photos}
                onChange={(e) => setFormData({ ...formData, verified_photos: e.target.checked })}
                className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Verified Photos</div>
                <div className="text-xs text-gray-500">Photos are authentic and recent</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.legal_docs_checked}
                onChange={(e) => setFormData({ ...formData, legal_docs_checked: e.target.checked })}
                className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Legal Docs Checked</div>
                <div className="text-xs text-gray-500">Owner ID and property documents verified</div>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes (Admin only)
            </label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              rows={4}
              placeholder="e.g., Owner seems reliable. Photos match actual property. Minor maintenance needed..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            placeholder="Property description..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
