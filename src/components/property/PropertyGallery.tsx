'use client'
// ============================================
// DredottSTAY — Property Gallery
// Main photo + 2 thumbnails + view count
// ============================================

import { useState } from 'react'
import Image from 'next/image'
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyGalleryProps {
  photos: string[]
  name: string
  viewCount: number
}

export default function PropertyGallery({ photos, name, viewCount }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const hasPhotos = photos.length > 0

  const openLightbox = (index: number) => {
    setCurrentPhoto(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* Gallery grid */}
      <div
        className="grid gap-0.5 h-[380px] overflow-hidden"
        style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}
      >
        {/* Main photo */}
        <div
          className="row-span-2 relative cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          {hasPhotos ? (
            <Image
              src={photos[0]}
              alt={name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          ) : (
            <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center">
              <span className="text-white/20 text-5xl">🏠</span>
            </div>
          )}

          {/* View count */}
          <div className="absolute top-3 left-3 bg-[#2C3A6B]/90 text-[#D4A843] text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
            <Eye size={12} /> {viewCount} views this week
          </div>
        </div>

        {/* Photo 2 */}
        <div
          className="relative cursor-pointer overflow-hidden"
          onClick={() => openLightbox(1)}
        >
          {photos[1] ? (
            <Image src={photos[1]} alt={name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-[#162840]" />
          )}
        </div>

        {/* Photo 3 + more */}
        <div
          className="relative cursor-pointer overflow-hidden"
          onClick={() => openLightbox(2)}
        >
          {photos[2] ? (
            <Image src={photos[2]} alt={name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-[#1a2e50]" />
          )}
          {photos.length > 3 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">+{photos.length - 3} photos</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X size={28} />
          </button>

          <button
            onClick={() => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)}
            className="absolute left-4 text-white/70 hover:text-white"
          >
            <ChevronLeft size={36} />
          </button>

          <div className="relative w-[90vw] h-[85vh]">
            <Image
              src={photos[currentPhoto]}
              alt={name}
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setCurrentPhoto((p) => (p + 1) % photos.length)}
            className="absolute right-4 text-white/70 hover:text-white"
          >
            <ChevronRight size={36} />
          </button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {currentPhoto + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
