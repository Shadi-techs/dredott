import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, name, confirmationUrl } = await request.json();

  try {
    await resend.emails.send({
      from: 'DREDOTT <noreply@dredott.com>',
      to: email,
      subject: 'أكِّد حسابك في DREDOTT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0e1428;">مرحباً ${name}،</h1>
          <p>شكراً لتسجيلك في <strong style="color: #D4A843;">DREDOTT</strong></p>
          <p>للتأكيد حسابك، اضغط على الرابط التالي:</p>
          <a href="${confirmationUrl}" style="background-color: #D4A843; color: #0e1428; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
            تأكيد الحساب
          </a>
          <p style="color: #666; font-size: 12px;">هذا الرابط صالح لمدة 24 ساعة</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">DREDOTT - بوابتك للبحر الأحمر</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}