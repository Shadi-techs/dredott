-- ============================================
-- DredottSTAY — Complete Database Schema v10
-- Lead Gen Model: Price Gate + Internal Scoring
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'guest'
    CHECK (role IN ('super_admin', 'admin', 'viewer', 'property_owner', 'guest')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  whatsapp_preferred BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  nationality TEXT,
  city TEXT,
  language_preference TEXT DEFAULT 'en'
    CHECK (language_preference IN ('en', 'ar', 'it', 'ru', 'de')),
  travel_style TEXT[],
  interests TEXT[],
  bio TEXT,
  date_of_birth DATE,
  passport_url TEXT,
  instagram TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS & PERMISSIONS
-- ============================================
CREATE TABLE public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'viewer')),
  -- Permissions
  can_create_property BOOLEAN DEFAULT TRUE,
  can_edit_property BOOLEAN DEFAULT TRUE,
  can_delete_property BOOLEAN DEFAULT FALSE,
  can_view_bookings BOOLEAN DEFAULT TRUE,
  can_manage_bookings BOOLEAN DEFAULT TRUE,
  can_view_guests BOOLEAN DEFAULT TRUE,
  can_view_passport BOOLEAN DEFAULT FALSE,
  can_view_financials BOOLEAN DEFAULT FALSE,
  can_manage_inventory BOOLEAN DEFAULT TRUE,
  can_manage_staff BOOLEAN DEFAULT FALSE,
  can_manage_admins BOOLEAN DEFAULT FALSE,
  can_change_commission BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTIES (v10 - with Lead Gen Model)
-- ============================================
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  
  -- Names (5 languages)
  name TEXT NOT NULL,
  name_ar TEXT,
  name_it TEXT,
  name_ru TEXT,
  name_de TEXT,
  
  -- Descriptions (5 languages)
  description TEXT,
  description_ar TEXT,
  description_it TEXT,
  description_ru TEXT,
  description_de TEXT,
  
  -- Location
  area TEXT NOT NULL CHECK (area IN (
    'naama_bay', 'sharks_bay', 'old_market',
    'ras_um_sid', 'hadaba', 'montazah', 'nabq'
  )),
  type TEXT NOT NULL CHECK (type IN ('apartment', 'villa', 'studio', 'chalet')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'coming_soon')),
  
  -- Details
  bedrooms INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  
  -- Pricing (USD)
  price_per_night DECIMAL(10,2) NOT NULL,
  price_per_week DECIMAL(10,2),
  price_per_month DECIMAL(10,2),
  price_per_3months DECIMAL(10,2),
  price_per_6months DECIMAL(10,2),
  utilities_per_month DECIMAL(10,2) DEFAULT 0,
  
  -- 🆕 v10: Lead Gen Model
  price_hidden BOOLEAN DEFAULT FALSE,
  platform_managed BOOLEAN DEFAULT FALSE,
  
  -- 🆕 v10: Internal Quality System (replaces public reviews)
  internal_score INTEGER CHECK (internal_score BETWEEN 1 AND 10),
  internal_notes TEXT,
  display_rating DECIMAL(2,1),
  verified_location BOOLEAN DEFAULT FALSE,
  verified_photos BOOLEAN DEFAULT FALSE,
  legal_docs_checked BOOLEAN DEFAULT FALSE,
  
  -- Media
  photos TEXT[] DEFAULT '{}',
  cover_image_index INTEGER DEFAULT 0,
  video_tour_url TEXT,
  walkthrough_url TEXT,
  
  -- Amenities (default - always shown)
  wifi BOOLEAN DEFAULT TRUE,
  ac BOOLEAN DEFAULT TRUE,
  kitchen BOOLEAN DEFAULT TRUE,
  tv BOOLEAN DEFAULT TRUE,
  washing_machine BOOLEAN DEFAULT FALSE,
  pool_access BOOLEAN DEFAULT FALSE,
  balcony BOOLEAN DEFAULT FALSE,
  sea_view BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  security_24h BOOLEAN DEFAULT FALSE,
  
  -- Amenities (optional - toggle from admin)
  beach_access BOOLEAN DEFAULT FALSE,
  baby_cot BOOLEAN DEFAULT FALSE,
  kid_friendly BOOLEAN DEFAULT FALSE,
  snorkeling_gear BOOLEAN DEFAULT FALSE,
  bbq_area BOOLEAN DEFAULT FALSE,
  garden_view BOOLEAN DEFAULT FALSE,
  elevator BOOLEAN DEFAULT FALSE,
  gym_access BOOLEAN DEFAULT FALSE,
  daily_cleaning BOOLEAN DEFAULT FALSE,
  airport_transfer BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Relations
  owner_id UUID REFERENCES public.profiles(id),
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS (only for platform_managed properties)
-- ============================================
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE RESTRICT,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  
  -- Dates
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  duration_type TEXT DEFAULT 'nightly'
    CHECK (duration_type IN ('nightly', 'weekly', 'monthly', '3months', '6months')),
  nights INTEGER NOT NULL,
  
  -- Guests
  num_guests INTEGER NOT NULL DEFAULT 1,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  utilities_included BOOLEAN DEFAULT FALSE,
  utilities_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'EGP')),
  
  -- Payment
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Contact
  whatsapp_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOCKED DATES
