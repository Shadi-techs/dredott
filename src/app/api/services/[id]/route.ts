import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        id, business_name, business_name_ar,
        description, description_ar,
        logo_url, cover_image_url, photos,
        area, address, whatsapp, phone, website,
        google_business_url, google_reviews_cache,
        profile_views,
        service_provider_categories ( id, name_en, name_ar, icon )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error

    return NextResponse.json({ provider: data })
  } catch (err) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }
}
