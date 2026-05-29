// ============================================
// API: Confirm Manual Booking
// Path: src/app/api/bookings/manual/confirm/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const supabase = createAdminClient()
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { booking_id, owner_id } = await request.json()

    // 1. Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, property:properties(name, owner_user_id)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 2. Verify owner
    const property = booking.property as any
    if (property.owner_user_id !== owner_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 3. Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Block dates
    const { data: prop } = await supabase
      .from('properties')
      .select('calendar_blocked_dates')
      .eq('id', booking.property_id)
      .single()

    const blockedDates = prop?.calendar_blocked_dates || []
    blockedDates.push({
      start: booking.check_in,
      end: booking.check_out,
      reason: `Booked - ${booking.id.slice(0, 8)}`,
      booking_id: booking.id,
    })

    await supabase
      .from('properties')
      .update({ calendar_blocked_dates: blockedDates })
      .eq('id', booking.property_id)

    // 5. Notify guest
    const { data: guest } = await supabase
      .from('profiles')
      .select('email:id, first_name')
      .eq('id', booking.guest_id)
      .single()

    if (guest?.email) {
      await resend.emails.send({
        from: 'bookings@dredott.com',
        to: guest.email,
        subject: 'Booking Confirmed - DREDOTT',
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Hi ${guest.first_name},</p>
          <p>Your booking at ${property.name} has been confirmed.</p>
          <p>Check-in: ${booking.check_in}</p>
          <p>Check-out: ${booking.check_out}</p>
          <p>The owner will contact you via WhatsApp with payment details.</p>
        `,
      })
    }

    await supabase.from('notifications').insert({
      user_id: booking.guest_id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking at ${property.name} is confirmed`,
      metadata: { booking_id: booking.id },
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Confirm booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}