-- ============================================
CREATE TABLE public.blocked_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- ============================================
-- 🆕 v10: FEATURE FLAGS
-- ============================================
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Seed initial feature flags
INSERT INTO public.feature_flags (key, enabled, description)
VALUES 
  ('car_rentals', true, 'Show/hide car rental section'),
  ('dining', false, 'Show/hide dining guide section'),
  ('experiences', false, 'Show/hide experiences section'),
  ('blog', false, 'Show/hide blog/area guides section');

-- ============================================
-- 🆕 v10: CAR RENTALS
-- ============================================
CREATE TABLE public.cars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  
  -- Names (5 languages)
  name TEXT NOT NULL,
  name_ar TEXT,
  name_it TEXT,
  name_ru TEXT,
  name_de TEXT,
  
  -- Descriptions (5 languages)
  description TEXT,
  description_ar TEXT,
  description_it TEXT,
  description_ru TEXT,
  description_de TEXT,
  
  -- Car details
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  transmission TEXT CHECK (transmission IN ('automatic', 'manual')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  seats INTEGER NOT NULL,
  doors INTEGER,
  
  -- Pricing (USD per day)
  price_per_day DECIMAL(10,2) NOT NULL,
  price_per_week DECIMAL(10,2),
  price_per_month DECIMAL(10,2),
  
  -- Lead Gen Model (same as properties)
  price_hidden BOOLEAN DEFAULT FALSE,
  internal_score INTEGER CHECK (internal_score BETWEEN 1 AND 10),
  internal_notes TEXT,
  display_rating DECIMAL(2,1),
  
  -- Media
  photos TEXT[] DEFAULT '{}',
  cover_image_index INTEGER DEFAULT 0,
  
  -- Features
  ac BOOLEAN DEFAULT TRUE,
  gps BOOLEAN DEFAULT FALSE,
  bluetooth BOOLEAN DEFAULT FALSE,
  backup_camera BOOLEAN DEFAULT FALSE,
  child_seat_available BOOLEAN DEFAULT FALSE,
  
  -- Availability
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'maintenance')),
  
  -- Contact
  owner_id UUID REFERENCES public.profiles(id),
  whatsapp_contact TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STAFF & CONTRACTORS
-- ============================================
CREATE TABLE public.staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  id_card_url TEXT,
  company_name TEXT,
  company_registration TEXT,
  contact_person TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id),
  type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  owner_present BOOLEAN DEFAULT FALSE,
  owner_confirmed BOOLEAN,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed_owner', 'declined_owner', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY REPORTS
-- ============================================
CREATE TABLE public.inventory_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  type TEXT NOT NULL CHECK (type IN ('item_log', 'maintenance', 'check_in_out')),
  title TEXT NOT NULL,
  rooms JSONB DEFAULT '[]',
  staff_id UUID REFERENCES public.staff(id),
  pdf_url TEXT,
  admin_notes TEXT,
  owner_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTY QUALITY INDEX
