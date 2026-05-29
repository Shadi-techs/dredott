'use client'
// ============================================
// DredottSTAY — Property Info
// Title, location, meta, description
// ============================================

import { MapPin, Users, Star, BedDouble } from 'lucide-react'
import type { Property } from '@/types'

const AREA_LABELS: Record<string, string> = {
  naama_bay: 'Naama Bay',
  sharks_bay: 'Sharks Bay',
  old_market: 'Old Market',
  ras_um_sid: 'Ras Um Sid',
  hadaba: 'Hadaba',
  montazah: 'Montazah',
  nabq: 'Nabq',
}

export default function PropertyInfo({
  property,
  locale,
}: {
  property: Property
  locale: string
}) {
  // Pick description for current locale
  const description =
    locale === 'ar' ? property.description_ar || property.description :
    locale === 'it' ? property.description_it || property.description :
    locale === 'ru' ? property.description_ru || property.description :
    locale === 'de' ? property.description_de || property.description :
    property.description

  return (
    <div>
      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        {property.amenities?.sea_view && (
          <span className="badge badge-teal">Sea view</span>
        )}
        <span className="badge badge-gold">Verified</span>
        <span className="badge badge-navy">{AREA_LABELS[property.area]}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-medium text-[#2C3A6B] mb-2">{property.name}</h1>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-[#2A9D8F] text-sm mb-4">
        <MapPin size={13} />
        {AREA_LABELS[property.area]}, Sharm El Sheikh, South Sinai
      </div>

      {/* Meta */}
      <div className="flex gap-5 flex-wrap text-xs text-[#A0A8B4] mb-5">
        <div className="flex items-center gap-1.5">
          <BedDouble size={13} />
          <span className="text-[#2C3A6B] font-medium">{property.bedrooms}</span> beds
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={13} />
          <span className="text-[#2C3A6B] font-medium">{property.max_guests}</span> guests max
        </div>
        {property.display_rating && (
          <div className="flex items-center gap-1.5">
            <Star size={12} className="fill-[#B8860B] text-[#B8860B]" />
            <span className="text-[#2C3A6B] font-medium">{property.display_rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="capitalize text-[#2C3A6B] font-medium">{property.type}</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <span className="section-label mb-3 block">ABOUT THIS PLACE</span>
        <p className="text-sm text-[#555] leading-loose">{description}</p>
      </div>
    </div>
  )
}
