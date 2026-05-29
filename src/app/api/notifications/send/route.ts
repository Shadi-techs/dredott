// ============================================
// Notifications API Route
// Path: src/app/api/notifications/send/route.ts
// Sends email (Resend) after listing review actions
// WhatsApp: feature flag controlled
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// تحقق من feature flags في الـ DB
// ============================================
async function isFeatureEnabled(key: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', key)
    .single()
  return data?.enabled === true
}

// ============================================
// Email sender via Resend
// ============================================
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return { success: false, error: 'No API key' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DredottStay <no-reply@whitestork.com>',
      to,
      subject,
      html,
    }),
  })

  const data = await res.json()
  return res.ok ? { success: true, id: data.id } : { success: false, error: data.message }
}

// ============================================
// HTML Email templates
// ============================================
function buildEmailHtml(params: {
  owner_name: string
  listing_title: string
  action: string
  review_note?: string
}): { subject: string; html: string } {
  const { owner_name, listing_title, action, review_note } = params

  const base = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
      <div style="background:#0e1428;padding:24px 32px;border-bottom:2px solid #D4A843;">
        <span style="font-family:Georgia,serif;font-style:italic;font-size:20px;color:#D4A843;">
          DredottStay
        </span>
      </div>
      <div style="padding:32px;">
        <p style="color:#333;font-size:15px;">مرحباً ${owner_name}،</p>
        BODY
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#888;font-size:12px;">
          فريق DredottStay<br>
          <a href="https://whitestork.com" style="color:#D4A843;">whitestork.com</a>
        </p>
      </div>
    </div>
  `

  if (action === 'approved') {
    return {
      subject: `✅ تمت الموافقة على "${listing_title}" — DredottStay`,
      html: base.replace(
        'BODY',
        `<p style="color:#333;font-size:15px;line-height:1.7;">
          يسعدنا إخبارك بأنه <strong>تمت الموافقة</strong> على وحدتك
          "<strong>${listing_title}</strong>" وهي الآن ظاهرة للزوار على المنصة.
        </p>
        <p style="color:#333;font-size:14px;">
          يمكنك متابعة وحدتك ومشاهدة الإحصائيات من لوحة التحكم الخاصة بك.
        </p>`
      ),
    }
  }

  if (action === 'rejected') {
    return {
      subject: `وحدتك "${listing_title}" — يرجى المراجعة`,
      html: base.replace(
        'BODY',
        `<p style="color:#333;font-size:15px;line-height:1.7;">
          بعد مراجعة وحدتك "<strong>${listing_title}</strong>"،
          لم نتمكن من نشرها في الوقت الحالي.
        </p>
        ${
          review_note
            ? `<div style="background:#fff3f3;border-left:3px solid #f87171;padding:12px 16px;border-radius:4px;margin:16px 0;">
                <p style="color:#c0392b;font-size:13px;margin:0;">${review_note}</p>
               </div>`
            : ''
        }
        <p style="color:#333;font-size:14px;">
          يرجى التواصل معنا لمزيد من التوضيح.
        </p>`
      ),
    }
  }

  // needs_edit
  return {
    subject: `يرجى تعديل بيانات "${listing_title}" — DredottStay`,
    html: base.replace(
      'BODY',
      `<p style="color:#333;font-size:15px;line-height:1.7;">
        وحدتك "<strong>${listing_title}</strong>" تحتاج بعض التعديلات قبل النشر.
      </p>
      ${
        review_note
          ? `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:16px 0;">
              <p style="color:#92400e;font-size:13px;margin:0;">${review_note}</p>
             </div>`
          : ''
      }
      <p style="color:#333;font-size:14px;">
        يرجى تعديل الوحدة من لوحة التحكم وإعادة الإرسال.
      </p>`
    ),
  }
}

// ============================================
// Log notification to DB
// ============================================
async function logNotification(params: {
  owner_email: string
  type: string
  channel: string
  reference_type: string
  status: string
  subject?: string
  body_preview?: string
}) {
  const supabase = await createClient()
  await supabase.from('notifications_log').insert({
    recipient_email: params.owner_email,
    type: params.type,
    channel: params.channel,
    subject: params.subject,
    body_preview: params.body_preview?.slice(0, 200),
    reference_type: params.reference_type,
    status: params.status,
    sent_at: params.status === 'sent' ? new Date().toISOString() : null,
  })
}

// ============================================
// POST /api/notifications/send
// ============================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { owner_email, owner_name, listing_title, action, review_note } = body

    if (!owner_email || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const emailEnabled = await isFeatureEnabled('email_notifications')

    const notificationType =
      action === 'approved'
        ? 'listing_approved'
        : action === 'rejected'
        ? 'listing_rejected'
        : 'listing_needs_edit'

    if (!emailEnabled) {
      await logNotification({
        owner_email,
        type: notificationType,
        channel: 'email',
        reference_type: 'listing',
        status: 'skipped',
      })
      return NextResponse.json({ success: true, skipped: true })
    }

    const { subject, html } = buildEmailHtml({
      owner_name,
      listing_title,
      action,
      review_note,
    })

    const result = await sendEmail(owner_email, subject, html)

    await logNotification({
      owner_email,
      type: notificationType,
      channel: 'email',
      reference_type: 'listing',
      status: result.success ? 'sent' : 'failed',
      subject,
      body_preview: `Listing: ${listing_title} — Action: ${action}`,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Notification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}