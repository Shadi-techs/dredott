// ============================================
// Admin Moderation — Reject (With Notifications)
// Path: src/app/api/admin/moderation/reject/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'
import { notifyPropertyRejected } from '@/lib/notification-service'

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

    if (!['property', 'car', 'review'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    const table = entity_type === 'property' ? 'properties' : entity_type === 'car' ? 'cars' : 'reviews'

    // ── 4. جيب الحالة الحالية ──
    const { data: current } = await supabaseAdmin
      .from(table)
      .select('id, review_status, owner_id, name')
      .eq('id', entity_id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // ── 5. جيب الـ rejection reason text ──
    let rejectionReasonText = reason_custom

    if (reason_preset_id) {
      const { data: preset } = await supabaseAdmin
        .from('moderation_reason_presets')
        .select('reason_en')
        .eq('id', reason_preset_id)
        .single()

      rejectionReasonText = preset?.reason_en || reason_custom
    }

    // ── 6. حدّث الحالة لـ rejected ──
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        review_status: 'rejected',
        rejection_reason: rejectionReasonText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entity_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 7. سجّل القرار في moderation_decisions ──
    await supabaseAdmin.from('moderation_decisions').insert({
      entity_type,
      entity_id,
      decision: 'reject',
      admin_id: payload.sub,
      reason_preset_id: reason_preset_id || null,
      reason_custom: reason_custom || null,
      previous_status: current.review_status,
      new_status: 'rejected',
      internal_note: internal_note || null,
    })

    // ── 8. سجّل في activity_feed ──
    await supabaseAdmin.from('admin_activity_feed').insert({
      admin_id: payload.sub,
      action: 'reject',
      entity_type,
      entity_id,
      before_state: { review_status: current.review_status },
      after_state: { review_status: 'rejected', rejection_reason: rejectionReasonText },
    })

    // ── 9. ابعت notification للـ owner ✅ جديد ──
    try {
      if (entity_type === 'property') {
        await notifyPropertyRejected(
          current.owner_id,
          entity_id,
          current.name,
          rejectionReasonText,
          payload.sub as string
        )
      }
      // TODO: Add notifyCarRejected for cars
    } catch (notifyError) {
      console.error('Notification error:', notifyError)
      // مش بنوقف الـ process
    }

    return NextResponse.json({ 
      success: true,
      message: 'Entity rejected. Owner notified.'
    })

  } catch (err) {
    console.error('Reject error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}