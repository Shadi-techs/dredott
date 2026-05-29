// ============================================
// iCal Export API — Premium Owners Only
// Path: src/app/api/ical/[propertyId]/route.ts
// Returns .ics file with blocked dates
// Import to Airbnb / Booking.com
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================
// Build iCal string from blocked dates
// ============================================
function buildICS(propertyTitle: string, blockedDates: string[]): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z'

  const events = blockedDates.map((date, i) => {
    // Each blocked date = full day event
    const dateStr = date.replace(/-/g, '')
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0].replace(/-/g, '')

    return [
      'BEGIN:VEVENT',
      `UID:wss-blocked-${dateStr}-${i}@whitestork.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDayStr}`,
      `SUMMARY:Blocked - ${propertyTitle}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DredottStay//Property Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${propertyTitle} - DredottStay`,
    'X-WR-TIMEZONE:Africa/Cairo',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

// ============================================
// GET /api/ical/[propertyId]
// Public endpoint — but validates premium via token
// ============================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') // optional auth token

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    // Check feature flag
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', 'ical_sync')
      .single()

    if (!flag?.enabled) {
      return new NextResponse('iCal sync is not enabled', { status: 503 })
    }

    // Get property + owner info
    const { data: property } = await supabase
      .from('properties')
      .select(`
        id, title, review_status,
        owner_id,
        profiles!properties_owner_id_fkey(is_premium, premium_expires_at)
      `)
      .eq('id', propertyId)
      .single()

    if (!property) {
      return new NextResponse('Property not found', { status: 404 })
    }

    // Only approved listings
    if (property.review_status !== 'approved') {
      return new NextResponse('Property not available', { status: 403 })
    }

    // Check premium status
    const profile = property.profiles as any
    const isPremium = profile?.is_premium === true &&
      (!profile?.premium_expires_at ||
        new Date(profile.premium_expires_at) > new Date())

    if (!isPremium) {
      return new NextResponse(
        'iCal sync requires a Premium subscription',
        { status: 403 }
      )
    }

    // Get blocked dates from blocked_dates table
    const { data: blockedDates } = await supabase
      .from('blocked_dates')
      .select('date')
      .eq('property_id', propertyId)
      .gte('date', new Date().toISOString().split('T')[0]) // only future dates
      .order('date', { ascending: true })

    const dates = (blockedDates || []).map((b: any) => b.date)

    // Build and return .ics
    const icsContent = buildICS(property.title || 'Property', dates)

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="wss-${propertyId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('iCal error:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}