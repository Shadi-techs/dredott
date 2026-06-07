import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { target, title, body } = await req.json()
    if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    let query = supabase.from('profiles').select('id, role')
    if (target === 'owners') query = query.eq('role', 'property_owner')
    else if (target === 'providers') query = query.eq('role', 'service_provider')
    else if (target === 'job_seekers') query = query.eq('is_job_seeker', true)
    else if (target === 'guests') query = query.eq('role', 'guest')

    const { data: users } = await query
    if (users && users.length > 0) {
      const notifications = users.map(u => ({
        user_id: u.id,
        type: 'admin_broadcast',
        title,
        message: body,
        read: false,
      }))
      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ success: true, sent_to: users?.length || 0 })
  } catch (err) {
    console.error('Send notification error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
