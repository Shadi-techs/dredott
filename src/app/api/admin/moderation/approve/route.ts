// ============================================
// Admin Moderation — Approve (With Notifications)
// Path: src/app/api/admin/moderation/approve/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'
import { notifyPropertyApproved, notifyCarApproved } from '@/lib/notification-service'

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

    // ── 2. تحقق من الصلاحية ──
    if (!['super_admin', 'admin'].includes(payload.role as string)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // ── 3. جيب البيانات من الـ request ──
    const { entity_type, entity_id, internal_note } = await req.json()

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
    }

    if (!['property', 'car'].includes(entity_type)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 })
    }

    const table = entity_type === 'property' ? 'properties' : 'cars'

    // ── 4. جيب البيانات الحالية ──
    const { data: current } = await getSupabaseAdmin()
      .from(table)
      .select('id, review_status, owner_id, name, title, slug, city_id, city')
      .eq('id', entity_id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    // ── 5. حدّث الحالة لـ approved ──
    const updatePayload: Record<string, unknown> = {
      review_status: 'approved',
      status: 'available',
      updated_at: new Date().toISOString(),
    }

    // Fix missing name/slug/city_id for properties added via owner portal
    if (entity_type === 'property') {
      const displayName = current.name || current.title || ''
      if (!current.name && displayName) updatePayload.name = displayName
      if (!current.slug && displayName) {
        const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'stay'
        updatePayload.slug = `${base}-${entity_id.slice(0, 6)}`
      }
      if (!current.city_id) {
        const cityText: string = (current.city || '').toLowerCase()
        const citySlug = cityText.includes('sharm') ? 'sharm'
          : cityText.includes('hurghada') ? 'hurghada'
          : cityText.includes('dahab') ? 'dahab'
          : 'sharm'
        const { data: cityRow } = await getSupabaseAdmin()
          .from('cities').select('id').eq('slug', citySlug).single()
        if (cityRow) updatePayload.city_id = cityRow.id
      }
    }

    const { error: updateError } = await getSupabaseAdmin()
      .from(table)
      .update(updatePayload)
      .eq('id', entity_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ── 6. سجّل القرار في moderation_decisions ──
    await getSupabaseAdmin().from('moderation_decisions').insert({
      entity_type,
      entity_id,
      decision: 'approve',
      admin_id: payload.sub,
      previous_status: current.review_status,
      new_status: 'approved',
      internal_note: internal_note || null,
    })

    // ── 7. سجّل في activity_feed ──
    await getSupabaseAdmin().from('admin_activity_feed').insert({
      admin_id: payload.sub,
      action: 'approve',
      entity_type,
      entity_id,
      before_state: { review_status: current.review_status },
      after_state: { review_status: 'approved' },
    })

    // ── 8. ابعت notification للـ owner ✅ جديد ──
    try {
      if (entity_type === 'property') {
        await notifyPropertyApproved(current.owner_id, entity_id, current.name, payload.sub as string)
      } else if (entity_type === 'car') {
        await notifyCarApproved(current.owner_id, entity_id, current.name, payload.sub as string)
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError)
      // مش بنوقف الـ process لو الـ notification فشلت
    }

    return NextResponse.json({ 
      success: true,
      message: 'Entity approved successfully. Owner notified.'
    })

  } catch (err) {
    console.error('Approve error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}