import { getSupabaseAdmin } from '@/lib/supabase-admin'
// ============================================
// API Route: Cancel Booking
// Path: src/app/api/bookings/[id]/cancel/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-04-22.dahlia' })
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason, user_id } = await request.json()

    // 1. Get booking
    const { data: booking, error: bookingError } = await getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 2. Check permissions (only guest or owner can cancel)
    if (booking.guest_id !== user_id) {
      const { data: property } = await getSupabaseAdmin()
        .from('properties')
        .select('owner_user_id')
        .eq('id', booking.property_id)
        .single()

      if (property?.owner_user_id !== user_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // 3. Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    // 4. Refund payment if paid
    if (booking.payment_status === 'paid' && booking.stripe_payment_intent_id) {
      try {
        await getStripe().refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        })
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError)
        // Continue even if refund fails (handle manually)
      }
    }

    // 5. Update booking
    const { error: updateError } = await getSupabaseAdmin()
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 6. Unblock dates in property calendar
    const { data: property } = await getSupabaseAdmin()
      .from('properties')
      .select('calendar_blocked_dates')
      .eq('id', booking.property_id)
      .single()

    const blockedDates = property?.calendar_blocked_dates || []
    const updatedDates = blockedDates.filter((range: any) => range.booking_id !== booking.id)

    await getSupabaseAdmin()
      .from('properties')
      .update({ calendar_blocked_dates: updatedDates })
      .eq('id', booking.property_id)

    return NextResponse.json({ success: true, message: 'Booking cancelled and refunded' })

  } catch (error: any) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
