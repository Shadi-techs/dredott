import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const CATEGORIES = [
  { name_en: 'Transport & Mobility',       name_ar: 'نقل وتنقل',         icon: '🚗', sort_order: 1 },
  { name_en: 'Accommodation Services',     name_ar: 'خدمات الإقامة',      icon: '🏠', sort_order: 2 },
  { name_en: 'Food & Beverage',            name_ar: 'طعام وشراب',         icon: '🍽️', sort_order: 3 },
  { name_en: 'Activities & Entertainment', name_ar: 'أنشطة وترفيه',       icon: '🏖️', sort_order: 4 },
  { name_en: 'Health & Wellness',          name_ar: 'صحة وعناية',         icon: '💆', sort_order: 5 },
  { name_en: 'Professional Services',      name_ar: 'خدمات احترافية',     icon: '📸', sort_order: 6 },
  { name_en: 'Other Services',             name_ar: 'خدمات أخرى',         icon: '🔧', sort_order: 7 },
]

export async function POST() {
  try {
    const db = getSupabaseAdmin()

    const results = []
    for (const cat of CATEGORIES) {
      const { data, error } = await db
        .from('service_provider_categories')
        .upsert(
          { ...cat, is_active: true },
          { onConflict: 'name_en', ignoreDuplicates: false }
        )
        .select('id, name_en')
        .maybeSingle()

      results.push({ name: cat.name_en, ok: !error, error: error?.message })
    }

    const inserted = results.filter(r => r.ok).length
    return NextResponse.json({ ok: true, inserted, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
