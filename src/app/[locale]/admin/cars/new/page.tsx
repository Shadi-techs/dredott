// ============================================
// Add Car Form - v10
// Path: src/app/[locale]/admin/cars/new/page.tsx
// ============================================

'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Save, Star, Lock, CheckCircle } from 'lucide-react'

export default function AddCarPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: 'automatic' as 'automatic' | 'manual',
    fuel_type: 'petrol' as 'petrol' | 'diesel' | 'electric' | 'hybrid',
    seats: 5,
    doors: 4,
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    price_hidden: false,
    internal_score: 5,
    internal_notes: '',
    description: '',
    photos: [] as string[],
    cover_image_index: 0,
    ac: true,
    gps: false,
    bluetooth: false,
    backup_camera: false,
    child_seat_available: false,
    status: 'available' as 'available' | 'unavailable' | 'maintenance',
    whatsapp_contact: '+201200481043',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('cars').insert([
      {
        ...formData,
        view_count: 0,
      }
    ])

    if (!error) {
      router.push('/en/admin/cars')
    }
    
    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
        <p className="text-gray-600 mt-1">Create a new car rental listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Car Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    name: e.target.value, 
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                  })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Hyundai Elantra 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="hyundai-elantra-2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Hyundai"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Elantra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
              <input
                type="number"
                min="2"
                max="9"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doors</label>
              <input
                type="number"
                min="2"
                max="5"
                value={formData.doors}
                onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Contact</label>
              <input
                type="text"
                value={formData.whatsapp_contact}
                onChange={(e) => setFormData({ ...formData, whatsapp_contact: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="+201234567890"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price/Day (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
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
              <div className="text-xs text-gray-500">Require login to see price</div>
            </div>
          </label>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ac}
                onChange={(e) => setFormData({ ...formData, ac: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Air Conditioning</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.gps}
                onChange={(e) => setFormData({ ...formData, gps: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">GPS</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.bluetooth}
                onChange={(e) => setFormData({ ...formData, bluetooth: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Bluetooth</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.backup_camera}
                onChange={(e) => setFormData({ ...formData, backup_camera: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Backup Camera</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.child_seat_available}
                onChange={(e) => setFormData({ ...formData, child_seat_available: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900">Child Seat Available</span>
            </label>
          </div>
        </div>

        {/* Internal Quality Score */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes (Admin only)
            </label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              rows={4}
              placeholder="e.g., Well maintained. Owner is reliable. Minor scratch on passenger door..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Car description..."
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
                Create Car
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
