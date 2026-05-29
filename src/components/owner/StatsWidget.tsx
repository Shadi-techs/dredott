// ============================================
// Visitor Stats Widget — Premium Owners Only
// Path: src/components/owner/StatsWidget.tsx
// Shows daily/weekly view counts per listing
// Only rendered if isPremium = true
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { TrendingUp, Eye, BarChart2, Lock } from 'lucide-react'

// Singleton
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DayStat {
  view_date: string
  view_count: number
}

interface ListingStat {
  listing_id: string
  listing_type: 'property' | 'car'
  title: string
  total_views: number
  last_7_days: DayStat[]
  today_views: number
}

interface StatsWidgetProps {
  ownerId: string
  isPremium: boolean
}

export default function StatsWidget({ ownerId, isPremium }: StatsWidgetProps) {
  const [stats, setStats] = useState<ListingStat[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    if (isPremium) fetchStats()
  }, [isPremium, period])

  const fetchStats = async () => {
    setLoading(true)
    const days = period === '7d' ? 7 : 30
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    const fromStr = fromDate.toISOString().split('T')[0]

    // Get owner's properties
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title')
      .eq('owner_id', ownerId)
      .eq('review_status', 'approved')

    // Get owner's cars
    const { data: cars } = await supabase
      .from('cars')
      .select('id, car_makes(name), car_models(name)')
      .eq('owner_id', ownerId)
      .eq('review_status', 'approved')

    const allListings = [
      ...(properties || []).map((p: any) => ({
        id: p.id,
        type: 'property' as const,
        title: p.title || 'Property',
      })),
      ...(cars || []).map((c: any) => ({
        id: c.id,
        type: 'car' as const,
        title: `${c.car_makes?.name || ''} ${c.car_models?.name || ''}`.trim() || 'Car',
      })),
    ]

    if (allListings.length === 0) {
      setStats([])
      setLoading(false)
      return
    }

    // Fetch stats for all listings
    const listingIds = allListings.map((l) => l.id)
    const { data: rawStats } = await supabase
      .from('listing_stats')
      .select('listing_id, listing_type, view_date, view_count')
      .in('listing_id', listingIds)
      .gte('view_date', fromStr)
      .order('view_date', { ascending: true })

    const today = new Date().toISOString().split('T')[0]

    // Aggregate per listing
    const result: ListingStat[] = allListings.map((listing) => {
      const listingStats = (rawStats || []).filter(
        (s: any) => s.listing_id === listing.id
      )

      const total = listingStats.reduce(
        (sum: number, s: any) => sum + (s.view_count || 0),
        0
      )

      const todayViews =
        listingStats.find((s: any) => s.view_date === today)?.view_count || 0

      return {
        listing_id: listing.id,
        listing_type: listing.type,
        title: listing.title,
        total_views: total,
        last_7_days: listingStats.map((s: any) => ({
          view_date: s.view_date,
          view_count: s.view_count,
        })),
        today_views: todayViews,
      }
    })

    // Sort by total views desc
    result.sort((a, b) => b.total_views - a.total_views)
    setStats(result)
    setLoading(false)
  }

  // ============================================
  // Locked state for non-premium owners
  // ============================================
  if (!isPremium) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2C3A6B] text-sm">Visitor Statistics</h3>
            <p className="text-xs text-gray-500">See who's viewing your listings</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            Upgrade to <span className="font-semibold text-amber-600">Premium</span> to see
            detailed visitor analytics for your listings.
          </p>
        </div>
      </div>
    )
  }

  // ============================================
  // Premium stats view
  // ============================================
  const totalViews = stats.reduce((sum, s) => sum + s.total_views, 0)
  const todayTotal = stats.reduce((sum, s) => sum + s.today_views, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2C3A6B] text-sm">Visitor Statistics</h3>
            <p className="text-xs text-gray-500">Premium analytics</p>
          </div>
        </div>

        {/* Period toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                period === p
                  ? 'bg-white text-[#2C3A6B] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#2C3A6B]/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3.5 h-3.5 text-[#2C3A6B]" />
            <span className="text-xs text-gray-600">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-[#2C3A6B]">
            {loading ? '—' : totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">last {period === '7d' ? '7' : '30'} days</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {loading ? '—' : todayTotal}
          </p>
          <p className="text-xs text-gray-500">views today</p>
        </div>
      </div>

      {/* Per-listing breakdown */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No approved listings yet
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map((s) => {
            const maxViews = Math.max(...stats.map((x) => x.total_views), 1)
            const barWidth = Math.round((s.total_views / maxViews) * 100)

            return (
              <div key={s.listing_id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                      {s.listing_type === 'property' ? '🏠' : '🚗'}
                    </span>
                    <p className="text-sm font-medium text-[#2C3A6B] truncate">
                      {s.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-500">
                      +{s.today_views} today
                    </span>
                    <span className="text-sm font-bold text-[#2C3A6B]">
                      {s.total_views}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2C3A6B] to-[#2A9D8F] rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}