import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      if (payload.type !== 'admin') throw new Error()
    } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('properties')
      .select('id, name, area, type, bedrooms, price_per_night, photos, review_status, owner_user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (status !== 'all') query = query.eq('review_status', status)

    const { data: properties } = await query
    if (!properties) return NextResponse.json({ properties: [] })

    const ownerIds = properties.map(p => p.owner_user_id).filter(Boolean)
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, phone')
      .in('id', ownerIds)

    const ownerMap: Record<string, any> = {}
    owners?.forEach(o => { ownerMap[o.id] = o })

    const result = properties.map(p => ({ ...p, owner: ownerMap[p.owner_user_id] || null }))
    return NextResponse.json({ properties: result })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
