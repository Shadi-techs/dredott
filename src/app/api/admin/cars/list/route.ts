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
      .from('cars')
      .select('id, brand, model, year, price_per_day, photos, review_status, transmission, owner_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (status !== 'all') query = query.eq('review_status', status)

    const { data: cars } = await query
    if (!cars) return NextResponse.json({ cars: [] })

    const ownerIds = cars.map(c => c.owner_id).filter(Boolean)
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, phone')
      .in('id', ownerIds)

    const ownerMap: Record<string, any> = {}
    owners?.forEach(o => { ownerMap[o.id] = o })

    const result = cars.map(c => ({ ...c, owner: ownerMap[c.owner_id] || null }))
    return NextResponse.json({ cars: result })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
