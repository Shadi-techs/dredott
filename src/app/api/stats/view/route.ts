// ============================================
// Visitor Statistics — Track Page Views
// Path: src/app/api/stats/view/route.ts
// Called on every property/car page load
// Stored in listing_stats (daily aggregation)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================
// POST /api/stats/view
// Body: { listing_type: 'property'|'car', listing_id: string }
// Fire-and-forget — called client-side on page load
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { listing_type, listing_id } = body

    if (!listing_type || !listing_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Check feature flag
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: flag } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', 'visitor_statistics')
      .single()

    if (!flag?.enabled) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert: increment view_count for today
    const { error } = await supabase.rpc('increment_view_count', {
      p_listing_type: listing_type,
      p_listing_id: listing_id,
      p_date: today,
    })

    // Fallback if RPC not available: manual upsert
    if (error) {
      const { data: existing } = await supabase
        .from('listing_stats')
        .select('id, view_count')
        .eq('listing_type', listing_type)
        .eq('listing_id', listing_id)
        .eq('view_date', today)
        .single()

      if (existing) {
        await supabase
          .from('listing_stats')
          .update({ view_count: (existing.view_count || 0) + 1 })
          .eq('id', existing.id)
      } else {
        await supabase.from('listing_stats').insert({
          listing_type,
          listing_id,
          view_date: today,
          view_count: 1,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Silent fail — stats are not critical
    return NextResponse.json({ ok: false })
  }
}