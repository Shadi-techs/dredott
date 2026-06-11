// ============================================
// Admin Feature Flags — Toggle
// Path: src/app/api/admin/feature-flags/toggle/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
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

    // ── 4. جيب الحالة الحالية (أو أنشئها لو مش موجودة) ──
    const { data: feature } = await getSupabaseAdmin()
      .from('platform_features')
      .select('id, enabled')
      .eq('feature_key', feature_key)
      .maybeSingle()

    const prevEnabled  = feature?.enabled ?? true   // default: enabled
    const newEnabled   = !prevEnabled

    let featureId = feature?.id

    if (!feature) {
      // Upsert — create the flag for the first time
      const module = feature_key.startsWith('module_') ? feature_key.replace('module_', '') : 'general'
      const { data: inserted } = await getSupabaseAdmin()
        .from('platform_features')
        .insert({
          feature_key,
          module,
          enabled:     newEnabled,
          description: `Module: ${module}`,
          updated_by:  payload.sub,
          updated_at:  new Date().toISOString(),
        })
        .select('id')
        .single()
      featureId = inserted?.id
    } else {
      // Update existing
      const { error: updateError } = await getSupabaseAdmin()
        .from('platform_features')
        .update({ enabled: newEnabled, updated_by: payload.sub, updated_at: new Date().toISOString() })
        .eq('feature_key', feature_key)
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 5. سجّل في activity_feed ──
    await getSupabaseAdmin().from('admin_activity_feed').insert({
      admin_id:     payload.sub,
      action:       'toggle_feature',
      entity_type:  'feature_flag',
      entity_id:    featureId,
      before_state: { enabled: prevEnabled },
      after_state:  { enabled: newEnabled },
    })

    return NextResponse.json({ success: true, enabled: newEnabled })

  } catch (err) {
    console.error('Feature flag toggle error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}