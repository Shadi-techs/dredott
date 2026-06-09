'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus, Clock, CheckCircle, XCircle, MessageSquare, Eye, EyeOff,
  Home, Car, AlertCircle, RotateCcw, Trash2
} from 'lucide-react'
import { toast } from '@/components/owner/Toast'

const supabase = createClient()

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending_review: { 
    label: 'Under Review', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Clock 
  },
  approved: { 
    label: 'Live', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle 
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle 
  },
  changes_requested: { 
    label: 'Changes Needed', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 border-blue-200',
    icon: AlertCircle 
  },
}

export default function OwnerListingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  
  const [listings, setListings] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { 
    fetchListings() 
  }, [filter])

  const fetchListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get subscription
      const { data: sub } = await supabase
        .rpc('get_user_active_subscription', { p_user_id: user.id })
        .single()
      
      setSubscription(sub)

      // Get properties
      const { data: props } = await supabase
        .from('properties')
        .select(`
          id, name, area, photos, review_status, 
          change_request_reason, rejection_reason, 
          resubmission_count, status, created_at, 
          verification_status, price_per_night
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      // Get cars
      const { data: cars } = await supabase
        .from('cars')
        .select(`
          id, name, brand, model, photos, review_status, 
          change_request_reason, rejection_reason, 
          resubmission_count, status, created_at, 
          verification_status, price_per_day
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      // Combine
      let combined = [
        ...(props || []).map(p => ({ ...p, type: 'property' })),
        ...(cars || []).map(c => ({ ...c, type: 'car' }))
      ]

      // Apply filters
      if (filter === 'properties') combined = combined.filter(l => l.type === 'property')
      if (filter === 'cars') combined = combined.filter(l => l.type === 'car')
      if (filter === 'pending') combined = combined.filter(l => l.review_status === 'pending_review')
      if (filter === 'live') combined = combined.filter(l => l.review_status === 'approved' && l.status === 'available')
      if (filter === 'rejected') combined = combined.filter(l => l.review_status === 'rejected')
      if (filter === 'needs-changes') combined = combined.filter(l => l.review_status === 'changes_requested')

      setListings(combined)
    } catch (error: any) {
      console.error('Fetch error:', error)
      toast.error(error?.message || 'Failed to load listings. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const toggleHide = async (id: string, type: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available'
    const table = type === 'property' ? 'properties' : 'cars'
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id)
    if (error) { toast.error(error.message, 'Could not update status'); return }
    toast.success(newStatus === 'available' ? 'Listing is now live' : 'Listing hidden')
    fetchListings()
  }

  const deleteListing = async (id: string, type: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      const table = type === 'property' ? 'properties' : 'cars'
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) { toast.error(error.message, 'Delete failed'); return }
      toast.success('Listing deleted')
      fetchListings()
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const counts = {
    all: listings.length,
    properties: listings.filter(l => l.type === 'property').length,
    cars: listings.filter(l => l.type === 'car').length,
    pending: listings.filter(l => l.review_status === 'pending_review').length,
    live: listings.filter(l => l.review_status === 'approved' && l.status === 'available').length,
    'needs-changes': listings.filter(l => l.review_status === 'changes_requested').length,
    rejected: listings.filter(l => l.review_status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-3xl font-bold text-[#2C3A6B] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              My Listings
            </h1>
            <p className="text-sm text-gray-500">
              {subscription 
                ? `${subscription.used_slots}/${subscription.total_slots} slots used`
                : 'Loading...'}
            </p>
          </div>
          
          {subscription && subscription.remaining_slots > 0 && (
            <button
              onClick={() => router.push('/en/owner/listings/new')}
              className="flex items-center gap-2 px-5 py-3 bg-[#2C3A6B] hover:bg-[#243058] text-white rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Listing
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'properties', label: 'Properties', count: counts.properties, icon: Home },
            { key: 'cars', label: 'Cars', count: counts.cars, icon: Car },
            { key: 'pending', label: 'Pending', count: counts.pending, icon: Clock },
            { key: 'needs-changes', label: 'Changes Needed', count: counts['needs-changes'], icon: AlertCircle },
            { key: 'live', label: 'Live', count: counts.live, icon: CheckCircle },
            { key: 'rejected', label: 'Rejected', count: counts.rejected, icon: XCircle },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => router.push(`/en/owner/listings?filter=${tab.key}`)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2C3A6B] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A6B]" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6 text-lg">
              {filter === 'all' 
                ? 'No listings yet' 
                : `No ${filter.replace('-', ' ')} listings`}
            </p>
            {subscription && subscription.remaining_slots > 0 && (
              <button
                onClick={() => router.push('/en/owner/listings/new')}
                className="px-6 py-3 bg-[#2C3A6B] text-white rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add your first listing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => (
              <ListingCard
                key={`${listing.type}-${listing.id}`}
                listing={listing}
                onToggleHide={toggleHide}
                onDelete={deleteListing}
                isDeleting={deletingId === listing.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Listing Card Component
function ListingCard({ listing, onToggleHide, onDelete, isDeleting }: any) {
  const router = useRouter()
  const statusConf = STATUS_CONFIG[listing.review_status] || STATUS_CONFIG.pending_review
  const StatusIcon = statusConf.icon
  const isApproved = listing.review_status === 'approved'
  const isVerified = listing.verification_status === 'verified'
  const needsChanges = listing.review_status === 'changes_requested'
  
  const displayName = listing.type === 'car' 
    ? listing.name || `${listing.brand} ${listing.model}`
    : listing.name

  const displayPrice = listing.type === 'property'
    ? listing.price_per_night
    : listing.price_per_day

  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
      needsChanges 
        ? 'border-blue-200 shadow-md' 
        : 'border-gray-200 hover:shadow-md'
    }`}>
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {listing.photos?.[0] ? (
            <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
              {listing.type === 'property' ? '🏠' : '🚗'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[#2C3A6B] text-sm truncate">
                  {displayName}
                </h3>
                {listing.type === 'property' && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    Property
                  </span>
                )}
                {listing.type === 'car' && (
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                    Car
                  </span>
                )}
              </div>
              
              {isVerified && (
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Verified</span>
                </div>
              )}

              {listing.area && (
                <p className="text-xs text-gray-500">
                  {listing.area.replace(/_/g, ' ')}
                </p>
              )}

              {displayPrice && (
                <p className="text-xs text-gray-600 mt-1">
                  EGP {displayPrice.toLocaleString()} / 
                  {listing.type === 'property' ? 'night' : 'day'}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${statusConf.color} ${statusConf.bgColor}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConf.label}
            </span>
          </div>

          {/* Feedback Message */}
          {listing.change_request_reason && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Changes Required:</strong> {listing.change_request_reason}
              </p>
            </div>
          )}

          {listing.rejection_reason && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                <strong>Rejection Reason:</strong> {listing.rejection_reason}
              </p>
            </div>
          )}

          {/* Resubmission Count */}
          {listing.resubmission_count > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Resubmitted {listing.resubmission_count} time{listing.resubmission_count > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center gap-2 flex-wrap">
        {/* Resubmit Button */}
        {needsChanges && (
          <button
            onClick={() => router.push(`/en/owner/listings/${listing.id}/resubmit`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resubmit
          </button>
        )}

        {/* Hide/Show Button */}
        {isApproved && (
          <button
            onClick={() => onToggleHide(listing.id, listing.type, listing.status)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#2C3A6B] transition-colors"
          >
            {listing.status === 'available' ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Show
              </>
            )}
          </button>
        )}

        {/* Delete Button */}
        <button
          onClick={() => onDelete(listing.id, listing.type)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors ml-auto"
        >
          {isDeleting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  )
}