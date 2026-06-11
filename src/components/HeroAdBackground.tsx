'use client'

import { useEffect, useRef, useState } from 'react'

interface HeroAd {
  id: string
  image_url: string | null
  cta_url: string | null
  cta_label: string | null
}

interface Props {
  page: 'properties' | 'cars' | 'services'
  defaultImage: string
  opacity?: number
}

export default function HeroAdBackground({ page, defaultImage, opacity = 0.12 }: Props) {
  const [ad, setAd] = useState<HeroAd | null>(null)
  const tracked = useRef(false)

  useEffect(() => {
    fetch(`/api/ads/hero?page=${page}`)
      .then(r => r.json())
      .then(({ ad }: { ad: HeroAd | null }) => {
        if (!ad?.image_url) return
        setAd(ad)
        if (!tracked.current) {
          tracked.current = true
          fetch('/api/ads/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ad.id, type: 'view' }),
          }).catch(() => {})
        }
      })
      .catch(() => {})
  }, [page])

  const imageUrl = ad?.image_url || defaultImage

  const handleAdClick = () => {
    if (!ad) return
    fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id, type: 'click' }),
    }).catch(() => {})
  }

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity,
      }} />
      {ad && ad.cta_url && (
        <a
          href={ad.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          style={{
            position: 'absolute', bottom: 14, right: 16,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '4px 10px',
            fontSize: 10,
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.12em',
            zIndex: 2,
            cursor: 'pointer',
          }}
        >
          AD
        </a>
      )}
    </>
  )
}
