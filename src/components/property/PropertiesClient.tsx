'use client'
// ============================================
// DredottSTAY — Properties Client
// All interactive filtering, sorting, view toggle
// ============================================

import { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Grid3X3, List, Search, SlidersHorizontal, X } from 'lucide-react'
import PropertyCard from './PropertyCard'
import EmptyState from './EmptyState'
import type { Property } from '@/types'
import type { Currency } from '@/lib/utils/currency'

const AREAS = [
  { value: '', label: 'All areas' },
  { value: 'naama_bay', label: 'Naama Bay' },
  { value: 'sharks_bay', label: 'Sharks Bay' },
  { value: 'old_market', label: 'Old Market' },
  { value: 'ras_um_sid', label: 'Ras Um Sid' },
  { value: 'hadaba', label: 'Hadaba' },
  { value: 'montazah', label: 'Montazah' },
  { value: 'nabq', label: 'Nabq' },
]

const AMENITY_FILTERS = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'pool_access', label: 'Pool' },
  { key: 'sea_view', label: 'Sea view' },
  { key: 'ac', label: 'A/C' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'parking', label: 'Parking' },
  { key: 'beach_access', label: 'Beach' },
]

interface PropertiesClientProps {
  properties: Property[]
  initialFilters: Record<string, string | undefined>
  locale: string
}

