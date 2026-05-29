// ============================================
// DredottSTAY — Featured Properties
// Server component wrapper
// ============================================

import PropertyCard from './PropertyCard'
import Link from 'next/link'
import type { Property } from '@/types'

export default function FeaturedProperties({
  properties,
  locale,
}: {
  properties: Property[]
  locale: string
}) {
  return (
    <section className="px-6 py-8 bg-[#FAF9F6]">
      <div className="flex items-center justify-between mb-5 max-w-6xl mx-auto">
        <h2 className="text-xl font-medium text-[#2C3A6B]">
          Featured{' '}
          <span className="text-[#B8860B]">Properties</span>
        </h2>
        <Link
          href={`/${locale}/properties`}
          className="text-xs text-[#B8860B] underline underline-offset-2 hover:text-[#9A6E09]"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {properties.length > 0
          ? properties.map((p) => (
              <PropertyCard key={p.id} property={p} view="grid" />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-[130px] bg-[#1e3a5f]/30" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#D4A843]/20 rounded w-3/4" />
                  <div className="h-2.5 bg-[#D4A843]/15 rounded w-1/2" />
                  <div className="h-4 bg-[#D4A843]/20 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
