// ============================================
// Admin Flash Deals Management
// Path: src/app/[locale]/admin/flash-deals/page.tsx
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Zap, Plus, Clock, DollarSign, Calendar, Users, TrendingDown } from 'lucide-react'

interface FlashDeal {
  id: string
  property_id: string
  check_in: string
  check_out: string
  nights: number
  original_price: number
  deal_price: number
  discount_percentage: number
  total_amount: number
  expires_at: string
  status: 'active' | 'claimed' | 'expired' | 'cancelled'
  claimed_by?: string
  claimed_at?: string
  created_at: string
}

interface Property {
  id: string
  name: string
}

export default function AdminFlashDealsPage() {
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [deals, setDeals] = useState<FlashDeal[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'claimed' | 'expired'>('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Create deal form
  const [selectedProperty, setSelectedProperty] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [discount, setDiscount] = useState(30)
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState(24)

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every minute to update countdowns
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [filterStatus])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, name')
      .order('name')
    
    if (propsData) setProperties(propsData)
    
    // Fetch deals
    let query = supabase
      .from('flash_deals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }
    
    const { data: dealsData } = await query
    
    if (dealsData) setDeals(dealsData)
    
    setLoading(false)
  }

  const handleCreateDeal = async () => {
    if (!selectedProperty || !checkIn || !checkOut) {
      alert('Please fill all required fields')
      return
    }
    
    // Call the database function
    const { data, error } = await supabase.rpc('create_flash_deal_from_blocked_dates', {
      p_property_id: selectedProperty,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_discount_percentage: discount,
      p_hours_until_expiry: hoursUntilExpiry
    })
    
    if (error) {
      alert(`Error: ${error.message}`)
      return
    }
    
    setShowCreateModal(false)
    fetchData()
  }

  const handleCancelDeal = async (dealId: string) => {
    if (!confirm('Cancel this flash deal?')) return
    
    await supabase
      .from('flash_deals')
      .update({ status: 'cancelled' })
      .eq('id', dealId)
    
    fetchData()
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    
    return `${hours}h ${minutes}m`
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-50 text-green-700',
      claimed: 'bg-blue-50 text-blue-700',
      expired: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-50 text-red-700',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-50 text-gray-700'
  }

  const activeDeals = deals.filter(d => d.status === 'active').length
  const claimedDeals = deals.filter(d => d.status === 'claimed').length
  const totalRevenue = deals
    .filter(d => d.status === 'claimed')
    .reduce((sum, d) => sum + d.total_amount, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-500" />
            Flash Deals
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create time-limited deals for blocked dates
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Flash Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Active Deals</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeDeals}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">Claimed Deals</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{claimedDeals}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalRevenue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'claimed', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flash deals yet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Create your first flash deal to fill blocked dates
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Create Flash Deal
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => {
            const property = properties.find(p => p.id === deal.property_id)
            const timeRemaining = getTimeRemaining(deal.expires_at)
            const isExpiringSoon = deal.status === 'active' && 
              new Date(deal.expires_at).getTime() - Date.now() < 3600000 // < 1 hour
            
            return (
              <div
                key={deal.id}
                className={`bg-white rounded-xl border p-6 hover:shadow-sm transition-shadow ${
                  isExpiringSoon ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      deal.status === 'active' ? 'bg-yellow-100' :
                      deal.status === 'claimed' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <Zap className={`w-6 h-6 ${
                        deal.status === 'active' ? 'text-yellow-600' :
                        deal.status === 'claimed' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {property?.name || 'Unknown Property'}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(deal.status)}`}>
                          {deal.status}
                        </span>
                        {deal.status === 'active' && (
                          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                            isExpiringSoon ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {timeRemaining}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-600">Dates</div>
                          <div className="font-medium text-gray-900">
                            {new Date(deal.check_in).toLocaleDateString()} - {new Date(deal.check_out).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">{deal.nights} nights</div>
                        </div>

                        <div>
                          <div className="text-gray-600">Original Price</div>
                          <div className="font-medium text-gray-900 line-through">
                            ${deal.original_price}/night
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-600">Deal Price</div>
                          <div className="font-medium text-green-600">
                            ${deal.deal_price}/night
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingDown className="w-3 h-3" />
                            {deal.discount_percentage}% OFF
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-600">Total</div>
                          <div className="font-bold text-gray-900">
                            ${deal.total_amount.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {deal.claimed_by && (
                        <div className="text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                          <strong>Claimed:</strong> {new Date(deal.claimed_at!).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {deal.status === 'active' && (
                    <button
                      onClick={() => handleCancelDeal(deal.id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create Flash Deal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property *
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select property</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount: {discount}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires in: {hoursUntilExpiry} hours
                </label>
                <input
                  type="range"
                  min="6"
                  max="72"
                  step="6"
                  value={hoursUntilExpiry}
                  onChange={(e) => setHoursUntilExpiry(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6h</span>
                  <span>72h</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateDeal}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl transition-colors"
              >
                Create Flash Deal
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}