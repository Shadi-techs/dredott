# 🚀 Dredottv10 - COMPLETE IMPLEMENTATION GUIDE
## For Claude Code Terminal Agent

---

## 📋 PROJECT CONTEXT

**Project:** DredottStay - Short-term rental platform  
**Location:** Sharm El Sheikh, Egypt  
**Tech Stack:** Next.js 15+, Supabase, Stripe, Tailwind CSS  
**Business Model:** Lead-gen marketplace with price gate & internal scoring

---

## 🎯 YOUR MISSION

Implement all remaining files from this conversation into the Next.js project.  
You have 19 files to integrate. Follow this guide step-by-step.

---

## 📂 FILE STRUCTURE OVERVIEW

```
DREDOTT-stay/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx                          → Home (Editorial)
│   │   │   ├── about/page.tsx                    → About Us
│   │   │   ├── contact/page.tsx                  → Contact
│   │   │   ├── privacy/page.tsx                  → Privacy Policy
│   │   │   ├── login/page.tsx                    → Login (Price Gate)
│   │   │   ├── register/page.tsx                 → Register (3-step)
│   │   │   ├── properties/
│   │   │   │   └── [slug]/page.tsx               → Property Detail (Price Gate)
│   │   │   ├── booking/
│   │   │   │   ├── [propertyId]/page.tsx         → Booking Flow
│   │   │   │   └── confirmation/[bookingId]/page.tsx → Confirmation
│   │   │   └── admin/
│   │   │       ├── properties/[id]/
│   │   │       │   └── tabs/InternalScoreTab.tsx → Internal Score (Tab 5)
│   │   │       └── settings/
│   │   │           └── feature-flags/page.tsx    → Feature Flags
│   │   ├── api/
│   │   │   └── create-payment-intent/route.ts    → Stripe Payment API
│   │   ├── globals.css                           → Complete Stylesheet
│   │   └── layout.tsx                            → Root Layout
│   ├── components/
│   │   ├── Header.tsx                            → Editorial Header
│   │   └── Footer.tsx                            → Editorial Footer
│   └── lib/
│       └── utils.ts                              → Utility Functions
├── database/
│   └── migration_v10_phase1.sql                  → Database Schema
├── public/
│   └── fonts/                                    → Google Fonts (add links)
└── .env.local                                    → Environment Variables
```

---

## 🔢 IMPLEMENTATION ORDER

### **PHASE 1: Database (Required First!)**

1. **Run Database Migration**
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Copy contents of: database/migration_v10_phase1.sql
   # Run the entire script
   ```

2. **Create Storage Buckets**
   ```bash
   # In Supabase Dashboard → Storage
   # Create bucket: "profile-photos" (public)
   ```

---

### **PHASE 2: Core Files**

3. **globals.css**
   - Path: `src/app/globals.css`
   - Replace entire file
   - Contains: CSS variables, fonts, animations, utilities

4. **utils.ts**
   - Path: `src/lib/utils.ts`
   - Contains: Price gate, currency conversion, feature flags, rating calculations

5. **Header.tsx**
   - Path: `src/components/Header.tsx`
   - Editorial Wordmark logo, navigation, language selector

6. **Footer.tsx**
   - Path: `src/components/Footer.tsx`
   - Editorial Masthead, links, coordinates

---

### **PHASE 3: Auth Pages**

7. **login/page.tsx**
   - Path: `src/app/[locale]/login/page.tsx`
   - Price Gate aware, Google OAuth

8. **register/page.tsx**
   - Path: `src/app/[locale]/register/page.tsx`
   - 3-step flow with profile photo upload

---

### **PHASE 4: Public Pages**

9. **page.tsx (Home)**
   - Path: `src/app/[locale]/page.tsx`
   - Editorial style, video hero, search

10. **about/page.tsx**
    - Path: `src/app/[locale]/about/page.tsx`

11. **contact/page.tsx**
    - Path: `src/app/[locale]/contact/page.tsx`

12. **privacy/page.tsx**
    - Path: `src/app/[locale]/privacy/page.tsx`

---

### **PHASE 5: Property Pages**

13. **properties/[slug]/page.tsx**
    - Path: `src/app/[locale]/properties/[slug]/page.tsx`
    - Price Gate + Contact Gate logic

---

### **PHASE 6: Booking Flow**

14. **booking/[propertyId]/page.tsx**
    - Path: `src/app/[locale]/booking/[propertyId]/page.tsx`
    - 3-step booking with Stripe

15. **booking/confirmation/[bookingId]/page.tsx**
    - Path: `src/app/[locale]/booking/confirmation/[bookingId]/page.tsx`

16. **api/create-payment-intent/route.ts**
    - Path: `src/app/api/create-payment-intent/route.ts`
    - Stripe payment intent creation

---

### **PHASE 7: Admin Pages**

17. **admin/properties/[id]/** (Tab 5)
    - Path: Create new component for Internal Score Tab
    - Integrate into existing property editor as Tab 5

18. **admin/settings/feature-flags/page.tsx**
    - Path: `src/app/[locale]/admin/settings/feature-flags/page.tsx`
    - Super Admin only

---

### **PHASE 8: Environment Setup**

19. **Environment Variables**
    - File: `.env.local`
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    
    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    ```

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### **1. Google Fonts Setup**

