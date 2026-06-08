import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ count: 0 })
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      if (payload.type !== 'admin') return NextResponse.json({ count: 0 })
    } catch { return NextResponse.json({ count: 0 }) }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'total'

    let query = getSupabaseAdmin().from('properties').select('*', { count: 'exact', head: true })
    if (type === 'approved') query = query.eq('review_status', 'approved')
    if (type === 'pending') query = query.eq('review_status', 'pending_review')
    if (type === 'rejected') query = query.eq('review_status', 'rejected')

    const { count } = await query
    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
