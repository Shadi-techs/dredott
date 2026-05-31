import { getSupabaseAdmin } from '@/lib/supabase-admin'
// ============================================
// API: Reject Manual Booking
// Path: src/app/api/bookings/manual/reject/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { booking_id, owner_id, reason } = await request.json()

    // 1. Get booking
    const { data: booking, error: bookingError } = await getSupabaseAdmin()
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
    const { error: updateError } = await getSupabaseAdmin()
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Rejected by owner',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', booking_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Notify guest
    const { data: guest } = await getSupabaseAdmin()
      .from('profiles')
      .select('email:id, first_name')
      .eq('id', booking.guest_id)
      .single()

    if (guest?.email) {
      await resend.emails.send({
        from: 'bookings@dredott.com',
        to: guest.email,
        subject: 'Booking Request Update - DREDOTT',
        html: `
          <h2>Booking Request Update</h2>
          <p>Hi ${guest.first_name},</p>
          <p>Unfortunately, your booking request at ${property.name} could not be confirmed.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p>Please try different dates or contact the owner directly.</p>
        `,
      })
    }

    await getSupabaseAdmin().from('notifications').insert({
      user_id: booking.guest_id,
      type: 'booking_rejected',
      title: 'Booking Request Declined',
      message: `Your request at ${property.name} was declined`,
      metadata: { booking_id: booking.id, reason },
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Reject booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}