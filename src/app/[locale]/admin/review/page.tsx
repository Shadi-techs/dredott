'use client'
// ============================================
// Admin Review Page
// Path: src/app/[locale]/admin/review/page.tsx
//
// ✅ بتكلم API routes الجديدة
// ✅ فيها presets للـ reject وـ request-changes
// ✅ 3 actions: approve / reject / request-changes
// ============================================

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2, XCircle, Eye, Calendar, MapPin,
  Users, Car, Building2, Clock, AlertCircle,
  Search, MessageSquare, ChevronDown
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface PendingListing {
  id: string
  type: 'property' | 'car'
  name: string
  slug: string
  area?: string
  price_per_night?: number
  price_per_day?: number
  photos: string[]
  review_status: string
  created_at: string
  owner: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone: string
  }
  bedrooms?: number
  bathrooms?: number
  max_guests?: number
  brand?: string
  model?: string
  year?: number
  seats?: number
}

interface Preset {
  id: string
  reason_en: string
  reason_ar: string
  decision_type: string
}

type ModalAction = 'approve' | 'reject' | 'changes_requested'

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminReviewPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [listings, setListings]             = useState<PendingListing[]>([])
  const [loading, setLoading]               = useState(true)
  const [filterType, setFilterType]         = useState<'all' | 'property' | 'car'>('all')
  const [searchQuery, setSearchQuery]       = useState('')
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null)
  const [showModal, setShowModal]           = useState(false)
  const [modalAction, setModalAction]       = useState<ModalAction>('approve')
  const [presets, setPresets]               = useState<Preset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customReason, setCustomReason]     = useState('')
  const [internalNote, setInternalNote]     = useState('')
  const [submitting, setSubmitting]         = useState(false)

  // ── Fetch listings ──
  useEffect(() => { fetchPendingListings() }, [filterType])

  // ── Fetch presets لما الـ modal يفتح ──
  useEffect(() => {
    if (!showModal || modalAction === 'approve') return
    fetchPresets()
  }, [showModal, modalAction])

  async function fetchPendingListings() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/moderation/queue?type=${filterType}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }


































      setLoading(false)
    }
  }

  async function fetchPresets() {
    const decisionType = modalAction === 'reject' ? 'reject' : 'changes_requested'
    const entityType   = selectedListing?.type || 'property'

    const { data } = await supabase
      .from('moderation_reason_presets')
      .select('id, reason_en, reason_ar, decision_type')
      .in('entity_type', [entityType, 'all'])
      .eq('decision_type', decisionType)
      .eq('is_active', true)
      .order('sort_order')

    setPresets(data || [])
    setSelectedPreset('')
  }

  // ── Open modal ──
  function openModal(listing: PendingListing, action: ModalAction) {
    setSelectedListing(listing)
    setModalAction(action)
    setSelectedPreset('')
    setCustomReason('')
    setInternalNote('')
    setShowModal(true)
  }

  // ── Submit ──
  async function submitReview() {
    if (!selectedListing) return
    setSubmitting(true)

    try {
      let endpoint = '/api/admin/moderation/approve'
      let body: any = {
        entity_type:   selectedListing.type,
        entity_id:     selectedListing.id,
        internal_note: internalNote || undefined,
      }

      if (modalAction === 'reject') {
        endpoint = '/api/admin/moderation/reject'
        body.reason_preset_id = selectedPreset || undefined
        body.reason_custom    = customReason || undefined
      } else if (modalAction === 'changes_requested') {
        endpoint = '/api/admin/moderation/request-changes'
        body.reason_preset_id = selectedPreset || undefined
        body.reason_custom    = customReason || undefined
      }

      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      // امسح من القائمة
      setListings(prev => prev.filter(l => l.id !== selectedListing.id))
      setShowModal(false)
      setSelectedListing(null)

    } catch (error: any) {
      console.error('Error submitting review:', error)
      alert(error.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      listing.name.toLowerCase().includes(q) ||
      `${listing.owner.first_name} ${listing.owner.last_name}`.toLowerCase().includes(q) ||
      listing.area?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#F0F2F7]">
      {/* Header */}
      <div className="border-b border-[#1a2240]/10 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2240] font-['Cormorant_Garamond']">
                Approval Queue
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Review and approve property and car listings
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#F0F2F7] rounded-lg px-4 py-2 border border-[#1a2240]/10">
              <Clock className="w-4 h-4 text-[#D4A843]" />
              <span className="text-sm font-mono text-[#1a2240]">
                {filteredListings.length} pending
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search by name, owner, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg p-1">
              {(['all', 'property', 'car'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterType === type
                      ? 'bg-[#D4A843] text-[#F0F2F7]'
                      : 'text-[#6B7280] hover:text-[#1a2240]'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'property' ? 'Properties' : 'Cars'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
            <p className="text-[#6B7280] text-lg">
              {searchQuery ? 'No listings match your search' : 'No pending listings 🎉'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onApprove={() => openModal(listing, 'approve')}
                onReject={() => openModal(listing, 'reject')}
                onRequestChanges={() => openModal(listing, 'changes_requested')}
                onView={() => router.push(`/${listing.type === 'property' ? 'en/properties' : 'en/cars'}/${listing.slug}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedListing && (
        <ReviewModal
          listing={selectedListing}
          action={modalAction}
          presets={presets}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          customReason={customReason}
          setCustomReason={setCustomReason}
          internalNote={internalNote}
          setInternalNote={setInternalNote}
          submitting={submitting}
          onSubmit={submitReview}
          onClose={() => { setShowModal(false); setSelectedListing(null) }}
        />
      )}
    </div>
  )
}

// ============================================
// LISTING CARD
// ============================================

function ListingCard({
  listing, onApprove, onReject, onRequestChanges, onView
}: {
  listing: PendingListing
  onApprove: () => void
  onReject: () => void
  onRequestChanges: () => void
  onView: () => void
}) {
  const isProperty = listing.type === 'property'
  const Icon       = isProperty ? Building2 : Car
  const mainPhoto  = listing.photos?.[0] || '/placeholder-property.jpg'

  return (
    <div className="bg-white rounded-lg border border-[#1a2240]/10 overflow-hidden hover:border-[#D4A843]/30 transition-colors">
      <div className="relative h-48 bg-[#F0F2F7]">
        <Image src={mainPhoto} alt={listing.name} fill className="object-cover" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F2F7]/80 backdrop-blur-sm border border-[#1a2240]/10">
            <Icon className="w-3.5 h-3.5 text-[#D4A843]" />
            <span className="text-xs font-mono text-[#1a2240]">{isProperty ? 'Property' : 'Car'}</span>
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30">
            Pending
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#1a2240] mb-2 line-clamp-1">{listing.name}</h3>

        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-3">
          <MapPin className="w-4 h-4" />
          <span>{listing.area || 'Location not specified'}</span>
        </div>

        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-[#1a2240]/10">
          {isProperty ? (
            <>
              <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <Users className="w-4 h-4" />
                <span>{listing.max_guests || 0} guests</span>
              </div>
              <div className="text-sm text-[#6B7280]">
                {listing.bedrooms || 0} bed • {listing.bathrooms || 0} bath
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-[#6B7280]">{listing.brand} {listing.model}</div>
              <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <Users className="w-4 h-4" />
                <span>{listing.seats || 0} seats</span>
              </div>
              <div className="text-sm text-[#6B7280]">{listing.year}</div>
            </>
          )}
        </div>

        <div className="mb-3">
          <p className="text-xs text-[#6B7280] mb-0.5">Owner</p>
          <p className="text-sm text-[#1a2240] font-medium">
            {listing.owner.first_name} {listing.owner.last_name}
          </p>
          <p className="text-xs text-[#6B7280]">{listing.owner.email}</p>
        </div>

        <div className="mb-3">
          <p className="text-2xl font-bold text-[#D4A843]">
            EGP {isProperty ? listing.price_per_night?.toLocaleString() : listing.price_per_day?.toLocaleString()}
            <span className="text-sm text-[#6B7280] font-normal">/{isProperty ? 'night' : 'day'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Submitted {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* 4 actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onView} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F0F2F7] border border-[#1a2240]/10 text-[#6B7280] hover:text-[#1a2240] hover:border-[#D4A843]/30 transition-colors text-sm">
            <Eye className="w-4 h-4" /> View
          </button>
          <button onClick={onApprove} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-colors text-sm">
            <CheckCircle2 className="w-4 h-4" /> Approve
          </button>
          <button onClick={onRequestChanges} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/20 transition-colors text-sm">
            <MessageSquare className="w-4 h-4" /> Changes
          </button>
          <button onClick={onReject} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] hover:bg-[#f87171]/20 transition-colors text-sm">
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// REVIEW MODAL
// ============================================

function ReviewModal({
  listing, action, presets, selectedPreset, setSelectedPreset,
  customReason, setCustomReason, internalNote, setInternalNote,
  submitting, onSubmit, onClose
}: {
  listing: PendingListing
  action: ModalAction
  presets: Preset[]
  selectedPreset: string
  setSelectedPreset: (v: string) => void
  customReason: string
  setCustomReason: (v: string) => void
  internalNote: string
  setInternalNote: (v: string) => void
  submitting: boolean
  onSubmit: () => void
  onClose: () => void
}) {
  const isApprove  = action === 'approve'
  const isReject   = action === 'reject'
  const isChanges  = action === 'changes_requested'

  const needsReason = isReject || isChanges
  const canSubmit   = isApprove || selectedPreset || customReason.trim()

  const colors = {
    approve:            { icon: '✅', bg: 'bg-[#4ade80]/10', border: 'border-[#4ade80]/30', text: 'text-[#4ade80]', label: 'Approve' },
    reject:             { icon: '❌', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/30', text: 'text-[#f87171]', label: 'Reject' },
    changes_requested:  { icon: '✏️', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/30', text: 'text-[#fbbf24]', label: 'Request Changes' },
  }

  const c = colors[action]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#1a2240]/10 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center text-lg`}>
            {c.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${c.text}`}>{c.label}</h3>
            <p className="text-sm text-[#6B7280]">{listing.name}</p>
          </div>
        </div>

        {/* Presets */}
        {needsReason && presets.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1a2240] mb-2">
              Choose a reason
            </label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(selectedPreset === preset.id ? '' : preset.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    selectedPreset === preset.id
                      ? `${c.bg} ${c.border} ${c.text}`
                      : 'bg-[#F0F2F7] border-[#1a2240]/10 text-[#6B7280] hover:text-[#1a2240] hover:border-white/20'
                  }`}
                >
                  {preset.reason_en}
                  {preset.reason_ar && (
                    <span className="block text-xs opacity-70 mt-0.5 text-right">{preset.reason_ar}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom reason */}
        {needsReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1a2240] mb-2">
              {selectedPreset ? 'Additional details (optional)' : 'Custom reason'}
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg px-3 py-2 text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50 resize-none"
            />
          </div>
        )}

        {/* Internal note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#1a2240] mb-2">
            Internal note <span className="text-[#6B7280] font-normal">(not sent to owner)</span>
          </label>
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Notes for the admin team..."
            rows={2}
            className="w-full bg-[#F0F2F7] border border-[#1a2240]/10 rounded-lg px-3 py-2 text-sm text-[#1a2240] placeholder:text-[#6B7280] focus:outline-none focus:border-[#D4A843]/50 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg border border-[#1a2240]/10 text-[#6B7280] hover:text-[#1a2240] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !canSubmit}
            className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors disabled:opacity-50 ${c.bg} ${c.border} ${c.text}`}
          >
            {submitting ? 'Processing...' : c.label}
          </button>
        </div>
      </div>
    </div>
  )
}