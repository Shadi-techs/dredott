// ============================================
// Admin Session Logger API (FIXED)
// Path: src/app/api/admin/log-session/route.ts
// ✅ بيتحقق من admin_token JWT بدل Supabase Auth
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)


export async function POST(req: NextRequest) {
  try {
    const { event } = await req.json()

    // ✅ تحقق من JWT بدل Supabase Auth
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ ok: false }, { status: 401 })

    let payload: jose.JWTPayload
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      payload = verified.payload
      if (payload.type !== 'admin') return NextResponse.json({ ok: false }, { status: 401 })
    } catch {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    await getSupabaseAdmin().from('admin_sessions').insert({
      admin_id:   payload.sub,
      admin_name: `${payload.first_name || ''} ${payload.last_name || ''}`.trim(),
      admin_role: payload.role,
      event,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Log session error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}