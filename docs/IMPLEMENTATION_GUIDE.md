# 🎯 DUAL PAYMENT SYSTEM - IMPLEMENTATION GUIDE

## 📋 Overview
This system allows guests to choose between:
1. **Stripe Online Payment** - Instant confirmation (3.5% fee on owner)
2. **Manual Bank Transfer** - Zero fees, requires owner confirmation

---

## 📁 FILES TO ADD

### 1. Component
```
src/components/PaymentMethodSelector.tsx
```
**Purpose:** Shows 2 booking options in Property Detail page

---

### 2. Pages (3 files)

#### Manual Booking Request:
```
src/app/[locale]/booking/request/[id]/page.tsx
```
**Purpose:** Guest requests booking, enters dates/phone/guests

#### Owner Booking Requests Dashboard:
```
src/app/[locale]/owner/booking-requests/page.tsx
```
**Purpose:** Owner sees pending requests, sends WhatsApp payment details, confirms/rejects

#### Guest Manual Booking Tracker:
```
src/app/[locale]/bookings/manual/[id]/page.tsx
```
**Purpose:** Guest tracks manual booking status

---

### 3. API Routes (3 files)

#### Create Manual Booking:
```
src/app/api/bookings/manual/create/route.ts
```
**Purpose:** Creates pending manual booking, notifies owner

#### Confirm Manual Booking:
```
src/app/api/bookings/manual/confirm/route.ts
```
**Purpose:** Owner confirms payment received, blocks calendar

#### Reject Manual Booking:
```
src/app/api/bookings/manual/reject/route.ts
```
**Purpose:** Owner rejects request with reason

---

### 4. Updated Files

#### Property Detail Page:
```
src/app/[locale]/properties/[id]/page.tsx
```
**Change:** Replace single "Book Now" button with PaymentMethodSelector

---

## 🗄️ DATABASE CHANGES

### Migration SQL:
```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'stripe';

CREATE INDEX IF NOT EXISTS idx_bookings_type_status 
ON bookings(booking_type, status);
```

**Run in Supabase SQL Editor**

---

## 🔄 MANUAL BOOKING FLOW

### Guest Side:
1. Guest clicks "Request Booking" (Direct Transfer option)
2. Selects dates, enters phone number
3. Submits request → Status: `pending_confirmation`
4. Gets redirected to tracker page
5. Waits for owner WhatsApp message

### Owner Side:
1. Receives email + in-app notification
2. Opens `/owner/booking-requests`
3. Clicks "Send Payment Details" → WhatsApp opens with pre-filled message
4. Guest transfers money offline
5. Guest sends receipt via WhatsApp
6. Owner clicks "Confirm Payment Received"
7. System blocks dates, sends confirmation to guest

---

## 💰 COST BREAKDOWN

| Method | Guest Pays | Owner Receives | DREDOTT Cost |
|---|---|---|---|
| Stripe | $100 | $96.80 | **$0** ✅ |
| Manual | $100 | $100 | **$0** ✅ |

**Both methods = ZERO cost on platform!**

---

## ⚠️ SAFETY MEASURES

### 1. Terms Checkbox
In manual request page:
```
"I understand that manual bookings are direct between 
me and the property owner. DREDOTT is not responsible 
for payment disputes."
```

### 2. Dispute Resolution
Create page: `/support/dispute`
- Guest can report issues
- Admin reviews
- Penalty on owner if repeated

### 3. Owner Rating (Future)
- Track manual booking fulfillment
- Suspend if rating < 3/5

---

## 🧪 TESTING CHECKLIST

### Manual Booking:
- [ ] Guest can request booking
- [ ] Owner receives email notification
- [ ] WhatsApp link opens with pre-filled message
- [ ] Owner can confirm booking
- [ ] Calendar dates get blocked
- [ ] Guest receives confirmation email
- [ ] Owner can reject booking
- [ ] Guest sees rejection reason

### Stripe Booking (should still work):
- [ ] Guest can complete online payment
- [ ] Instant confirmation
- [ ] Calendar blocks automatically

---

## 🚀 DEPLOYMENT STEPS

### 1. Database Migration
```bash
# In Supabase SQL Editor:
ALTER TABLE bookings ADD COLUMN booking_type TEXT DEFAULT 'stripe';
```

### 2. Copy Files
```bash
# Components:
cp PaymentMethodSelector.tsx → src/components/

# Pages:
cp manual-request-page.tsx → src/app/[locale]/booking/request/[id]/page.tsx
cp owner-requests-page.tsx → src/app/[locale]/owner/booking-requests/page.tsx
cp guest-tracker-page.tsx → src/app/[locale]/bookings/manual/[id]/page.tsx

# API:
cp api-manual-create.ts → src/app/api/bookings/manual/create/route.ts
cp api-manual-confirm.ts → src/app/api/bookings/manual/confirm/route.ts
cp api-manual-reject.ts → src/app/api/bookings/manual/reject/route.ts

# Updated:
cp property-detail-updated.tsx → src/app/[locale]/properties/[id]/page.tsx
```

### 3. Environment Variables (Already set):
```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_BASE_URL=https://dredott.com
```

### 4. Test Locally
```bash
npm run dev
# Test both booking flows
```

### 5. Deploy
```bash
git add .
git commit -m "Add dual payment system (Stripe + Manual)"
git push
# Vercel auto-deploys
```

---

## 📊 BOOKING STATES

### Manual Booking:
```
pending_confirmation → confirmed (or cancelled)
```

### Stripe Booking:
```
confirmed (immediate after payment)
```

---

## 🎯 BENEFITS

### For Guests:
✅ Choice of payment method
✅ Zero fees with manual transfer
✅ Familiar WhatsApp communication
✅ Secure Stripe for foreign tourists

### For Owners:
✅ Receive 100% with manual transfer
✅ Full control over bookings
✅ Direct communication with guests
✅ Stripe for automated bookings

### For Platform:
✅ Zero cost on both methods
✅ Appeal to both markets (local + international)
✅ Competitive advantage
✅ Flexible scaling

---

## 📞 SUPPORT

If issues arise:
1. Check Supabase logs
2. Verify email sending (Resend dashboard)
3. Test WhatsApp links
4. Check calendar blocking logic

---

## ✅ DONE!

All 7 files ready + migration script + implementation guide.

**Ready to deploy! 🚀**