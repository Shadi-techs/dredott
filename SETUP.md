# ============================================
# DredottSTAY — Setup & Deployment Guide
# Follow these steps in order
# ============================================

## STEP 1 — Prerequisites
- Node.js 18+ installed
- Git installed
- Accounts ready: Supabase, Vercel, Stripe, Resend

---

## STEP 2 — Clone & Install

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
```

---

## STEP 3 — Supabase Setup

1. Go to https://supabase.com → Create new project
2. Name it: DREDOTT-stay
3. Copy your project URL and keys to .env.local
4. Go to SQL Editor → New query
5. Paste the entire contents of `supabase/schema.sql`
6. Click Run
7. Go to Authentication → Providers → Enable Google OAuth
8. Add your Google Client ID and Secret
9. Go to Storage → Create bucket named "property-photos" (public)
10. Create bucket named "passports" (private)

---

## STEP 4 — First Super Admin

After running the schema, create your admin user:

```sql
-- Run in Supabase SQL Editor AFTER you sign up on the site
-- Replace 'your-user-id' with your actual Supabase user ID

INSERT INTO public.admin_users (
  user_id, role,
  can_create_property, can_edit_property, can_delete_property,
  can_view_bookings, can_manage_bookings, can_view_guests,
  can_view_passport, can_view_financials, can_approve_reviews,
  can_manage_inventory, can_manage_staff, can_manage_admins,
  can_change_commission
)
VALUES (
  'your-user-id', 'super_admin',
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
);

-- Also update your profile role
UPDATE public.profiles SET role = 'super_admin' WHERE id = 'your-user-id';
```

---

## STEP 5 — Stripe Setup

1. Go to https://stripe.com → Create account
2. Company name: DredottReal Estate
3. Copy Publishable Key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
4. Copy Secret Key → STRIPE_SECRET_KEY
5. Go to Webhooks → Add endpoint:
   URL: https://whitestorkstay.com/api/stripe/webhook
   Events: payment_intent.succeeded, payment_intent.payment_failed
6. Copy Webhook Secret → STRIPE_WEBHOOK_SECRET

---

## STEP 6 — Resend Email Setup

1. Go to https://resend.com → Create account (free up to 3k emails/month)
2. Add domain: whitestorkstay.com
3. Follow DNS verification steps
4. Create API key → RESEND_API_KEY
5. From address: booking@whitestorkstay.com

---

## STEP 7 — Facebook Pixel

1. Go to Meta Business Manager → Events Manager
2. Create Pixel → Copy Pixel ID → NEXT_PUBLIC_FACEBOOK_PIXEL_ID
3. Go to Conversions API → Set up manually
4. Copy Access Token → FACEBOOK_CONVERSIONS_API_TOKEN

---

## STEP 8 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time - creates project)
vercel

# Set environment variables in Vercel Dashboard:
# Project → Settings → Environment Variables
# Add all variables from .env.local.example

# Deploy to production
vercel --prod
```

---

## STEP 9 — Domain Setup

1. Buy domain: whitestorkstay.com (~$15/year on Namecheap)
2. In Vercel: Settings → Domains → Add domain
3. Update nameservers as instructed by Vercel
4. SSL is automatic

---

## STEP 10 — Sentry Error Monitoring

1. Go to https://sentry.io → Create account
2. Create new project → Next.js
3. Copy DSN → SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN
4. Run: npx @sentry/wizard@latest -i nextjs
5. Any error on the site will email you automatically

---

## STEP 11 — First Property

1. Sign in at whitestorkstay.com/en/login
2. Go to whitestorkstay.com/admin
3. Click "Add property"
4. Fill in all details
5. Add photos (upload to Supabase storage first)
6. Set pricing for all 6 durations
7. Toggle amenities
8. Publish!

---

## UPDATING THE SITE

Always follow this process:
1. Test changes locally: `npm run dev`
2. If all good: `vercel --prod`
3. Sentry will catch any errors automatically

## MANUAL BACKUP (before every update)

In Supabase → Database → Backups → Create backup
(Daily automatic backups are already enabled)

---

## MAINTENANCE COMMANDS

```bash
# Run locally
npm run dev

# Build check (catches TypeScript errors)
npm run build

# Check for issues
npm run lint
```
