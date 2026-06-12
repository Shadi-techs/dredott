// ============================================
// Stripe Checkout Session — Subscriptions & Service Providers
// Path: src/app/api/stripe/create-checkout/route.ts
// EGP prices converted to USD at ~50 EGP/USD
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-04-22.dahlia' })
}

const EGP_TO_USD_RATE = 50 // 1 USD ≈ 50 EGP (update as needed)

function egpToUsdCents(egpAmount: number): number {
  return Math.round((egpAmount / EGP_TO_USD_RATE) * 100)
}

export async function POST(req: NextRequest) {
  try {
    const {
      subscription_id,
      service_provider_id,
      amount,        // in EGP
      currency,      // 'egp' (we convert to usd for Stripe)
      description,
      success_url,
      cancel_url,
      metadata = {},
    } = await req.json()

    if (!amount || !success_url || !cancel_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amountCents = egpToUsdCents(Number(amount))
    if (amountCents < 50) {
      return NextResponse.json({ error: 'Amount too small' }, { status: 400 })
    }

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Dredott Subscription',
              description: `EGP ${Number(amount).toLocaleString()} — Dredott`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url,
      cancel_url,
      metadata: {
        ...(subscription_id     ? { subscription_id }      : {}),
        ...(service_provider_id ? { service_provider_id }  : {}),
        egp_amount: String(amount),
        ...metadata,
      },
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err: any) {
    console.error('[create-checkout]', err)
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 500 })
  }
}
