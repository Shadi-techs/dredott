'use client'
// ============================================
// DredottSTAY — Property Reviews
// Rules: only verified guests can write
// Admin approval required
// Edit → returns to pending with old text saved
// ============================================

import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  rating: number
  text: string
  created_at: string
  profiles: {
    first_name: string
    nationality?: string
    avatar_url?: string
  }
}

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹', RU: '🇷🇺', DE: '🇩🇪', UA: '🇺🇦', EG: '🇪🇬', FR: '🇫🇷', GB: '🇬🇧',
}
const AVATAR_COLORS = ['#2A9D8F', '#2C3A6B', '#B8860B', '#8B6914']

interface PropertyReviewsProps {
  propertyId: string
  reviews: Review[]
  rating: number
  reviewCount: number
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={onChange ? 22 : 12}
          className={`${
            s <= (hover || value)
              ? 'fill-[#B8860B] text-[#B8860B]'
              : 'fill-[#D3D1C7] text-[#D3D1C7]'
          } ${onChange ? 'cursor-pointer transition-colors' : ''}`}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(s)}
        />
      ))}
    </div>
  )
}

export default function PropertyReviews({ propertyId, reviews, rating, reviewCount }: PropertyReviewsProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newText, setNewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!newRating || !newText.trim()) {
      setError('Please add a rating and write your review.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('You must be signed in to leave a review.'); setSubmitting(false); return }

      // Check if user has a completed booking for this property
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('property_id', propertyId)
        .eq('guest_id', user.id)
        .eq('status', 'completed')
        .not('id', 'in', `(SELECT booking_id FROM reviews WHERE guest_id = '${user.id}')`)
        .limit(1)
        .single()

      if (!booking) {
        setError('Only guests with a completed stay can write a review.')
        setSubmitting(false)
        return
      }

      // Submit review (status: pending — admin must approve)
      const { error: insertError } = await supabase.from('reviews').insert({
        property_id: propertyId,
        guest_id: user.id,
        booking_id: booking.id,
        rating: newRating,
        text: newText.trim(),
        status: 'pending',
      })

      if (insertError) throw insertError

      setSubmitted(true)
      setShowForm(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <span className="section-label mb-4 block">GUEST REVIEWS</span>

      {/* Rating summary */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-4 mb-5">
          <span className="text-4xl font-medium text-[#2C3A6B]">{rating.toFixed(1)}</span>
          <div>
            <StarRating value={Math.round(rating)} />
            <p className="text-xs text-[#A0A8B4] mt-1">{reviewCount} verified reviews</p>
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="flex flex-col gap-3 mb-5">
        {reviews.map((review, idx) => {
          const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
          const flag = review.profiles?.nationality
            ? COUNTRY_FLAGS[review.profiles.nationality] || ''
            : ''

          return (
            <div key={review.id} className="bg-white border border-[#D4A843]/30 rounded-xl p-4">
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-3">
                {review.profiles?.avatar_url ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-[#FFF8DC] flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {review.profiles?.first_name?.[0] || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#2C3A6B]">
                    {review.profiles?.first_name || 'Guest'}
                  </div>
                  <div className="text-xs text-[#A0A8B4]">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {flag && <span className="text-base">{flag}</span>}
              </div>

              <StarRating value={review.rating} />
              <p className="text-sm text-[#555] leading-relaxed mt-2">{review.text}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> Verified stay
              </span>
            </div>
          )
        })}

        {reviews.length === 0 && (
          <p className="text-sm text-[#A0A8B4] py-4 text-center">
            No reviews yet — be the first to share your experience.
          </p>
        )}
      </div>

      {/* Write review */}
      {submitted ? (
        <div className="bg-[#E1F5EE] border border-[#2A9D8F]/30 rounded-xl p-4 text-center">
          <CheckCircle size={24} className="text-[#2A9D8F] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0F6E56]">Review submitted!</p>
          <p className="text-xs text-[#2A9D8F] mt-1">It will appear after admin approval.</p>
        </div>
      ) : showForm ? (
        <div className="bg-[#FBF0D0] border border-[#D4A843]/40 rounded-xl p-4">
          <p className="text-sm font-medium text-[#2C3A6B] mb-3">Write your review</p>

          <div className="mb-3">
            <p className="text-xs text-[#A0A8B4] mb-1.5">Your rating</p>
            <StarRating value={newRating} onChange={setNewRating} />
          </div>

          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Share your experience..."
            className="w-full h-24 px-3 py-2.5 border border-[#D4A843]/50 rounded-lg text-sm text-[#2C3A6B] bg-white outline-none resize-none focus:border-[#B8860B] transition-colors"
          />

          {error && <p className="text-xs text-[#E24B4A] mt-1">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary text-sm flex-1 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-[#A0A8B4] mt-2 text-center">
            Reviews are approved before publishing. Only verified guests can write reviews.
          </p>
        </div>
      ) : (
        <div className="bg-[#FBF0D0] border border-[#D4A843]/30 rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-[#2C3A6B] mb-1">Stayed here before?</p>
          <p className="text-xs text-[#A0A8B4] mb-3">Share your experience — reviews are approved before publishing.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            Write a review
          </button>
        </div>
      )}
    </div>
  )
}
