import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('service_provider_categories')
      .select('id, name_en, name_ar, icon')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return NextResponse.json({ categories: data || [] })
  } catch (err) {
    return NextResponse.json({ categories: [] })
  }
}
