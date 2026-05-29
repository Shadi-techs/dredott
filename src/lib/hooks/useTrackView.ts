// ============================================
// useTrackView Hook
// Path: src/lib/hooks/useTrackView.ts
// Call this on every property/car detail page
// Fire-and-forget — won't break if it fails
// ============================================

'use client'

import { useEffect } from 'react'

interface TrackViewOptions {
  listing_type: 'property' | 'car'
  listing_id: string
  enabled?: boolean // skip if false (e.g. owner viewing own listing)
}

export function useTrackView({
  listing_type,
  listing_id,
  enabled = true,
}: TrackViewOptions) {
  useEffect(() => {
    if (!enabled || !listing_id) return

    // Fire and forget — don't await, don't block render
    fetch('/api/stats/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type, listing_id }),
    }).catch(() => {
      // Silent fail — stats are not critical
    })
  }, [listing_id]) // Only track once per page load
}