export default function PropertiesClient({ properties, initialFilters, locale }: PropertiesClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  // View toggle
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Currency
  const [currency, setCurrency] = useState<Currency>('USD')

  // Client-side filters (for amenities + price range)
  const [amenityFilters, setAmenityFilters] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Search text (client-side filter)
  const [searchText, setSearchText] = useState('')

  // Filter properties client-side
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Text search
      if (searchText) {
        const q = searchText.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.area.includes(q)) return false
      }
      // Price range
      if (minPrice && p.price_per_night < parseFloat(minPrice)) return false
      if (maxPrice && p.price_per_night > parseFloat(maxPrice)) return false
      // Amenities
      for (const amenity of amenityFilters) {
        if (!p.amenities?.[amenity as keyof typeof p.amenities]) return false
      }
      return true
    })
  }, [properties, searchText, minPrice, maxPrice, amenityFilters])

  // Toggle amenity filter
  const toggleAmenity = (key: string) => {
    setAmenityFilters((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    )
  }

  // Update server-side filters (area, beds, type, sort)
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    setSearchText('')
    setMinPrice('')
    setMaxPrice('')
    setAmenityFilters([])
    router.push(pathname)
  }

  const hasActiveFilters =
    searchText || minPrice || maxPrice || amenityFilters.length > 0 ||
    initialFilters.area || initialFilters.beds || initialFilters.type

  return (
    <>
      {/* Top bar */}
      <div className="bg-white border-b border-[#D4A843]/30 px-5 py-2.5 flex flex-wrap gap-2 items-center sticky top-0 z-20">
        {/* Search */}
        <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#D4A843]/50 rounded-lg px-3 py-2 flex-1 min-w-[140px]">
          <Search size={13} className="text-[#A0A8B4]" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by area or name..."
            className="text-xs text-[#2C3A6B] bg-transparent border-none outline-none flex-1"
          />
        </div>

        {/* Area */}
        <select
          value={initialFilters.area || ''}
          onChange={(e) => updateFilter('area', e.target.value)}
          className="input-field text-xs py-2 w-auto"
        >
          {AREAS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        {/* Beds */}
        <select
          value={initialFilters.beds || ''}
          onChange={(e) => updateFilter('beds', e.target.value)}
          className="input-field text-xs py-2 w-auto"
        >
          <option value="">Any beds</option>
          <option value="1">1 bed</option>
          <option value="2">2 beds</option>
          <option value="3">3+ beds</option>
        </select>

        {/* Type */}
        <select
          value={initialFilters.type || ''}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="input-field text-xs py-2 w-auto"
        >
          <option value="">Any type</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="studio">Studio</option>
          <option value="chalet">Chalet</option>
        </select>

        {/* Currency */}
        <div className="flex border border-[#D4A843]/50 rounded-lg overflow-hidden">
          {(['USD', 'EUR', 'EGP'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-2 text-xs font-medium transition-colors ${
                currency === c ? 'bg-[#FBF0D0] text-[#8B6914]' : 'bg-white text-[#A0A8B4] hover:bg-[#FAF9F6]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-[#A0A8B4] hover:text-[#2C3A6B] transition-colors">
            <X size={12} /> Clear
          </button>
        )}

        {/* View toggle */}
        <div className="flex border border-[#D4A843]/50 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-2 ${view === 'grid' ? 'bg-[#2C3A6B]' : 'bg-white hover:bg-[#FAF9F6]'}`}
          >
            <Grid3X3 size={14} className={view === 'grid' ? 'text-[#D4A843]' : 'text-[#A0A8B4]'} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 ${view === 'list' ? 'bg-[#2C3A6B]' : 'bg-white hover:bg-[#FAF9F6]'}`}
          >
            <List size={14} className={view === 'list' ? 'text-[#D4A843]' : 'text-[#A0A8B4]'} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[196px] flex-shrink-0 bg-white border-r border-[#D4A843]/30 p-4 hidden lg:flex flex-col gap-4">
          <span className="section-label">FILTERS</span>

          {/* Price range */}
          <div>
            <div className="text-xs font-medium text-[#2C3A6B] mb-2">Price per night</div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$50"
                className="w-[60px] px-2 py-1.5 border border-[#D4A843]/50 rounded-md text-xs text-[#2C3A6B] bg-[#FAF9F6] outline-none"
              />
              <span className="text-xs text-[#A0A8B4]">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="$300"
                className="w-[60px] px-2 py-1.5 border border-[#D4A843]/50 rounded-md text-xs text-[#2C3A6B] bg-[#FAF9F6] outline-none"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <div className="text-xs font-medium text-[#2C3A6B] mb-2">Amenities</div>
            <div className="flex flex-col gap-1.5">
              {AMENITY_FILTERS.map((a) => (
                <label key={a.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenityFilters.includes(a.key)}
                    onChange={() => toggleAmenity(a.key)}
                    className="accent-[#B8860B] w-3.5 h-3.5"
                  />
                  <span className="text-xs text-[#2C3A6B]">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability dates */}
          <div>
            <div className="text-xs font-medium text-[#2C3A6B] mb-2">Availability</div>
            <input
              type="date"
              value={initialFilters.checkIn || ''}
              onChange={(e) => updateFilter('checkIn', e.target.value)}
              className="w-full px-2 py-1.5 border border-[#D4A843]/50 rounded-md text-xs text-[#2C3A6B] bg-white outline-none mb-1.5"
            />
            <input
              type="date"
              value={initialFilters.checkOut || ''}
              onChange={(e) => updateFilter('checkOut', e.target.value)}
              className="w-full px-2 py-1.5 border border-[#D4A843]/50 rounded-md text-xs text-[#2C3A6B] bg-white outline-none"
            />
          </div>

          <button onClick={() => {}} className="btn-primary text-xs py-2">Apply filters</button>
          <button onClick={clearAll} className="btn-secondary text-xs py-2">Clear all</button>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#A0A8B4]">
              <span className="text-[#2C3A6B] font-medium">{filtered.length}</span> properties found
            </span>
            <select
              value={initialFilters.sort || ''}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field text-xs py-1.5 w-auto"
            >
              <option value="">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views">Most viewed</option>
            </select>
          </div>

          {/* Properties grid/list or empty state */}
          {filtered.length === 0 ? (
            <EmptyState
              searchParams={initialFilters}
              locale={locale}
              onClear={clearAll}
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  view="grid"
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  view="list"
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
