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
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'
    const supabase = getSupabaseAdmin()
    let combined: any[] = []

    if (type !== 'car') {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name, slug, area, price_per_night, bedrooms, bathrooms, max_guests, photos, review_status, created_at, owner_user_id')
        .eq('review_status', 'pending_review')
        .order('created_at', { ascending: false })

      if (properties) {
        const ownerIds = properties.map(p => p.owner_user_id).filter(Boolean)
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone')
          .in('id', ownerIds)

        const ownerMap: Record<string, any> = {}
        owners?.forEach(o => { ownerMap[o.id] = o })

        combined = [...combined, ...properties.map(p => ({
          ...p,
          type: 'property',
          owner: ownerMap[p.owner_user_id] || null
        }))]
      }
    }

    if (type !== 'property') {
      const { data: cars } = await supabase
        .from('cars')
        .select('id, name, slug, brand, model, year, seats, price_per_day, photos, review_status, created_at, owner_id')
        .eq('review_status', 'pending_review')
        .order('created_at', { ascending: false })

      if (cars) {
        const ownerIds = cars.map(c => c.owner_id).filter(Boolean)
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone')
          .in('id', ownerIds)

        const ownerMap: Record<string, any> = {}
        owners?.forEach(o => { ownerMap[o.id] = o })

        combined = [...combined, ...cars.map(c => ({
          ...c,
          type: 'car',
          owner: ownerMap[c.owner_id] || null
        }))]
      }
    }

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return NextResponse.json({ listings: combined, total: combined.length })

  } catch (err) {
    console.error('Queue error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