Add to `src/app/layout.tsx` in `<head>`:

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### **2. Stripe Elements Provider**

The booking flow uses Stripe Elements. Ensure `@stripe/stripe-js` and `@stripe/react-stripe-js` are installed:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **3. Import Aliases**

All files use these import aliases (ensure `tsconfig.json` has them):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **4. Supabase Auth Helpers**

Install if not present:

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### **5. Lucide React Icons**

Install if not present:

```bash
npm install lucide-react
```

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: "Module not found: Can't resolve '@/components/Header'"**

**Fix:** Check that all components are in the correct paths:
- `src/components/Header.tsx`
- `src/components/Footer.tsx`

### **Issue 2: "ReferenceError: process is not defined"**

**Fix:** Stripe keys should use `NEXT_PUBLIC_` prefix:
```typescript
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
```

### **Issue 3: Database RLS errors**

**Fix:** Run the migration script. It includes all RLS policies.

### **Issue 4: Type errors in bookings**

**Fix:** Ensure `types/index.ts` includes all database types. Check Supabase generated types.

### **Issue 5: CSS not applying**

**Fix:** Ensure `globals.css` is imported in `layout.tsx`:
```typescript
import './globals.css'
```

---

## ✅ TESTING CHECKLIST

After implementation, test these flows:

### **1. Price Gate Flow**
- [ ] Go to property detail page (not logged in)
- [ ] See "Login to see price" button
- [ ] Click → Redirects to login with params
- [ ] Login → Redirects back → Price visible

### **2. Registration Flow**
- [ ] Click "Sign up"
- [ ] Step 1: Email + Password
- [ ] Step 2: Personal info
- [ ] Step 3: Upload photo (optional)
- [ ] Creates profile in database

### **3. Booking Flow**
- [ ] Go to platform_managed property
- [ ] Click "Book Now"
- [ ] Step 1: Select dates + guests
- [ ] Step 2: Guest details (pre-filled)
- [ ] Step 3: Enter test card (4242 4242 4242 4242)
- [ ] Booking created → Redirect to confirmation

### **4. Admin Internal Score**
- [ ] Login as Super Admin
- [ ] Go to Admin → Properties → [Select Property] → Tab 5
- [ ] Move slider (1-10)
- [ ] See display_rating update in preview
- [ ] Check verification boxes
- [ ] Save → Check database

### **5. Admin Feature Flags**
- [ ] Login as Super Admin
- [ ] Go to Admin → Settings → Feature Flags
- [ ] Toggle "Car Rentals" OFF
- [ ] Visit /en/cars → Should return 404
- [ ] Nav link should disappear
- [ ] Toggle back ON → Works again

---

## 📊 DATABASE VERIFICATION

Run these queries in Supabase SQL Editor to verify migration:

