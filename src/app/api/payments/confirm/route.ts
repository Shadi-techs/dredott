// ============================================
// API Route: Confirm Payment
// Path: src/app/api/payments/confirm/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-04-22.dahlia' })
}
import { Resend } from 'resend'


const supabase = createAdminClient()

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id } = await request.json()

    // 1. Verify payment with Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // 2. Find booking by payment intent
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, property:properties(name, owner_user_id)')
      .eq('stripe_payment_intent_id', payment_intent_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 3. Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 4. Block dates in property calendar
    const { data: property } = await supabase
      .from('properties')
      .select('calendar_blocked_dates')
      .eq('id', booking.property_id)
      .single()

    const blockedDates = property?.calendar_blocked_dates || []
    blockedDates.push({
      start: booking.check_in,
      end: booking.check_out,
      reason: `Booked - Booking #${booking.id.slice(0, 8)}`,
      booking_id: booking.id,
    })

    await supabase
      .from('properties')
      .update({ calendar_blocked_dates: blockedDates })
      .eq('id', booking.property_id)

    // 5. Get guest info
    const { data: guest } = await supabase
      .from('profiles')
      .select('first_name, last_name, email:id')
      .eq('id', booking.guest_id)
      .single()

    // 6. Send confirmation emails
    try {
      // Email to guest
      await new Resend(process.env.RESEND_API_KEY || '').emails.send({
        from: 'bookings@dredott.com',
        to: guest?.email || '',
        subject: 'Booking Confirmed - DREDOTT',
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Hi ${guest?.first_name},</p>
          <p>Your booking at <strong>${booking.property.name}</strong> is confirmed.</p>
          <p><strong>Check-in:</strong> ${booking.check_in}</p>
          <p><strong>Check-out:</strong> ${booking.check_out}</p>
          <p><strong>Total:</strong> $${booking.total_amount}</p>
          <p>Booking ID: ${booking.id}</p>
        `,
      })

      // Email to owner
      const { data: owner } = await supabase
        .from('profiles')
        .select('email:id')
        .eq('id', booking.property.owner_user_id)
        .single()

      if (owner?.email) {
        await new Resend(process.env.RESEND_API_KEY || '').emails.send({
          from: 'bookings@dredott.com',
          to: owner.email,
          subject: 'New Booking - DREDOTT',
          html: `
            <h2>New Booking Received</h2>
            <p>Your property <strong>${booking.property.name}</strong> has a new booking.</p>
            <p><strong>Guest:</strong> ${guest?.first_name} ${guest?.last_name}</p>
            <p><strong>Check-in:</strong> ${booking.check_in}</p>
            <p><strong>Check-out:</strong> ${booking.check_out}</p>
            <p><strong>Total:</strong> $${booking.total_amount}</p>
            <p>Booking ID: ${booking.id}</p>
          `,
        })
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ booking, status: 'confirmed' })

  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}