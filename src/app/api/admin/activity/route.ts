// ============================================
// Admin Activity Log Route
// Path: src/app/api/admin/activity/route.ts
//
// ✅ بيسجل كل actions الـ admin في admin_activity_feed
// ✅ JWT auth
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    // ── 1. تحقق من الـ JWT ──
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let payload: jose.JWTPayload
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      payload = verified.payload
      if (payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. جيب البيانات ──
    const { action_type, target_type, target_id, description, before_state, after_state, metadata } =
      await req.json()

    if (!action_type) {
      return NextResponse.json({ error: 'action_type is required' }, { status: 400 })
    }

    // ── 3. سجّل في admin_activity_feed ──
    const { error } = await supabaseAdmin.from('admin_activity_feed').insert({
      admin_id:     payload.sub,
      action_type,
      target_type:  target_type  || null,
      target_id:    target_id    || null,
      description:  description  || null,
      before_state: before_state || null,
      after_state:  after_state  || null,
      metadata:     metadata     || null,
      ip_address:   req.headers.get('x-forwarded-for') || 'unknown',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Activity log error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
