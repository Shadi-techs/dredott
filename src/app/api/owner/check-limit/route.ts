// ============================================
// Check Listing Limit API
// Path: src/app/api/owner/check-limit/route.ts
// Uses new post-based subscription model
// Returns: { allowed, used, max, package, reason }
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

    // Get active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select(`
        id, max_posts, is_free, free_until, expires_at, is_premium,
        subscription_packages(name)
      `)
      .eq('owner_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    // No subscription at all
    if (!sub) {
      return NextResponse.json({
        allowed: false,
        used: 0,
        max: 0,
        package: null,
        reason: 'No active subscription. Please subscribe first to add listings.',
      })
    }

    // Check if subscription is still valid
    const isActive = sub.is_free
      ? (!sub.free_until || new Date(sub.free_until) > new Date())
      : (!sub.expires_at || new Date(sub.expires_at) > new Date())

    if (!isActive) {
      return NextResponse.json({
        allowed: false,
        used: 0,
        max: sub.max_posts || 0,
        package: (sub.subscription_packages as any)?.name || null,
        reason: 'Your subscription has expired. Please renew to add listings.',
      })
    }

    // Count current listings (properties + cars = posts)
    const [{ count: propCount }, { count: carCount }] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    ])

    const used    = (propCount ?? 0) + (carCount ?? 0)
    const max     = sub.max_posts || 1
    const pkg     = (sub.subscription_packages as any)?.name || 'Starter'
    const allowed = used < max

    return NextResponse.json({
      allowed,
      used,
      max,
      package: pkg,
      is_premium: sub.is_premium,
      reason: allowed
        ? null
        : `You've used all ${max} post${max > 1 ? 's' : ''} in your ${pkg} plan. Upgrade to add more listings.`,
    })
  } catch (err: any) {
    console.error('check-limit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}