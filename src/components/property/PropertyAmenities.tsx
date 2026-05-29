'use client'
// ============================================
// DredottSTAY — Property Amenities
// 10 default (always shown) + optional extras
// ============================================

import { Wifi, Wind, Utensils, Tv, WashingMachine, Waves, 
         Home, Eye, Car, Shield, Umbrella, Baby, Users, 
         Fish, Flame, TreePine, ArrowUp, Dumbbell, Sparkles, Plane } from 'lucide-react'
import type { PropertyAmenities } from '@/types'

const AMENITIES_CONFIG = [
  // Default — always shown
  { key: 'wifi', label: 'WiFi', icon: Wifi, default: true },
  { key: 'ac', label: 'A/C', icon: Wind, default: true },
  { key: 'kitchen', label: 'Kitchen', icon: Utensils, default: true },
  { key: 'tv', label: 'TV', icon: Tv, default: true },
  { key: 'washing_machine', label: 'Washing machine', icon: WashingMachine, default: true },
  { key: 'pool_access', label: 'Pool access', icon: Waves, default: true },
  { key: 'balcony', label: 'Balcony', icon: Home, default: true },
  { key: 'sea_view', label: 'Sea view', icon: Eye, default: true },
  { key: 'parking', label: 'Parking', icon: Car, default: true },
  { key: 'security_24h', label: 'Security 24/7', icon: Shield, default: true },
  // Optional
  { key: 'beach_access', label: 'Beach access', icon: Umbrella, default: false },
  { key: 'baby_cot', label: 'Baby cot', icon: Baby, default: false },
  { key: 'kid_friendly', label: 'Kid-friendly', icon: Users, default: false },
  { key: 'snorkeling_gear', label: 'Snorkeling gear', icon: Fish, default: false },
  { key: 'bbq_area', label: 'BBQ area', icon: Flame, default: false },
  { key: 'garden_view', label: 'Garden view', icon: TreePine, default: false },
  { key: 'elevator', label: 'Elevator', icon: ArrowUp, default: false },
  { key: 'gym_access', label: 'Gym access', icon: Dumbbell, default: false },
  { key: 'daily_cleaning', label: 'Daily cleaning', icon: Sparkles, default: false },
  { key: 'airport_transfer', label: 'Airport transfer', icon: Plane, default: false },
]

export default function PropertyAmenities({ amenities }: { amenities: PropertyAmenities }) {
  // Only show amenities that are enabled
  const activeAmenities = AMENITIES_CONFIG.filter(
    (a) => amenities?.[a.key as keyof PropertyAmenities] === true
  )

  const defaultOnes = activeAmenities.filter((a) => a.default)
  const optionalOnes = activeAmenities.filter((a) => !a.default)

  if (activeAmenities.length === 0) return null

  return (
    <div>
      <span className="section-label mb-4 block">AMENITIES</span>

      {/* Default amenities grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        {defaultOnes.map((a) => {
          const Icon = a.icon
          return (
            <div
              key={a.key}
              className="flex items-center gap-2.5 bg-white border border-[#D4A843]/30 rounded-lg px-3 py-2.5"
            >
              <Icon size={14} className="text-[#B8860B] flex-shrink-0" />
              <span className="text-xs text-[#2C3A6B]">{a.label}</span>
            </div>
          )
        })}
      </div>

      {/* Optional extras (only if any active) */}
      {optionalOnes.length > 0 && (
        <>
          <p className="text-xs text-[#A0A8B4] mb-2">Additional extras:</p>
          <div className="flex flex-wrap gap-2">
            {optionalOnes.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.key}
                  className="flex items-center gap-1.5 bg-[#E1F5EE] border border-[#2A9D8F]/30 rounded-lg px-3 py-1.5"
                >
                  <Icon size={12} className="text-[#2A9D8F] flex-shrink-0" />
                  <span className="text-xs text-[#0F6E56]">{a.label}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
