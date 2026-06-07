'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Upload, AlertCircle, CheckCircle, Loader2,
  XCircle, Clock, FileText, Camera
} from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

interface ResubmitPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default function ResubmitPage({ params }: ResubmitPageProps) {
  const { locale, id } = use(params)
  const router = useRouter()

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/${locale}/login`)
        return
      }

      // جيب property أو car
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_user_id', user.id)
        .single()

      if (property) {
        setListing({ ...property, type: 'property' })
        setPhotos(property.photos || [])
        setDescription(property.description || '')
        setLoading(false)
        return
      }

      // لو مش property - جرب car
      const { data: car } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

      if (car) {
        setListing({ ...car, type: 'car' })
        setPhotos(car.photos || [])
        setDescription(car.description || '')
        setLoading(false)
        return
      }

      setError('Listing not found')
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploadedUrls: string[] = []
      const bucket = listing.type === 'property' ? 'property-photos' : 'car-photos'

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setPhotos([...photos, ...uploadedUrls])
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleResubmit = async () => {
    setError('')
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // تحقق من التحديثات
      if (photos.length === 0) {
        throw new Error('Please add at least one photo')
      }

      if (!description.trim()) {
        throw new Error('Please provide a description')
      }

      const table = listing.type === 'property' ? 'properties' : 'cars'

      // حدّث الـ listing
      const { error: updateError } = await supabase
        .from(table)
        .update({
          photos: photos,
          description: description,
          review_status: 'pending_review',
          change_request_reason: null,
          last_resubmitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq(listing.type === 'property' ? 'owner_user_id' : 'owner_id', user.id)

      if (updateError) throw updateError

      // أضف notification للـ owner
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'listing_resubmitted',
        title: '✅ Listing Resubmitted',
        message: `Your ${listing.type} "${listing.name}" has been resubmitted for review. Our team will review it within 24-48 hours.`,
        read: false,
        entity_type: listing.type,
        entity_id: id,
        metadata: {
          action: 'resubmitted',
          resubmissionTime: new Date().toISOString(),
        },
        link: `/${locale}/owner/listings`,
      })

      // Admin notification - resubmission
      await fetch('/api/admin/notifications/list', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: 'listing_resubmitted',
          category: 'moderation',
          title: 'Listing resubmitted for review',
          body: listing.name + ' has been resubmitted after changes',
          link: '/admin/review',
          priority: 'normal',
        })
      })
      setSuccess(true)
      setTimeout(() => {
        router.push(`/${locale}/owner/listings?filter=pending`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A6B]" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C3A6B] mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/${locale}/owner/listings`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3A6B] text-white rounded-xl font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </Link>
        </div>
      </div>
    )
  }

  // تحقق من الـ status
  const canResubmit =
    listing.review_status === 'changes_requested' ||
    listing.review_status === 'rejected'

  if (!canResubmit) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/${locale}/owner/listings`}
            className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </Link>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            {listing.review_status === 'pending_review' ? (
              <>
                <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#2C3A6B] mb-2">
                  Under Review
                </h2>
                <p className="text-gray-600 mb-6">
                  Your listing is currently being reviewed by our team. This typically takes 24-48 hours.
                </p>
              </>
            ) : listing.review_status === 'approved' ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#2C3A6B] mb-2">
                  Approved ✅
                </h2>
                <p className="text-gray-600 mb-6">
                  Your listing is live and accepting bookings!
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#2C3A6B] mb-2">
                  Cannot Resubmit
                </h2>
                <p className="text-gray-600 mb-6">
                  This listing was permanently rejected. You can add a new listing instead.
                </p>
              </>
            )}

            <Link
              href={`/${locale}/owner/listings`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3A6B] text-white rounded-xl font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Header */}
        <Link
          href={`/${locale}/owner/listings`}
          className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#2C3A6B] font-medium mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Listings
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#2C3A6B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Resubmit Your {listing.type === 'property' ? 'Property' : 'Car'}
            </h1>
          </div>
          <p className="text-gray-600">
            Review the feedback below and make the necessary updates to your listing.
          </p>
        </div>

        {/* Feedback Section */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">
                Changes Required
              </h3>
              <p className="text-amber-800 text-sm">
                {listing.change_request_reason ||
                  listing.rejection_reason ||
                  'Please review and update your listing based on admin feedback.'}
              </p>

              {listing.resubmission_count && (
                <div className="mt-3 text-xs text-amber-700 bg-white/50 px-2 py-1 rounded inline-block">
                  Resubmission #{listing.resubmission_count}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-[#2C3A6B] mb-4">Current Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Title
              </label>
              <p className="text-sm text-gray-700 mt-1">{listing.name || listing.title}</p>
            </div>

            {listing.area && (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-gray-500">
                  Area
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  {listing.area.replace(/_/g, ' ')}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Current Description
              </label>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleResubmit()
          }}
          className="space-y-6"
        >
          {/* Photos Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-[#2C3A6B] mb-4">
              Photos
            </h3>

            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-3">
                  Current Photos ({photos.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4A843] transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to add more photos
                    </span>
                    <span className="text-xs text-gray-500">
                      or drag and drop
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-[#2C3A6B] mb-4">
              Description
            </h3>

            <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
              Updated Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Update your listing description..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A843] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {description.split(' ').filter(Boolean).length} words
            </p>
          </div>

          {/* Errors */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">
                Listing resubmitted successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !photos.length || !description.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3A6B] hover:bg-[#243058] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Resubmit for Review
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Next Steps</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Review the feedback above carefully</li>
                  <li>✓ Update your photos and description</li>
                  <li>✓ Click "Resubmit for Review"</li>
                  <li>✓ Our team will review within 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}