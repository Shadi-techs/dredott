// src/app/api/reminders/route.ts
// CRON job: should be called daily (e.g., at 09:00 AM)
// Schedule via Vercel Cron Jobs or Supabase Edge Functions

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // uses service role key automatically
import { Resend } from 'resend';


const FROM_EMAIL = 'DREDOTT <noreply@dredott.com>';

// Helper to format date in Arabic/English (simple version)
function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
}

export async function GET() {
  try {
    const supabase = await createClient(); // server client with service role

    // Get all pending_claim subscriptions that are not expired
    const now = new Date();
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, user:users(email, raw_user_meta_data)')
      .eq('status', 'pending_claim')
      .gt('end_date', now.toISOString());

    if (error) throw error;

    for (const sub of subscriptions) {
      const userId = sub.user_id;
      const userEmail = sub.user?.email;
      const userName = sub.user?.raw_user_meta_data?.full_name || 'Valued Customer';
      const createdAt = new Date(sub.created_at);
      const daysSince = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
      
      // Determine if we need to send a reminder based on the plan: day 1, 7, 30, then every 30 days
      let shouldSend = false;
      let reminderType = '';

      if (daysSince === 1) {
        shouldSend = true;
        reminderType = 'first';
      } else if (daysSince === 7) {
        shouldSend = true;
        reminderType = 'week';
      } else if (daysSince === 30) {
        shouldSend = true;
        reminderType = 'month';
      } else if (daysSince > 30 && (daysSince - 30) % 30 === 0) {
        // every 30 days after the first month
        shouldSend = true;
        reminderType = 'recurring';
      }

      // Check if we already sent this specific reminder (to avoid duplicate)
      if (shouldSend) {
        const { data: existing } = await supabase
          .from('notification_logs') // you may have a different table; adjust accordingly
          .select('id')
          .eq('user_id', userId)
          .eq('type', `reminder_${reminderType}_${daysSince}`)
          .single();

        if (existing) continue; // already sent

        // Send email
        const emailSubject = {
          first: 'Reminder: Complete your property listing on DREDOTT',
          week: 'Your property listing is waiting – finish today!',
          month: 'Last chance: your subscription will expire soon',
          recurring: 'Monthly reminder: list your property now',
        }[reminderType];

        const emailBody = {
          first: `Hi ${userName},<br><br>You've successfully purchased a subscription but haven't listed your property yet. Click the button below to complete your listing and start earning.<br><br><a href="${process.env.NEXT_PUBLIC_BASE_URL}/en/properties/claim?subscription_id=${sub.id}" style="background:#D4A843;color:#0e1428;padding:10px 20px;text-decoration:none;border-radius:8px;">Complete Listing</a>`,
          week: `Hi ${userName},<br><br>It's been a week since you purchased your subscription. Don't let your plan go unused – add your property now.<br><br><a href="${process.env.NEXT_PUBLIC_BASE_URL}/en/properties/claim?subscription_id=${sub.id}" style="background:#D4A843;color:#0e1428;padding:10px 20px;text-decoration:none;border-radius:8px;">List Your Property</a>`,
          month: `Hi ${userName},<br><br>Your subscription will expire in ${Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / (1000*3600*24))} days. Please add your property before it expires to avoid losing your payment.<br><br><a href="${process.env.NEXT_PUBLIC_BASE_URL}/en/properties/claim?subscription_id=${sub.id}" style="background:#D4A843;color:#0e1428;padding:10px 20px;text-decoration:none;border-radius:8px;">List Now</a>`,
          recurring: `Hi ${userName},<br><br>Your subscription is still pending. Don't miss out – complete your listing today.<br><br><a href="${process.env.NEXT_PUBLIC_BASE_URL}/en/properties/claim?subscription_id=${sub.id}" style="background:#D4A843;color:#0e1428;padding:10px 20px;text-decoration:none;border-radius:8px;">Claim Your Property</a>`,
        }[reminderType];

        if (userEmail) {
          await new Resend(process.env.RESEND_API_KEY || '').emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject: emailSubject,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">${emailBody}</div>`,
          });
        }

        // Create internal notification
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'reminder',
          title: 'Reminder: List your property',
          message: `Your subscription is waiting. Click here to add your property.`,
          metadata: { subscription_id: sub.id, reminder_day: daysSince },
          read: false,
        });

        // Log that we sent this reminder to avoid duplicates
        await supabase.from('notification_logs').insert({
          user_id: userId,
          type: `reminder_${reminderType}_${daysSince}`,
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, processed: subscriptions.length });
  } catch (err) {
    console.error('Reminder cron error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}