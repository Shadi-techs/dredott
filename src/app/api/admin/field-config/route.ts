import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    if (payload.type !== 'admin') return null
    return payload
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const section = searchParams.get('section') || 'cars'

  const { data, error } = await getSupabaseAdmin()
    .from('listing_field_config')
    .select('*')
    .eq('section', section)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ fields: data || [] })
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Super Admin only' }, { status: 403 })

  const { fields } = await req.json()
  if (!fields?.length) return NextResponse.json({ error: 'No fields provided' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  for (const field of fields) {
    await supabase
      .from('listing_field_config')
      .update({
        is_enabled: field.is_enabled,
        is_required: field.is_required,
        owner_can_toggle: field.owner_can_toggle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', field.id)
  }

  return NextResponse.json({ success: true })
}
