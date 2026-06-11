import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

// The 5 module keys — must exist or default to enabled
const MODULE_KEYS = [
  'module_properties',
  'module_cars',
  'module_services',
  'module_blog',
  'module_jobs',
]

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      if (payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data } = await getSupabaseAdmin()
      .from('platform_features')
      .select('feature_key, enabled')
      .in('feature_key', MODULE_KEYS)

    // Build map — keys missing from DB default to true (enabled)
    const flags: Record<string, boolean> = {}
    MODULE_KEYS.forEach(k => { flags[k] = true })
    data?.forEach(row => { flags[row.feature_key] = row.enabled })

    return NextResponse.json({ flags })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
