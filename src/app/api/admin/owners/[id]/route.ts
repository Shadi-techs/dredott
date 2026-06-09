import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-super-secret-change-in-production'
)

async function authAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload.type === 'admin'
  } catch { return false }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await authAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getSupabaseAdmin()

  // ── All queries in parallel ──────────────────────────────
  const [
    { data: profile },
    { data: sub },
    { data: props },
    { data: cars },
    { data: coHosts },
    { data: verification },
  ] = await Promise.all([
    db.from('profiles').select('*').eq('id', id).single(),
    db.from('user_subscriptions')
      .select('*, packages(name_en, name_ar, slots_count)')
      .eq('user_id', id).eq('status', 'active')
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('properties')
      .select('id, name, status, review_status, view_count, price_per_night, area, created_at, photos')
      .eq('owner_id', id).order('created_at', { ascending: false }),
    db.from('cars')
      .select('id, name, status, review_status, view_count, price_per_day, brand, model, created_at, photos')
      .eq('owner_id', id).order('created_at', { ascending: false }),
    db.from('team_members')
      .select('id, role, created_at, member:profiles!team_members_member_id_fkey(id, first_name, last_name, email, phone, avatar_url)')
      .eq('owner_id', id).order('created_at', { ascending: false }),
    db.from('owner_verification')
      .select('id, status, verification_type, company_name, submitted_at, admin_notes, rejection_reason')
      .eq('owner_id', id).maybeSingle(),
  ])

  if (!profile) return NextResponse.json({ error: 'Owner not found' }, { status: 404 })

  // ── Bookings for KPIs ────────────────────────────────────
  const propIds = (props || []).map((p: any) => p.id)
  let bookings: any[] = []
  let recentBookings: any[] = []

  if (propIds.length > 0) {
    const [{ data: confirmed }, { data: recent }] = await Promise.all([
      db.from('bookings')
        .select('total_amount, nights, created_at, property_id, status')
        .in('property_id', propIds).eq('status', 'confirmed'),
      db.from('bookings')
        .select('id, check_in, check_out, total_amount, status, nights, property_id, properties(name), profiles(first_name, last_name)')
        .in('property_id', propIds)
        .order('created_at', { ascending: false }).limit(10),
    ])
    bookings       = confirmed    || []
    recentBookings = recent       || []
  }

  // ── KPI calculations ─────────────────────────────────────
  const totalRevenue  = bookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
  const totalNights   = bookings.reduce((s: number, b: any) => s + (b.nights || 0), 0)
  const adr           = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0
  const totalViews    = [...(props || []), ...(cars || [])].reduce((s: number, l: any) => s + (l.view_count || 0), 0)
  const occupancy     = (props || []).length > 0 ? Math.min(100, Math.round((totalNights / ((props || []).length * 30)) * 100)) : 0

  const propBookingCounts: Record<string, number> = {}
  bookings.forEach((b: any) => { propBookingCounts[b.property_id] = (propBookingCounts[b.property_id] || 0) + 1 })

  return NextResponse.json({
    owner: {
      ...profile,
      verification: verification || null,
      subscription: sub || null,
    },
    coHosts: coHosts || [],
    listings: {
      properties: (props || []).map((p: any) => ({ ...p, booking_count: propBookingCounts[p.id] || 0 })),
      cars: cars || [],
    },
    kpi: { revenue: totalRevenue, adr, occupancy, views: totalViews, bookings: bookings.length },
    recentBookings,
  })
}
