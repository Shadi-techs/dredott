// ============================================
// Listing Form — DREDOTT
// Path: src/app/[locale]/owner/listings/new/form/page.tsx
// Dynamic form for both properties and cars
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Upload, X, AlertCircle, CheckCircle, 
  MapPin, DollarSign, Home, Car, Calendar 
} from 'lucide-react'

const supabase = createClient()

export default function ListingFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'property' | 'car'
  
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    photos: [],
    // Property specific
    area: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqm: '',
    price_per_night: '',
    // Car specific
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: 'automatic',
    fuel_type: 'petrol',
    seats: 5,
    price_per_day: '',
    price_per_month: '',
  })

  useEffect(() => {
    if (!type || (type !== 'property' && type !== 'car')) {
      router.push('/en/owner/listings/new')
      return
    }
    checkSubscription()
  }, [type])

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/en/login')
      return
    }

    const { data: sub } = await supabase
      .rpc('get_user_active_subscription', { p_user_id: user.id })
      .single()
    
    if (!sub || (sub as any).remaining_slots === 0) {
      router.push('/en/owner/packages')
      return
    }

    setSubscription(sub)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('listings')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setPhotos([...photos, ...uploadedUrls])
      setFormData({ ...formData, photos: [...photos, ...uploadedUrls] })
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setFormData({ ...formData, photos: newPhotos })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Find available slot
      const { data: slots } = await supabase
        .from('listing_slots')
        .select('id')
        .eq('subscription_id', subscription.id)
        .eq('status', 'available')
        .limit(1)

      if (!slots || slots.length === 0) {
        throw new Error('No available slots')
      }

      const slotId = slots[0].id

      if (type === 'property') {
        // Insert property
        const { data: property, error } = await supabase
          .from('properties')
          .insert({
            owner_user_id: user.id,
            slot_id: slotId,
            name: formData.name,
            description: formData.description,
            photos: formData.photos,
            area: formData.area,
            type: formData.property_type,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            max_guests: formData.max_guests,
            size_sqm: parseFloat(formData.size_sqm),
            price_per_night: parseFloat(formData.price_per_night),
            review_status: 'pending_review',
            status: 'unavailable',
          })
          .select()
          .single()

        if (error) throw error

        // Reserve slot
        await supabase
          .from('listing_slots')
          .update({
            status: 'reserved',
            slot_type: 'property',
            slot_item_id: property.id,
            reserved_at: new Date().toISOString(),
          })
          .eq('id', slotId)

      } else {
        // Insert car
        const { data: car, error } = await supabase
          .from('cars')
          .insert({
            owner_id: user.id,
            slot_id: slotId,
            name: formData.name,
            description: formData.description,
            photos: formData.photos,
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            transmission: formData.transmission,
            fuel_type: formData.fuel_type,
            seats: formData.seats,
            price_per_day: parseFloat(formData.price_per_day),
            price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : null,
            review_status: 'pending_review',
            status: 'unavailable',
          })
          .select()
          .single()

        if (error) throw error

        // Reserve slot
        await supabase
          .from('listing_slots')
          .update({
            status: 'reserved',
            slot_type: 'car',
            slot_item_id: car.id,
            reserved_at: new Date().toISOString(),
          })
          .eq('id', slotId)
      }

      // Success
      router.push('/en/owner/listings?filter=pending')

    } catch (error: any) {
      console.error('Submit error:', error)
      alert(error.message || 'Failed to submit listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {type === 'property' ? (
              <Home className="w-8 h-8 text-blue-600" />
            ) : (
              <Car className="w-8 h-8 text-purple-600" />
            )}
            <h1 className="text-2xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {type === 'property' ? 'Add Property' : 'Add Car Rental'}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Fill in the details below. Your listing will be reviewed within 24-48 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-[#2C3A6B] mb-3">
              Photos * (Minimum 5)
            </label>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#D4A843] transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {uploadingPhotos ? 'Uploading...' : 'Click to upload photos'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhotos}
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-[#2C3A6B]">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={type === 'property' ? 'e.g. Cozy Apartment in Naama Bay' : 'e.g. Toyota Corolla 2023'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A843] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your listing..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A843] focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Specific Fields */}
          {type === 'property' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-[#2C3A6B]">Property Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select area</option>
                    <option value="naama_bay">Naama Bay</option>
                    <option value="sharks_bay">Sharks Bay</option>
                    <option value="nabq_bay">Nabq Bay</option>
                    <option value="old_market">Old Market</option>
                    <option value="hadaba">Hadaba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    required
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="chalet">Chalet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
                  <input
                    type="number"
                    value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (EGP) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Car Specific Fields */}
          {type === 'car' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-[#2C3A6B]">Car Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Corolla"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                  <select
                    required
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={9}
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (EGP) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rate (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price_per_month}
                    onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || photos.length < 5}
              className="flex-1 bg-[#2C3A6B] hover:bg-[#243058] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Review Process</p>
                <p>Your listing will be reviewed by our team within 24-48 hours. You'll receive a notification once it's approved or if changes are needed.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}