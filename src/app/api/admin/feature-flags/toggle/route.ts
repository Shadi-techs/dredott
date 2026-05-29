// ============================================
// Admin Feature Flags — Toggle
// Path: src/app/api/admin/feature-flags/toggle/route.ts
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
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: jose.JWTPayload
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      payload = verified.payload
      if (payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. super_admin فقط ──
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin only' }, { status: 403 })
    }

    // ── 3. جيب البيانات ──
    const { feature_key } = await req.json()

    if (!feature_key) {
      return NextResponse.json({ error: 'feature_key is required' }, { status: 400 })
    }

    // ── 4. جيب الحالة الحالية ──
    const { data: feature } = await supabaseAdmin
      .from('platform_features')
      .select('id, enabled')
      .eq('feature_key', feature_key)
      .single()

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    // ── 5. Toggle ──
    const newEnabled = !feature.enabled

    const { error: updateError } = await supabaseAdmin
      .from('platform_features')
      .update({
        enabled:    newEnabled,
        updated_by: payload.sub,
        updated_at: new Date().toISOString(),
      })
      .eq('feature_key', feature_key)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 6. سجّل في activity_feed ──
    await supabaseAdmin.from('admin_activity_feed').insert({
      admin_id:     payload.sub,
      action:       'toggle_feature',
      entity_type:  'feature_flag',
      entity_id:    feature.id,
      before_state: { enabled: feature.enabled },
      after_state:  { enabled: newEnabled },
    })

    return NextResponse.json({ success: true, enabled: newEnabled })

  } catch (err) {
    console.error('Feature flag toggle error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}