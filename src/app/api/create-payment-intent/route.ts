// ============================================
// Stripe Payment Intent API
// Path: src/app/api/create-payment-intent/route.ts
// Creates payment intent for booking
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-04-30' })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, propertyId, bookingData } = await request.json()

    // Validate amount
    if (!amount || amount < 0.5) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        property_id: propertyId,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests.toString(),
        guest_name: `${bookingData.firstName} ${bookingData.lastName}`,
        guest_email: bookingData.email,
        guest_phone: bookingData.phone,
      },
      description: `Booking for ${bookingData.firstName} ${bookingData.lastName}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error: any) {
    console.error('Payment intent creation failed:', error)
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    )
  }
}