```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('price_hidden', 'internal_score', 'display_rating', 'internal_notes');

-- Check feature flags
SELECT * FROM feature_flags;

-- Check trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'properties' 
AND trigger_name = 'update_display_rating';

-- Test display_rating calculation
UPDATE properties 
SET internal_score = 8 
WHERE id = 'some-property-id';

SELECT id, internal_score, display_rating 
FROM properties 
WHERE id = 'some-property-id';
-- Should show: internal_score = 8, display_rating = 4.0
```

---

## 🚨 ROLLBACK PLAN

If something goes wrong with the database migration:

```sql
-- Rollback: Remove new columns
ALTER TABLE properties 
DROP COLUMN IF EXISTS price_hidden,
DROP COLUMN IF EXISTS internal_score,
DROP COLUMN IF EXISTS internal_notes,
DROP COLUMN IF EXISTS display_rating,
DROP COLUMN IF EXISTS verified_location,
DROP COLUMN IF EXISTS verified_photos,
DROP COLUMN IF EXISTS legal_docs_checked;

ALTER TABLE cars 
DROP COLUMN IF EXISTS price_hidden,
DROP COLUMN IF EXISTS internal_score,
DROP COLUMN IF EXISTS internal_notes,
DROP COLUMN IF EXISTS display_rating;

DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS property_inquiries CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;

DROP FUNCTION IF EXISTS calculate_display_rating CASCADE;
DROP TRIGGER IF EXISTS update_display_rating ON properties;
```

---

## 📝 POST-IMPLEMENTATION TASKS

### **1. Create First Super Admin**

Run in Supabase SQL Editor (after first user registers):

```sql
-- Replace 'YOUR_USER_ID' with actual user UUID from auth.users
INSERT INTO admin_users (user_id, role, can_manage_properties, can_manage_bookings, can_view_financials)
VALUES ('YOUR_USER_ID', 'super_admin', true, true, true)
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

### **2. Seed Sample Data (Optional)**

```sql
-- Add sample properties with internal scores
UPDATE properties 
SET 
  internal_score = (RANDOM() * 3 + 7)::INTEGER,
  price_hidden = (RANDOM() > 0.7),
  verified_location = true,
  verified_photos = true
WHERE internal_score IS NULL;
```

### **3. Test Stripe Webhooks (Optional)**

Create webhook endpoint for production:
```
src/app/api/webhooks/stripe/route.ts
```

---

## 🎯 SUCCESS CRITERIA

Your implementation is complete when:

- ✅ All 19 files successfully copied to correct paths
- ✅ Database migration runs without errors
- ✅ npm run dev starts without errors
- ✅ All 5 test flows pass (Price Gate, Register, Booking, Admin Score, Feature Flags)
- ✅ No TypeScript errors
- ✅ No console errors on page load
- ✅ Fonts load correctly (Editorial style visible)
- ✅ Database queries return expected data

---

## 📞 SUPPORT REFERENCES

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🔄 ITERATION WORKFLOW

If you encounter errors:

1. **Read the error message carefully**
2. **Check the file path** (is it correct?)
3. **Check imports** (all using @/* alias?)
4. **Check dependencies** (all packages installed?)
5. **Check database** (migration ran successfully?)
6. **Check .env.local** (all keys present?)

---

## ⚡ QUICK START COMMANDS

```bash
# Install dependencies
npm install

# Run database migration
# (Copy migration_v10_phase1.sql to Supabase SQL Editor and run)

# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npm run type-check
```

---

## 🎨 DESIGN SYSTEM REFERENCE

**Typography:**
- Headlines: `font-family: 'Cormorant Garamond', serif`
- Eyebrows: `font-family: 'JetBrains Mono', monospace`
- Body: `font-family: 'Inter', sans-serif`

**Colors:**
- Navy: `#2C3A6B`
- Gold: `#B8860B`, `#D4A843`
- Teal: `#2A9D8F`
- Cream: `#FAF9F6`

---

**Good luck! 🚀 You've got this!**
