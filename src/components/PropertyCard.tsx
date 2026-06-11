'use client'
// ============================================
// DredottSTAY — Property Card
// Used in: Home featured, Properties listing
// Supports: Grid view and List view
// ============================================

import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Eye, MapPin } from 'lucide-react'
import { formatPrice, type Currency } from '@/lib/utils/currency'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  view?: 'grid' | 'list'
  currency?: Currency
}

// Area labels
const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay',
  sharks_bay: 'Sharks Bay',
  old_market: 'Old Market',
  ras_um_sid: 'Ras Um Sid',
  hadaba: 'Hadaba',
  montazah: 'Montazah',
  nabq: 'Nabq',
}

// Badge config for property features
function getPropertyBadge(property: Property): { label: string; color: string } | null {
  if (property.amenities?.sea_view) return { label: 'Sea view', color: 'bg-[#2A9D8F] text-[#E0F5F3]' }
  if (property.amenities?.pool_access) return { label: 'Pool', color: 'bg-[#2C3A6B] text-[#D4A843]' }
  if (property.view_count < 50) return { label: 'New', color: 'bg-[#E24B4A] text-white' }
  if (property.amenities?.beach_access) return { label: 'Beach', color: 'bg-[#2A9D8F] text-[#E0F5F3]' }
  return null
}

export default function PropertyCard({
  property,
  view = 'grid',
  currency = 'USD',
}: PropertyCardProps) {
  const locale = useLocale()
  const t = useTranslations('property')
  const badge = getPropertyBadge(property)

  const price = formatPrice(property.price_per_night, currency)
  const areaLabel = AREA_LABELS[property.area] || property.area

  if (view === 'list') {
    return (
      <Link
        href={`/${locale}/stays/${property.slug}`}
        className="card flex hover:border-[#B8860B] transition-colors group"
      >
        {/* Image */}
        <div className="w-[150px] flex-shrink-0 relative overflow-hidden">
          {property.photos?.[0] ? (
            <Image
              src={property.photos[0]}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white/20 text-3xl">🏠</span>
            </div>
          )}
          {badge && (
            <span className={`absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full z-10 ${badge.color}`}>
              {badge.label}
            </span>
          )}
          <div className="absolute bottom-2 left-2 bg-black/45 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
            <Eye size={9} /> {property.view_count}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="font-medium text-[#2C3A6B] text-sm mb-1">{property.name}</h3>
              <div className="flex items-center gap-1 text-[#2A9D8F] text-xs mb-2">
                <MapPin size={10} /> {areaLabel} · {property.bedrooms} {t('beds')}
              </div>
              {/* Amenities */}
              <div className="flex gap-1.5 flex-wrap">
                {property.amenities?.wifi && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">WiFi</span>}
                {property.amenities?.ac && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">A/C</span>}
                {property.amenities?.pool_access && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">Pool</span>}
                {property.amenities?.balcony && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">Balcony</span>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[#B8860B] font-medium text-base">{price}</div>
              <div className="text-[#A0A8B4] text-[10px]">{t('perNight')}</div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-[#A0A8B4] text-xs">Utilities available separately</span>
            <span className="text-[#B8860B] text-xs font-medium">View & Book →</span>
          </div>
        </div>
      </Link>
    )
  }

  // Grid view (default)
  return (
    <Link
      href={`/${locale}/stays/${property.slug}`}
      className="card hover:border-[#B8860B] transition-colors group block"
    >
      {/* Image */}
      <div className="h-[130px] relative overflow-hidden">
        {property.photos?.[0] ? (
          <Image
            src={property.photos[0]}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center">
            <span className="text-white/20 text-3xl">🏠</span>
          </div>
        )}
        {badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full z-10 ${badge.color}`}>
            {badge.label}
          </span>
        )}
        <div className="absolute bottom-2 right-2 bg-black/45 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <Eye size={9} /> {property.view_count}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-[#2C3A6B] text-sm mb-1 truncate">{property.name}</h3>
        <div className="flex items-center gap-1 text-[#2A9D8F] text-xs mb-2">
          <MapPin size={10} /> {areaLabel}
        </div>
        {/* Amenity tags */}
        <div className="flex gap-1 flex-wrap mb-2.5">
          {property.amenities?.wifi && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">WiFi</span>}
          {property.amenities?.ac && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">A/C</span>}
          {property.amenities?.kitchen && <span className="text-[10px] bg-[#F1EFE8] text-[#5F5E5A] px-1.5 py-0.5 rounded">Kitchen</span>}
        </div>
        {/* Price + button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#B8860B] font-medium text-sm">{price}</span>
            <span className="text-[#A0A8B4] text-[10px] ml-1">{t('perNight')}</span>
          </div>
          <span className="bg-[#2C3A6B] text-[#D4A843] text-[11px] font-medium px-2.5 py-1 rounded-md">
            {t('view')}
          </span>
        </div>
      </div>
    </Link>
  )
}
