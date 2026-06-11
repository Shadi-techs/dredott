import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page')
  if (!page) return NextResponse.json({ ad: null })

  const placement = `hero_${page}`
  const now = new Date().toISOString()

  const { data } = await getSupabaseAdmin()
    .from('ads')
    .select('id, image_url, cta_url, cta_label, title')
    .eq('placement', placement)
    .eq('is_active', true)
    .lte('starts_at', now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ ad: data || null }, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' },
  })
}
