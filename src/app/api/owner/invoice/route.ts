// ============================================
// Invoice Creation API
// Path: src/app/api/owner/invoice/route.ts
// Called after successful payment
// Creates invoice, sends email via Resend
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      plan,           // 'single' | 'multi' | 'company'
      is_premium,     // boolean
      amount,         // EGP amount
      payment_method, // 'card' | 'instapay' | 'vodafone_cash' | 'bank_transfer'
    } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    // Create invoice — trigger auto-generates invoice_number
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .insert({
        owner_id:       user.id,
        plan:           `${is_premium ? 'Premium' : 'Normal'} – ${plan}`,
        amount,
        currency:       'EGP',
        payment_method,
        status:         'paid',
        paid_at:        new Date().toISOString(),
      })
      .select()
      .single()

    if (invErr) throw invErr

    // Update subscription
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const PLAN_LIMITS: Record<string, number> = {
      single: 1, multi: 10, company: 999,
    }

    const { error: subErr } = await supabase
      .from('subscriptions')
      .upsert({
        owner_id:       user.id,
        plan,
        max_listings:   PLAN_LIMITS[plan] || 1,
        started_at:     new Date().toISOString(),
        expires_at:     expiresAt.toISOString(),
        payment_method,
        is_free:        false,
      }, { onConflict: 'owner_id' })

    if (subErr) throw subErr

    // Update premium flag if premium plan
    if (is_premium) {
      await supabase
        .from('profiles')
        .update({
          is_premium:          true,
          premium_expires_at:  expiresAt.toISOString(),
        })
        .eq('id', user.id)
    }

    // Send invoice email via Resend
    if (process.env.RESEND_API_KEY && profile?.email) {
      await sendInvoiceEmail({
        to:             profile.email,
        name:           `${profile.first_name} ${profile.last_name}`,
        invoiceNumber:  invoice.invoice_number,
        plan:           invoice.plan,
        amount,
        paymentMethod:  payment_method,
        paidAt:         invoice.paid_at,
        expiresAt:      expiresAt.toISOString(),
      })
    }

    return NextResponse.json({
      success:        true,
      invoice_number: invoice.invoice_number,
      invoice_id:     invoice.id,
    })
  } catch (err: any) {
    console.error('Invoice creation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Send invoice email ───────────────────────
async function sendInvoiceEmail({
  to, name, invoiceNumber, plan, amount,
  paymentMethod, paidAt, expiresAt,
}: {
  to: string; name: string; invoiceNumber: string
  plan: string; amount: number; paymentMethod: string
  paidAt: string; expiresAt: string
}) {
  const paidDate    = new Date(paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const expiryDate  = new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const methodLabel: Record<string, string> = {
    card:           'Credit / Debit Card',
    instapay:       'InstaPay',
    vodafone_cash:  'Vodafone Cash',
    bank_transfer:  'Bank Transfer',
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #FAF9F6; margin: 0; padding: 40px 20px; }
  .card { background: #fff; max-width: 520px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: #0e1428; padding: 32px; text-align: center; }
  .header h1 { font-family: Georgia, serif; font-style: italic; color: #FBF0D0; font-size: 28px; margin: 0 0 4px; }
  .header p { color: #D4A843; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
  .body { padding: 32px; }
  .inv-num { background: #FBF0D0; border-radius: 8px; padding: 12px 20px; text-align: center; margin-bottom: 28px; }
  .inv-num span { font-size: 22px; font-weight: 700; color: #2C3A6B; letter-spacing: 2px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .row:last-child { border-bottom: none; }
  .label { color: #6b7280; font-size: 13px; }
  .value { color: #2C3A6B; font-size: 13px; font-weight: 500; }
  .total { background: #0e1428; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; margin-top: 20px; }
  .total .label { color: rgba(255,255,255,0.6); font-size: 13px; }
  .total .value { color: #D4A843; font-size: 20px; font-weight: 700; }
  .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>DREDOTT</h1>
    <p>Red Sea · Stays</p>
  </div>
  <div class="body">
    <p style="color:#2C3A6B;font-size:15px;margin:0 0 20px">Hi ${name},</p>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;line-height:1.6">
      Thank you for your subscription. Your payment has been confirmed and your invoice is ready.
    </p>

    <div class="inv-num">
      <div style="font-size:11px;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:6px">Invoice Number</div>
      <span>${invoiceNumber}</span>
    </div>

    <div class="row"><span class="label">Plan</span><span class="value">${plan}</span></div>
    <div class="row"><span class="label">Payment method</span><span class="value">${methodLabel[paymentMethod] || paymentMethod}</span></div>
    <div class="row"><span class="label">Payment date</span><span class="value">${paidDate}</span></div>
    <div class="row"><span class="label">Subscription valid until</span><span class="value">${expiryDate}</span></div>

    <div class="total">
      <span class="label">Total paid</span>
      <span class="value">EGP ${amount.toLocaleString()}</span>
    </div>
  </div>
  <div class="footer">
    You can view this invoice anytime in your <a href="https://dredott.app/en/owner/account" style="color:#D4A843">account dashboard</a>.
    <br><br>
    Questions? WhatsApp us at <a href="https://wa.me/201200481043" style="color:#D4A843">+20 120 048 1043</a>
  </div>
</div>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Dredott <invoices@dredott.app>',
      to:      [to],
      subject: `Invoice ${invoiceNumber} — Dredott Subscription`,
      html,
    }),
  })
}