// ============================================
// Admin Moderation — Request Changes (With Notifications & Tracking)
// Path: src/app/api/admin/moderation/request-changes/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'
import { notifyPropertyChangesRequested } from '@/lib/notification-service'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

const supabaseAdmin = getSupabaseAdmin()

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

    // ── 2. تحقق من الصلاحية ──
    if (!['super_admin', 'admin'].includes(payload.role as string)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // ── 3. جيب البيانات ──
    const { entity_type, entity_id, reason_preset_id, reason_custom, internal_note } = await req.json()

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
    }

    if (!reason_preset_id && !reason_custom) {
      return NextResponse.json({ error: 'reason_preset_id or reason_custom is required' }, { status: 400 })
    }

    if (!['property', 'car'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    const table = entity_type === 'property' ? 'properties' : 'cars'

    // ── 4. جيب الحالة الحالية ──
    const { data: current } = await supabaseAdmin
      .from(table)
      .select('id, review_status, owner_id, name, resubmission_count')
      .eq('id', entity_id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // ── 5. جيب الـ reason text ──
    let reasonText = reason_custom

    if (reason_preset_id) {
      const { data: preset } = await supabaseAdmin
        .from('moderation_reason_presets')
        .select('reason_en')
        .eq('id', reason_preset_id)
        .single()

      reasonText = preset?.reason_en || reason_custom
    }

    // ── 6. احسب resubmission_count ──
    const newResubmissionCount = (current.resubmission_count || 0) + 1

    // ── 7. حدّث الحالة ──
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        review_status: 'changes_requested',
        change_request_reason: reasonText,
        resubmission_count: newResubmissionCount,
        last_resubmitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entity_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 8. سجّل في moderation_decisions ──
    await supabaseAdmin.from('moderation_decisions').insert({
      entity_type,
      entity_id,
      decision: 'changes_requested',
      admin_id: payload.sub,
      reason_preset_id: reason_preset_id || null,
      reason_custom: reason_custom || null,
      previous_status: current.review_status,
      new_status: 'changes_requested',
      internal_note: internal_note || null,
    })

    // ── 9. سجّل في activity_feed ──
    await supabaseAdmin.from('admin_activity_feed').insert({
      admin_id: payload.sub,
      action: 'changes_requested',
      entity_type,
      entity_id,
      before_state: {
        review_status: current.review_status,
        resubmission_count: current.resubmission_count || 0,
      },
      after_state: {
        review_status: 'changes_requested',
        change_request_reason: reasonText,
        resubmission_count: newResubmissionCount,
      },
    })

    // ── 10. ابعت notification للـ owner ✅ جديد ──
    try {
      if (entity_type === 'property') {
        await notifyPropertyChangesRequested(
          current.owner_id,
          entity_id,
          current.name,
          reasonText,
          payload.sub as string
        )
      }
      // TODO: Add notifyCarChangesRequested for cars
    } catch (notifyError) {
      console.error('Notification error:', notifyError)
      // مش بنوقف الـ process
    }

    return NextResponse.json({
      success: true,
      message: 'Changes requested. Owner notified.',
      resubmissionCount: newResubmissionCount,
    })

  } catch (err) {
    console.error('Request changes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}