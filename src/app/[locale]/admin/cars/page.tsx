// ============================================
// Admin Cars List - Updated for Unified Schema
// Path: src/app/[locale]/admin/cars/page.tsx
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Car,
  Search,
  Filter,
  MapPin,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface CarListing {
  id: string
  name: string
  slug: string
  brand: string
  model: string
  year: number
  area: string
  price_per_day: number
  seats: number
  transmission: string
  fuel_type: string
  photos: string[]
  review_status: string
  internal_score: number | null
  created_at: string
  
  owner: {
    id: string
    first_name: string
    last_name: string
    email: string
    is_premium: boolean
  }
}

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminCarsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [cars, setCars] = useState<CarListing[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending_review' | 'rejected'>('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  // ============================================
  // FETCH DATA
  // ============================================

  useEffect(() => {
    fetchCars()
    fetchStats()
  }, [filterStatus])

  async function fetchCars() {
    setLoading(true)
    try {
      let query = supabase
        .from('cars')
        .select(`
          *,
          owner:profiles!owner_user_id (
            id,
            first_name,
            last_name,
            email,
            is_premium
          )
        `)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('review_status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error

      // Process data
      const processedData = (data || []).map(c => ({
        ...c,
        owner: Array.isArray(c.owner) ? c.owner[0] : c.owner
      }))

      setCars(processedData)
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const [totalRes, approvedRes, pendingRes, rejectedRes] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('review_status', 'approved'),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('review_status', 'pending_review'),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('review_status', 'rejected')
      ])

      setStats({
        total: totalRes.count || 0,
        approved: approvedRes.count || 0,
        pending: pendingRes.count || 0,
        rejected: rejectedRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // ============================================
  // ACTIONS
  // ============================================

  async function deleteCar(carId: string) {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)

      if (error) throw error

      setCars(prev => prev.filter(c => c.id !== carId))
      fetchStats()
      setShowActionMenu(null)
      alert('Car deleted successfully')
    } catch (error) {
      console.error('Error deleting car:', error)
      alert('Failed to delete car')
    }
  }

  // ============================================
  // FILTERED DATA
  // ============================================

  const filteredCars = cars.filter(car => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = car.name.toLowerCase().includes(query)
      const matchesBrand = car.brand.toLowerCase().includes(query)
      const matchesModel = car.model.toLowerCase().includes(query)
      const matchesArea = car.area?.toLowerCase().includes(query)
      const matchesOwner = `${car.owner.first_name} ${car.owner.last_name}`.toLowerCase().includes(query)
      return matchesName || matchesBrand || matchesModel || matchesArea || matchesOwner
    }
    return true
  })

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#0e1428]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1a2240]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#FBF0D0] font-['Cormorant_Garamond']">
                Car Rentals
              </h1>
              <p className="text-sm text-[#7a8aaa] mt-1">
                Manage all car rental listings
              </p>
            </div>
            <Link
              href="/admin/cars/new"
              className="px-4 py-2 bg-[#D4A843] text-[#0e1428] rounded-lg font-medium hover:bg-[#c49835] transition-colors"
            >
              Add Car
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.total} color="blue" />
            <StatCard label="Approved" value={stats.approved} color="green" />
            <StatCard label="Pending" value={stats.pending} color="warning" />
            <StatCard label="Rejected" value={stats.rejected} color="danger" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8aaa]" />
            <input
              type="text"
              placeholder="Search by name, brand, model, area, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a2240] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-[#FBF0D0] placeholder:text-[#7a8aaa] focus:outline-none focus:border-[#D4A843]/50"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-[#1a2240] border border-white/10 rounded-lg p-1">
            {(['all', 'approved', 'pending_review', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-[#D4A843] text-[#0e1428]'
                    : 'text-[#7a8aaa] hover:text-[#FBF0D0]'
                }`}
              >
                {status === 'pending_review' ? 'Pending' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A843]"></div>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-12 h-12 text-[#7a8aaa] mx-auto mb-4" />
            <p className="text-[#7a8aaa] text-lg">No cars found</p>
          </div>
        ) : (
          <div className="bg-[#1a2240] rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0e1428] border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Car</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-mono text-[#7a8aaa] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car, index) => (
                  <CarRow
                    key={car.id}
                    car={car}
                    index={index}
                    showActionMenu={showActionMenu}
                    setShowActionMenu={setShowActionMenu}
                    onDelete={deleteCar}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// STAT CARD
// ============================================

function StatCard({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: number
  color: string 
}) {
  const colors = {
    blue: 'bg-[#60a5fa]/10 border-[#60a5fa]/30 text-[#60a5fa]',
    green: 'bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]',
    warning: 'bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]',
    danger: 'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]'
  }

  return (
    <div className={`rounded-lg border p-3 ${colors[color as keyof typeof colors]}`}>
      <p className="text-xs opacity-90 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono">{value}</p>
    </div>
  )
}

// ============================================
// CAR ROW
// ============================================

function CarRow({
  car,
  index,
  showActionMenu,
  setShowActionMenu,
  onDelete
}: {
  car: CarListing
  index: number
  showActionMenu: string | null
  setShowActionMenu: (id: string | null) => void
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const mainPhoto = car.photos?.[0] || '/placeholder-car.jpg'
  const displayRating = car.internal_score ? (car.internal_score / 2).toFixed(1) : '0.0'

  return (
    <tr
      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
        index % 2 === 0 ? 'bg-[#0e1428]/30' : ''
      }`}
    >
      {/* Car */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0e1428] flex-shrink-0">
            <Image
              src={mainPhoto}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-[#FBF0D0] truncate">
                {car.brand} {car.model}
              </p>
              {car.owner.is_premium && (
                <Crown className="w-4 h-4 text-[#D4A843]" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#7a8aaa]">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{car.year}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{car.area}</span>
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-4 py-4">
        <p className="text-sm text-[#FBF0D0]">
          {car.owner.first_name} {car.owner.last_name}
        </p>
        <p className="text-xs text-[#7a8aaa]">{car.owner.email}</p>
      </td>

      {/* Details */}
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#7a8aaa]">
            <Users className="w-3 h-3" />
            <span>{car.seats} seats</span>
          </div>
          <p className="text-xs text-[#7a8aaa]">{car.transmission}</p>
          <p className="text-xs text-[#7a8aaa]">{car.fuel_type}</p>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-4">
        <p className="text-sm font-mono text-[#FBF0D0]">
          EGP {car.price_per_day.toLocaleString()}
        </p>
        <p className="text-xs text-[#7a8aaa]">/day</p>
      </td>

      {/* Score */}
      <td className="px-4 py-4">
        {car.internal_score ? (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#fbbf24] fill-[#fbbf24]" />
            <span className="text-sm font-mono text-[#FBF0D0]">{displayRating}</span>
          </div>
        ) : (
          <span className="text-xs text-[#7a8aaa]">Not scored</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge status={car.review_status} />
      </td>

      {/* Actions */}
      <td className="px-4 py-4 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setShowActionMenu(showActionMenu === car.id ? null : car.id)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[#7a8aaa]" />
          </button>

          {showActionMenu === car.id && (
            <ActionMenu
              car={car}
              onClose={() => setShowActionMenu(null)}
              onDelete={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  )
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: string }) {
  const styles = {
    approved: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30',
    pending_review: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30',
    rejected: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30',
    needs_edit: 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30'
  }

  const icons = {
    approved: CheckCircle2,
    pending_review: Clock,
    rejected: XCircle,
    needs_edit: Edit
  }

  const Icon = icons[status as keyof typeof icons] || Clock

  const displayStatus = status === 'pending_review' ? 'Pending' : status.replace('_', ' ')

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${styles[status as keyof typeof styles] || styles.pending_review}`}>
      <Icon className="w-3.5 h-3.5" />
      {displayStatus}
    </span>
  )
}

// ============================================
// ACTION MENU
// ============================================

function ActionMenu({
  car,
  onClose,
  onDelete
}: {
  car: CarListing
  onClose: () => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a2240] rounded-lg border border-white/10 shadow-xl z-50 py-1">
        <Link
          href={`/cars/${car.slug}`}
          className="w-full px-4 py-2 text-left text-sm text-[#FBF0D0] hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4 text-[#7a8aaa]" />
          View on Site
        </Link>
        
        <Link
          href={`/admin/cars/${car.id}/edit`}
          className="w-full px-4 py-2 text-left text-sm text-[#FBF0D0] hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4 text-[#7a8aaa]" />
          Edit Car
        </Link>
        
        <div className="border-t border-white/10 my-1" />
        
        <button
          onClick={() => {
            onDelete(car.id)
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#f87171] hover:bg-[#f87171]/10 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Car
        </button>
      </div>
    </>
  )
}