-- ============================================
CREATE TABLE public.property_quality (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE UNIQUE,
  furniture_condition INTEGER CHECK (furniture_condition BETWEEN 1 AND 5),
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
  appliances_condition INTEGER CHECK (appliances_condition BETWEEN 1 AND 5),
  overall_score DECIMAL(3,1),
  suggested_price_per_night DECIMAL(10,2),
  last_assessed TIMESTAMPTZ,
  notes TEXT
);

-- ============================================
-- NOTIFY ME (empty search results)
-- ============================================
CREATE TABLE public.notify_me (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT,
  whatsapp TEXT,
  area TEXT,
  dates_from DATE,
  dates_to DATE,
  max_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FLASH DEALS
-- ============================================
CREATE TABLE public.flash_deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  dates DATE[],
  original_price DECIMAL(10,2),
  deal_price DECIMAL(10,2),
  discount_percentage INTEGER,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAGE VIEWS
-- ============================================
CREATE TABLE public.page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  country TEXT
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notify_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view available properties"
  ON public.properties FOR SELECT
  USING (status = 'available');

CREATE POLICY "Admins can manage properties"
  ON public.properties FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
      AND (can_edit_property = TRUE OR can_create_property = TRUE)
  ));

-- Bookings policies
CREATE POLICY "Guests see own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = guest_id);

CREATE POLICY "Admins see all bookings"
  ON public.bookings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
      AND can_view_bookings = TRUE
  ));

-- Feature flags policies
CREATE POLICY "Anyone can view feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- Cars policies
CREATE POLICY "Anyone can view available cars"
  ON public.cars FOR SELECT
  USING (status = 'available');

CREATE POLICY "Admins can manage cars"
  ON public.cars FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
        AND can_create_property = TRUE
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 🆕 v10: Auto-calculate display_rating from internal_score
CREATE OR REPLACE FUNCTION calculate_display_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.internal_score IS NOT NULL THEN
    NEW.display_rating = ROUND((NEW.internal_score::DECIMAL / 10.0) * 5.0, 1);
  ELSE
    NEW.display_rating = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_property_display_rating
  BEFORE INSERT OR UPDATE OF internal_score ON public.properties
  FOR EACH ROW EXECUTE FUNCTION calculate_display_rating();

CREATE TRIGGER auto_calculate_car_display_rating
  BEFORE INSERT OR UPDATE OF internal_score ON public.cars
  FOR EACH ROW EXECUTE FUNCTION calculate_display_rating();

-- Auto-block dates when booking confirmed + paid
CREATE OR REPLACE FUNCTION block_dates_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  booking_date DATE;
BEGIN
  IF NEW.status = 'confirmed' AND NEW.payment_status = 'paid' THEN
    booking_date := NEW.check_in;
    WHILE booking_date < NEW.check_out LOOP
      INSERT INTO public.blocked_dates (property_id, date, reason)
      VALUES (NEW.property_id, booking_date, 'booking:' || NEW.id)
      ON CONFLICT (property_id, date) DO NOTHING;
      booking_date := booking_date + INTERVAL '1 day';
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_block_dates
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION block_dates_on_booking();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'guest');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_properties_platform_managed ON public.properties(platform_managed);
CREATE INDEX idx_properties_price_hidden ON public.properties(price_hidden);
CREATE INDEX idx_properties_internal_score ON public.properties(internal_score);
CREATE INDEX idx_properties_area ON public.properties(area);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_cars_price_hidden ON public.cars(price_hidden);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(enabled);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ DredottStay v10 Schema Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created:';
  RAISE NOTICE '   • All base tables';
  RAISE NOTICE '   • Feature flags (car_rentals, dining, experiences, blog)';
  RAISE NOTICE '   • Cars table with lead gen model';
  RAISE NOTICE '   • Price gate system (price_hidden)';
  RAISE NOTICE '   • Internal quality scoring (replaces reviews)';
  RAISE NOTICE '   • RLS policies';
  RAISE NOTICE '   • Triggers for auto-calculation';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT: Create your first Super Admin user';
  RAISE NOTICE '';
END $$;
