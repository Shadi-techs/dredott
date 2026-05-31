// ============================================
// DredottSTAY — Stripe Webhook
// Handles: payment success → confirm booking
// Auto-blocks calendar dates via DB trigger
// Sends confirmation email via Resend
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-04-22.dahlia' })
}
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'


export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { property_id, guest_id } = paymentIntent.metadata

    // Update booking to confirmed + paid
    const { data: booking } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select(`
        *,
        profiles:guest_id (first_name, email),
        properties:property_id (name, area)
      `)
      .single()

    // DB trigger auto-blocks dates (see schema.sql)

    // Send confirmation email
    if (booking?.profiles?.email) {
      await new Resend(process.env.RESEND_API_KEY || '').emails.send({
        from: process.env.EMAIL_FROM!,
        to: booking.profiles.email,
        subject: `Booking confirmed — ${booking.properties?.name}`,
        html: buildConfirmationEmail(booking),
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('bookings')
      .update({ status: 'cancelled', payment_status: 'pending' })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}

function buildConfirmationEmail(booking: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: Inter, sans-serif; background: #FAF9F6; margin: 0; padding: 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 0.5px solid #D4A843;">
        
        <!-- Header -->
        <div style="background: #2C3A6B; padding: 24px 28px; text-align: center;">
          <div style="color: #D4A843; font-size: 18px; font-weight: 500;">DredottStay</div>
          <div style="color: #A0A8B4; font-size: 10px; letter-spacing: 0.1em; margin-top: 3px;">SHARM EL SHEIKH · EGYPT</div>
        </div>

        <!-- Hero -->
        <div style="background: #1e3358; padding: 20px 28px; text-align: center; border-bottom: 2px solid #B8860B;">
          <div style="width: 48px; height: 48px; background: #2A9D8F; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">✓</div>
          <div style="color: #FBF0D0; font-size: 20px; font-weight: 500;">Booking confirmed!</div>
          <div style="color: #A0A8B4; font-size: 13px; margin-top: 4px;">Your stay in Sharm El Sheikh is all set.</div>
        </div>

        <!-- Body -->
        <div style="padding: 22px 28px;">
          <p style="color: #2C3A6B; font-size: 14px; margin-bottom: 14px;">
            Hi <strong style="color: #B8860B;">${booking.profiles?.first_name || 'Guest'}</strong>,<br/>
            Thank you for booking with DredottStay.
          </p>

          <!-- Booking details -->
          <div style="background: #FBF0D0; border: 0.5px solid #D4A843; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
            <div style="font-size: 10px; font-weight: 500; letter-spacing: 0.1em; color: #8B6914; margin-bottom: 10px;">BOOKING DETAILS</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;"><span style="color: #A0A8B4;">Property</span><span style="color: #2C3A6B; font-weight: 500;">${booking.properties?.name}</span></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;"><span style="color: #A0A8B4;">Check-in</span><span style="color: #2C3A6B; font-weight: 500;">${booking.check_in}</span></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;"><span style="color: #A0A8B4;">Check-out</span><span style="color: #2C3A6B; font-weight: 500;">${booking.check_out}</span></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;"><span style="color: #A0A8B4;">Duration</span><span style="color: #2C3A6B; font-weight: 500;">${booking.nights} nights</span></div>
            <div style="border-top: 0.5px solid rgba(212,168,67,0.4); padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 500;">
              <span style="color: #2C3A6B;">Total paid</span>
              <span style="color: #B8860B;">$${booking.total_amount}</span>
            </div>
          </div>

          <!-- WhatsApp note -->
          <div style="background: #E1F5EE; border-radius: 10px; padding: 14px; display: flex; gap: 10px; margin-bottom: 16px;">
            <div style="font-size: 12px; color: #0F6E56; line-height: 1.6;">
              <strong style="color: #085041;">Shady will contact you on WhatsApp</strong> at +20 120 048 1043 within the next few hours to verify your details and share check-in instructions.
            </div>
          </div>

          <!-- What happens next -->
          <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: #8B6914; margin-bottom: 8px;">WHAT HAPPENS NEXT</div>
          <div style="font-size: 12px; color: #555; margin-bottom: 6px;">✓ You'll receive a WhatsApp message from us shortly</div>
          <div style="font-size: 12px; color: #555; margin-bottom: 6px;">✓ We'll confirm your check-in time and share directions</div>
          <div style="font-size: 12px; color: #555; margin-bottom: 6px;">✓ 2 days before arrival — we'll send a full reminder</div>
          <div style="font-size: 12px; color: #555; margin-bottom: 16px;">✓ After your stay — we'll ask for a short review</div>

          <div style="font-size: 11px; color: #A0A8B4; text-align: center; line-height: 1.7;">
            Free cancellation up to 48 hours before check-in. Questions? Reply to this email or WhatsApp us.
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2C3A6B; padding: 16px 28px; text-align: center;">
          <div style="color: #D4A843; font-size: 13px; font-weight: 500; margin-bottom: 6px;">DredottStay · Sharm El Sheikh</div>
          <div style="color: #A0A8B4; font-size: 10px; margin-bottom: 8px;">Sharm Hills Mall, Al Montazah, Sharm El Sheikh, South Sinai, Egypt</div>
          <div style="font-size: 10px; color: rgba(160,168,180,0.5);">© ${new Date().getFullYear()} DredottReal Estate. All rights reserved.</div>
        </div>

      </div>
    </body>
    </html>
  `
}
