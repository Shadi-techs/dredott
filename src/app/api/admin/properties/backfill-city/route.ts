import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

// POST /api/admin/properties/backfill-city
// Fixes approved properties that are missing city_id, name, or slug
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      if (payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // Fetch all cities for lookup
    const { data: cities } = await supabase.from('cities').select('id, slug, name_en')
    const cityMap: Record<string, string> = {}
    cities?.forEach(c => { cityMap[c.slug] = c.id; cityMap[(c.name_en || '').toLowerCase()] = c.id })

    // Find approved properties missing city_id
    const { data: props } = await supabase
      .from('properties')
      .select('id, name, title, slug, city_id, city')
      .is('city_id', null)
      .in('review_status', ['approved', 'available'])

    if (!props || props.length === 0) {
      return NextResponse.json({ fixed: 0, message: 'No properties need fixing' })
    }

    let fixed = 0
    for (const p of props) {
      const patch: Record<string, unknown> = {}

      // Resolve city_id
      const cityText = (p.city || '').toLowerCase()
      const citySlug = cityText.includes('sharm') ? 'sharm'
        : cityText.includes('hurghada') ? 'hurghada'
        : cityText.includes('dahab') ? 'dahab'
        : 'sharm'
      const cityId = cityMap[citySlug]
      if (cityId) patch.city_id = cityId

      // Fix name if missing
      const displayName = p.name || p.title || ''
      if (!p.name && displayName) patch.name = displayName

      // Fix slug if missing
      if (!p.slug && displayName) {
        const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'stay'
        patch.slug = `${base}-${p.id.slice(0, 6)}`
      }

      if (Object.keys(patch).length > 0) {
        await supabase.from('properties').update(patch).eq('id', p.id)
        fixed++
      }
    }

    return NextResponse.json({ fixed, total: props.length })
  } catch (err) {
    console.error('Backfill error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
