// ============================================
// API: Create Manual Booking Request
// Path: src/app/api/bookings/manual/create/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const supabase = createAdminClient()
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      property_id,
      guest_id,
      check_in,
      check_out,
      num_guests,
      guest_phone,
      special_requests,
      total_amount,
      nights,
    } = body

    // 1. Verify property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, name, owner_user_id, calendar_blocked_dates')
      .eq('id', property_id)
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // 2. Check dates not blocked
    const blockedDates = property.calendar_blocked_dates || []
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)

    const isBlocked = blockedDates.some((range: any) => {
      const rangeStart = new Date(range.start)
      const rangeEnd = new Date(range.end)
      return (
        (checkInDate >= rangeStart && checkInDate <= rangeEnd) ||
        (checkOutDate >= rangeStart && checkOutDate <= rangeEnd)
      )
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'Dates not available' }, { status: 400 })
    }

    // 3. Create manual booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id,
        guest_id,
        check_in,
        check_out,
        nights,
        num_guests,
        base_price: total_amount,
        total_amount,
        currency: 'USD',
        booking_type: 'manual',
        payment_status: 'pending_payment',
        status: 'pending_confirmation',
        is_platform_managed: true,
        guest_phone,
        special_requests: special_requests || null,
      })
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // 4. Get guest & owner info
    const { data: guest } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', guest_id)
      .single()

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email:id, first_name, phone')
      .eq('id', property.owner_user_id)
      .single()

    const guestName = guest ? `${guest.first_name} ${guest.last_name}` : 'Guest'

    // 5. Notify owner (email + notification)
    try {
      // Email
      if (ownerProfile?.email) {
        await resend.emails.send({
          from: 'bookings@dredott.com',
          to: ownerProfile.email,
          subject: 'New Booking Request - DREDOTT',
          html: `
            <h2>New Booking Request</h2>
            <p>Guest: ${guestName}</p>
            <p>Phone: ${guest_phone}</p>
            <p>Check-in: ${check_in}</p>
            <p>Check-out: ${check_out}</p>
            <p>Guests: ${num_guests}</p>
            <p>Total: $${total_amount}</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/en/owner/booking-requests">View Request</a></p>
          `,
        })
      }

      // In-app notification
      await supabase.from('notifications').insert({
        user_id: property.owner_user_id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${guestName} requested booking from ${check_in} to ${check_out}`,
        metadata: { booking_id: booking.id },
      })
    } catch (emailError) {
      console.error('Notification error:', emailError)
    }

    return NextResponse.json({ booking })

  } catch (error: any) {
    console.error('Manual booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}