// ============================================
// Admin Notifications — List
// Path: src/app/api/admin/notifications/list/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)


export async function GET(req: NextRequest) {
  try {
    // ── 1. تحقق من الـ JWT ──
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ── Admin permissions ──
    const verified2 = await jose.jwtVerify(token, JWT_SECRET)
    const { data: adminData } = await getSupabaseAdmin().from('admin_users').select('role, notification_permissions').eq('id', String(verified2.payload.sub)).single()
    const isSuperAdmin = adminData?.role === 'super_admin'
    const permissions = adminData?.notification_permissions || []

    // ── 2. جيب الـ query params ──
    const { searchParams } = new URL(req.url)
    const page     = parseInt(searchParams.get('page') || '1')
    const limit    = parseInt(searchParams.get('limit') || '20')
    const unread   = searchParams.get('unread') === 'true'
    const offset   = (page - 1) * limit

    // ── 3. جيب الإشعارات ──
    let query = getSupabaseAdmin()
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unread) {
      query = query.eq('read', false)
    }

    if (!isSuperAdmin && permissions.length > 0) { query = query.in('category', permissions) }
    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      notifications: data || [],
      total:         count || 0,
      page,
      limit,
    })

  } catch (err) {
    console.error('Notifications list error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const verified = await jose.jwtVerify(token, JWT_SECRET)
      if (verified.payload.type !== 'admin') throw new Error()
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await getSupabaseAdmin().from('admin_notifications').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, category, title, body, link, priority } = await req.json()
    if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 })
    const { error } = await getSupabaseAdmin()
      .from('admin_notifications')
      .insert({ type, category, title, body, link, priority, read: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
