// ============================================
// Admin Property Editor - Internal Score Tab
// Path: src/app/[locale]/admin/properties/[id]/page.tsx
// Tab 5: Internal Audit & Quality Score
// ============================================

'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Save, AlertCircle, CheckCircle, Star, 
  FileText, MapPin, Image as ImageIcon, FileCheck
} from 'lucide-react'

interface PropertyData {
  id: string
  name: string
  internal_score: number | null
  internal_notes: string | null
  display_rating: number | null
  verified_location: boolean
  verified_photos: boolean
  legal_docs_checked: boolean
  price_hidden: boolean
}

export default function AdminPropertyInternalScoreTab({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id: propertyId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [internalScore, setInternalScore] = useState<number>(5)
  const [internalNotes, setInternalNotes] = useState('')
  const [verifiedLocation, setVerifiedLocation] = useState(false)
  const [verifiedPhotos, setVerifiedPhotos] = useState(false)
  const [legalDocsChecked, setLegalDocsChecked] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  const fetchProperty = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, internal_score, internal_notes, display_rating, verified_location, verified_photos, legal_docs_checked, price_hidden')
      .eq('id', propertyId)
      .single()

    if (data) {
      setProperty(data)
      setInternalScore(data.internal_score || 5)
      setInternalNotes(data.internal_notes || '')
      setVerifiedLocation(data.verified_location || false)
      setVerifiedPhotos(data.verified_photos || false)
      setLegalDocsChecked(data.legal_docs_checked || false)
    } else if (error) {
      setError('Failed to load property')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Get current user for audit log
      const { data: { session } } = await supabase.auth.getSession()
      
      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          internal_score: internalScore,
          internal_notes: internalNotes,
          verified_location: verifiedLocation,
          verified_photos: verifiedPhotos,
          legal_docs_checked: legalDocsChecked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)

      if (updateError) throw updateError

      // Log audit trail
      await supabase.from('admin_audit_log').insert({
        admin_user_id: session?.user?.id,
        action: 'update_internal_score',
        resource_type: 'property',
        resource_id: propertyId,
        old_value: {
          internal_score: property?.internal_score,
          internal_notes: property?.internal_notes,
          verified_location: property?.verified_location,
          verified_photos: property?.verified_photos,
          legal_docs_checked: property?.legal_docs_checked,
        },
        new_value: {
          internal_score: internalScore,
          internal_notes: internalNotes,
          verified_location: verifiedLocation,
          verified_photos: verifiedPhotos,
          legal_docs_checked: legalDocsChecked,
        },
      })

      setSuccess(true)
      
      // Refresh property to get updated display_rating
      await fetchProperty()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7) return 'text-[#D4A843]'
    if (score >= 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent'
    if (score >= 7) return 'Good'
    if (score >= 5) return 'Average'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A9D8F]"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12 text-gray-500">
        Property not found
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div 
          className="text-[11px] tracking-[0.2em] text-[#B8860B] mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          — TAB 5 · INTERNAL AUDIT
        </div>
        <h2 
          className="text-3xl text-[#2C3A6B] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Quality Score & <em>Verification</em>
        </h2>
        <p className="text-gray-600">
          Internal rating system (1-10). This generates the public 5-star rating.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">Error</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-green-800">Saved successfully!</div>
            <div className="text-green-600 text-sm">
              Display rating updated to: {property.display_rating?.toFixed(1)} ⭐
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
        {/* Quality Score Slider */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-[#2C3A6B]">
              DredottQuality Score
            </label>
            <div className="flex items-center gap-3">
              <span 
                className={`text-4xl font-bold ${getScoreColor(internalScore)}`}
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {internalScore}
              </span>
              <div className="text-right">
                <div className="text-xs text-gray-500">out of 10</div>
                <div className={`text-sm font-semibold ${getScoreColor(internalScore)}`}>
                  {getScoreLabel(internalScore)}
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={internalScore}
            onChange={(e) => setInternalScore(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2A9D8F]"
            style={{
              background: `linear-gradient(to right, #2A9D8F 0%, #2A9D8F ${(internalScore - 1) * 11.11}%, #e5e7eb ${(internalScore - 1) * 11.11}%, #e5e7eb 100%)`
            }}
          />

          {/* Score Scale */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1 (Poor)</span>
            <span>5 (Average)</span>
            <span>10 (Perfect)</span>
          </div>

          {/* Display Rating Preview */}
          <div className="mt-6 p-4 bg-[#FBF0D0] border border-[#D4A843] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#8B6914] mb-1">
                  Public Display Rating:
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = (internalScore / 10) * 5
                    const filled = star <= Math.floor(rating)
                    const half = !filled && star === Math.ceil(rating) && rating % 1 >= 0.5
                    
                    return (
                      <Star
                        key={star}
                        className="w-6 h-6"
                        fill={filled || half ? '#D4A843' : 'none'}
                        stroke="#D4A843"
                      />
                    )
                  })}
                  <span className="text-xl font-bold text-[#2C3A6B] ml-2">
                    {((internalScore / 10) * 5).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-[#8B6914]">
                Auto-calculated from score
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Verification Checkboxes */}
        <div>
          <label className="block text-sm font-semibold text-[#2C3A6B] mb-4">
            Verification Checklist
          </label>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-[#FAF9F6] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={verifiedLocation}
                onChange={(e) => setVerifiedLocation(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#2A9D8F] rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#B8860B]" />
                  <span className="font-medium text-[#2C3A6B]">Location Verified</span>
                </div>
                <p className="text-sm text-gray-600">
                  Property address confirmed and physically inspected
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-[#FAF9F6] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={verifiedPhotos}
                onChange={(e) => setVerifiedPhotos(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#2A9D8F] rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-[#B8860B]" />
                  <span className="font-medium text-[#2C3A6B]">Photos Verified</span>
                </div>
                <p className="text-sm text-gray-600">
                  Photos are recent, accurate, and taken by our team
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-[#FAF9F6] hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={legalDocsChecked}
                onChange={(e) => setLegalDocsChecked(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#2A9D8F] rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4 text-[#B8860B]" />
                  <span className="font-medium text-[#2C3A6B]">Legal Docs Checked</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ownership papers, contracts, and permits verified
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Internal Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#2C3A6B] mb-3">
            <FileText className="w-4 h-4 text-[#B8860B]" />
            Internal Notes
            <span className="text-xs font-normal text-gray-500">(Admin only)</span>
          </label>
          
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-[#FAF9F6] rounded-lg border border-transparent focus:border-[#D4A843] focus:bg-white outline-none text-[#2C3A6B] resize-none"
            placeholder="Add private notes about this property...&#10;&#10;Examples:&#10;• Owner Mohammed very responsive&#10;• AC unit needs servicing next month&#10;• Great location but noisy street&#10;• Pool cleaned weekly on Sundays"
          />
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              These notes are only visible to Super Admin and Admin roles
            </p>
            <span className="text-xs text-gray-400">
              {internalNotes.length} characters
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Current Status Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-[#2C3A6B] mb-4">Current Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Internal Score:</span>
              <span className={`ml-2 font-semibold ${getScoreColor(property.internal_score || 5)}`}>
                {property.internal_score || 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Display Rating:</span>
              <span className="ml-2 font-semibold text-[#2C3A6B]">
                {property.display_rating?.toFixed(1) || 'Not set'} ⭐
              </span>
            </div>
            <div>
              <span className="text-gray-600">Price Hidden:</span>
              <span className="ml-2 font-semibold text-[#2C3A6B]">
                {property.price_hidden ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Verification:</span>
              <span className="ml-2 font-semibold text-[#2C3A6B]">
                {[verifiedLocation, verifiedPhotos, legalDocsChecked].filter(Boolean).length}/3
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#2C3A6B] hover:bg-[#2A9D8F] text-[#D4A843] px-8 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How the scoring works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Score 1-10 is set by you (internal use only)</li>
          <li>• System auto-calculates display rating (1-5 stars) shown to public</li>
          <li>• Formula: (internal_score ÷ 10) × 5 = display_rating</li>
          <li>• Example: Score 8 → Display 4.0⭐ | Score 9 → Display 4.5⭐</li>
        </ul>
      </div>
    </div>
  )
}