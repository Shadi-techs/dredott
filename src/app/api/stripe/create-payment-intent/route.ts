// ============================================
// DredottSTAY — Stripe Payment Intent API
// Creates payment intent and booking record
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient, createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { property_id, amount, currency, duration, check_in, check_out } = body

    // Validate user is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get property to verify pricing
    const { data: property } = await supabase
      .from('properties')
      .select('price_per_night, utilities_per_month, status')
      .eq('id', property_id)
      .single()

    if (!property || property.status !== 'available') {
      return NextResponse.json({ error: 'Property not available' }, { status: 400 })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      metadata: {
        property_id,
        guest_id: user.id,
        duration,
        check_in,
        check_out,
      },
    })

    // Create pending booking in DB
    const adminSupabase = createAdminClient()
    const { data: booking, error } = await adminSupabase
      .from('bookings')
      .insert({
        property_id,
        guest_id: user.id,
        check_in,
        check_out,
        duration_type: duration,
        nights: Math.ceil((new Date(check_out).getTime() - new Date(check_in).getTime()) / (1000 * 60 * 60 * 24)),
        num_guests: 2,
        base_price: property.price_per_night,
        total_amount: amount / 100,
        currency: currency.toUpperCase(),
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
