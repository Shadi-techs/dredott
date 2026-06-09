// ============================================
// Check Listing Limit API
// Path: src/app/api/owner/check-limit/route.ts
// Returns: { allowed, used, max, remaining, package, reason }
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use the get_user_active_subscription RPC (counts live listings dynamically)
    const { data: sub, error } = await supabase
      .rpc('get_user_active_subscription', { p_user_id: user.id })
      .maybeSingle() as { data: any; error: any }

    // No subscription at all
    if (!sub) {
      return NextResponse.json({
        allowed: false,
        used: 0,
        max: 0,
        remaining: 0,
        package: null,
        reason: 'no_subscription',
      })
    }

    // Subscription expired
    if (sub.expires_at && new Date(sub.expires_at) <= new Date()) {
      return NextResponse.json({
        allowed: false,
        used: sub.used_slots,
        max: sub.total_slots,
        remaining: 0,
        package: sub.package_name_en,
        reason: 'expired',
      })
    }

    const allowed = sub.remaining_slots > 0

    return NextResponse.json({
      allowed,
      used: sub.used_slots,
      max: sub.total_slots,
      remaining: sub.remaining_slots,
      package: sub.package_name_en,
      package_ar: sub.package_name_ar,
      is_premium: sub.is_premium,
      reason: allowed ? null : 'limit_reached',
    })
  } catch (err: any) {
    console.error('check-limit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
