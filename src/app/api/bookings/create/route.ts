import { getSupabaseAdmin } from '@/lib/supabase-admin'
// ============================================
// API Route: Create Booking
// Path: src/app/api/bookings/create/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-04-22.dahlia' })
}


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
      duration_type = 'nightly'
    } = body

    // 1. Verify property exists and is platform_managed
    const { data: property, error: propError } = await getSupabaseAdmin()
      .from('properties')
      .select('id, name, platform_managed, price_per_night, price_per_week, price_per_month, calendar_blocked_dates, status')
      .eq('id', property_id)
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!property.platform_managed) {
      return NextResponse.json({ error: 'Property not available for booking' }, { status: 400 })
    }

    if (property.status !== 'available') {
      return NextResponse.json({ error: 'Property not available' }, { status: 400 })
    }

    // 2. Calculate nights and check availability
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights < 1) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    // 3. Check if dates are blocked
    const blockedDates = property.calendar_blocked_dates || []
    const isBlocked = blockedDates.some((range: any) => {
      const rangeStart = new Date(range.start)
      const rangeEnd = new Date(range.end)
      return (
        (checkInDate >= rangeStart && checkInDate <= rangeEnd) ||
        (checkOutDate >= rangeStart && checkOutDate <= rangeEnd) ||
        (checkInDate <= rangeStart && checkOutDate >= rangeEnd)
      )
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'Selected dates are not available' }, { status: 400 })
    }

    // 4. Check for overlapping bookings
    const { data: existingBookings } = await getSupabaseAdmin()
      .from('bookings')
      .select('id')
      .eq('property_id', property_id)
      .neq('status', 'cancelled')
      .or(`check_in.lte.${check_out},check_out.gte.${check_in}`)

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json({ error: 'Dates already booked' }, { status: 400 })
    }

    // 5. Calculate pricing
    let basePrice = 0
    switch (duration_type) {
      case 'weekly':
        const weeks = Math.ceil(nights / 7)
        basePrice = (property.price_per_week || property.price_per_night * 7) * weeks
        break
      case 'monthly':
        const months = Math.ceil(nights / 30)
        basePrice = (property.price_per_month || property.price_per_night * 30) * months
        break
      default:
        basePrice = property.price_per_night * nights
    }

    const totalAmount = basePrice

    // 6. Create Stripe Payment Intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        property_id,
        guest_id,
        check_in,
        check_out,
        nights: nights.toString(),
      },
    })

    // 7. Create booking
    const { data: booking, error: bookingError } = await getSupabaseAdmin()
      .from('bookings')
      .insert({
        property_id,
        guest_id,
        check_in,
        check_out,
        duration_type,
        nights,
        num_guests,
        base_price: basePrice,
        utilities_included: false,
        utilities_amount: 0,
        total_amount: totalAmount,
        currency: 'USD',
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        status: 'pending',
        is_platform_managed: true,
        guest_phone,
        whatsapp_confirmed: false,
      })
      .select()
      .single()

    if (bookingError) {
      // Cancel payment intent if booking creation fails
      await getStripe().paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    return NextResponse.json({
      booking,
      client_secret: paymentIntent.client_secret,
    })

  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}