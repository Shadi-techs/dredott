// ============================================
// Services API Route
// Path: src/app/api/services/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    const category_id = searchParams.get('category_id')
    const area        = searchParams.get('area')
    const limit       = parseInt(searchParams.get('limit') || '20')
    const offset      = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('service_providers')
      .select('id, business_name, business_name_ar, description, logo_url, area, whatsapp, phone, category_id, google_reviews_cache, featured, profile_views, created_at, service_provider_categories ( id, name_en, name_ar, icon )')
      .eq('is_active', true)
      .eq('review_status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category_id) query = query.eq('category_id', category_id)
    if (area)        query = query.eq('area', area)

    const { data, error } = await query
    if (error) throw error

    const featured  = data?.filter(p => p.featured) || []
    const providers = data?.filter(p => !p.featured) || []

    return NextResponse.json({ featured, providers })

  } catch (err) {
    console.error('Services API error:', err)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}
