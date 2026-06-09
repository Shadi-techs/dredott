-- ============================================================
-- Migration: Complete Subscription & Packages System
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. PACKAGES (catalog) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.packages (
  id                        UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en                   TEXT          NOT NULL,
  name_ar                   TEXT,
  slots_count               INTEGER       NOT NULL DEFAULT 1,   -- max listings allowed
  price                     DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency                  TEXT          NOT NULL DEFAULT 'EGP',
  duration_days             INTEGER,                             -- NULL = lifetime
  is_active                 BOOLEAN       DEFAULT TRUE,
  is_popular                BOOLEAN       DEFAULT FALSE,
  display_order             INTEGER       DEFAULT 0,
  features                  JSONB         DEFAULT '{}',          -- {verified_badge, priority_search, analytics, premium_support}
  max_photos_per_listing    INTEGER       DEFAULT 10,
  max_flash_deals_per_month INTEGER       DEFAULT 0,
  max_featured_listings     INTEGER       DEFAULT 0,
  max_team_members          INTEGER       DEFAULT 1,
  created_at                TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 2. USER_SUBSCRIPTIONS (main subscription records) ─────
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                    UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id            UUID        REFERENCES public.packages(id),
  total_slots           INTEGER     NOT NULL DEFAULT 1,
  used_slots            INTEGER     NOT NULL DEFAULT 0,   -- cached count; use get_user_active_subscription for live count
  custom_total_slots    INTEGER,                          -- admin override
  custom_slots_reason   TEXT,
  status                TEXT        DEFAULT 'active'
                          CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  started_at            TIMESTAMPTZ DEFAULT NOW(),
  expires_at            TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  payment_method        TEXT        DEFAULT 'manual',
  auto_renew            BOOLEAN     DEFAULT FALSE,
  is_premium            BOOLEAN     DEFAULT FALSE,
  admin_notes           TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. SUBSCRIPTION_PACKAGES view (alias for check-limit API) ──
-- check-limit API does: from('subscriptions').select('subscription_packages(name)')
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id           UUID   DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT   NOT NULL,
  max_posts    INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. SUBSCRIPTIONS table (used by owner/account + check-limit) ──
-- Mirrors user_subscriptions with the fields those pages expect
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id           UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id     UUID          REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id   UUID          REFERENCES public.subscription_packages(id),
  max_posts    INTEGER       NOT NULL DEFAULT 1,
  is_free      BOOLEAN       DEFAULT FALSE,
  free_until   TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  is_premium   BOOLEAN       DEFAULT FALSE,
  started_at   TIMESTAMPTZ   DEFAULT NOW(),
  created_at   TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 5. RLS Policies ───────────────────────────────────────
ALTER TABLE public.packages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- packages: anyone can read
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
CREATE POLICY "Anyone can view active packages"
  ON public.packages FOR SELECT USING (is_active = TRUE);

-- admins can manage packages
DROP POLICY IF EXISTS "Admins manage packages" ON public.packages;
CREATE POLICY "Admins manage packages"
  ON public.packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- user_subscriptions: user sees their own
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage user_subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins manage user_subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- subscriptions: owner sees their own
DROP POLICY IF EXISTS "Owners view own subscriptions" ON public.subscriptions;
CREATE POLICY "Owners view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- subscription_packages: anyone can read
DROP POLICY IF EXISTS "Anyone can view subscription_packages" ON public.subscription_packages;
CREATE POLICY "Anyone can view subscription_packages"
  ON public.subscription_packages FOR SELECT USING (TRUE);

-- ── 6. get_user_active_subscription RPC ───────────────────
-- Used by: owner/packages page, owner/listings/new page, listing form
-- Returns: subscription summary with live slot counts
CREATE OR REPLACE FUNCTION public.get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id                UUID,
  package_id        UUID,
  package_name_en   TEXT,
  package_name_ar   TEXT,
  total_slots       INTEGER,
  used_slots        INTEGER,
  remaining_slots   INTEGER,
  status            TEXT,
  started_at        TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  is_premium        BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_used INTEGER;
BEGIN
  -- Count actual live listings (properties + cars)
  SELECT
    COALESCE(pc, 0) + COALESCE(cc, 0) INTO v_used
  FROM
    (SELECT COUNT(*)::INTEGER AS pc FROM public.properties WHERE owner_id = p_user_id) p,
    (SELECT COUNT(*)::INTEGER AS cc FROM public.cars       WHERE owner_id = p_user_id) c;

  RETURN QUERY
  SELECT
    us.id,
    us.package_id,
    pk.name_en                                               AS package_name_en,
    pk.name_ar                                               AS package_name_ar,
    COALESCE(us.custom_total_slots, us.total_slots)          AS total_slots,
    v_used                                                   AS used_slots,
    GREATEST(0, COALESCE(us.custom_total_slots, us.total_slots) - v_used) AS remaining_slots,
    us.status,
    us.started_at,
    us.expires_at,
    us.is_premium
  FROM public.user_subscriptions us
  JOIN public.packages pk ON pk.id = us.package_id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
  ORDER BY us.started_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_active_subscription(UUID) TO authenticated;

-- ── 7. Seed default packages ───────────────────────────────
INSERT INTO public.packages
  (name_en, name_ar, slots_count, price, currency, duration_days, is_active, is_popular, display_order, features, max_photos_per_listing, max_flash_deals_per_month, max_featured_listings, max_team_members)
VALUES
  (
    'Starter', 'المبتدئ',
    1, 0, 'EGP', NULL,
    TRUE, FALSE, 1,
    '{"verified_badge": false, "priority_search": false, "analytics": false, "premium_support": false}',
    5, 0, 0, 1
  ),
  (
    'Basic', 'الأساسي',
    3, 299, 'EGP', 30,
    TRUE, FALSE, 2,
    '{"verified_badge": false, "priority_search": false, "analytics": false, "premium_support": false}',
    10, 1, 0, 1
  ),
  (
    'Pro', 'المحترف',
    10, 599, 'EGP', 30,
    TRUE, TRUE, 3,
    '{"verified_badge": true, "priority_search": true, "analytics": true, "premium_support": false}',
    20, 5, 2, 3
  ),
  (
    'Elite', 'النخبة',
    999, 999, 'EGP', 30,
    TRUE, FALSE, 4,
    '{"verified_badge": true, "priority_search": true, "analytics": true, "premium_support": true}',
    50, 99, 99, 10
  )
ON CONFLICT DO NOTHING;

-- ── 8. Also sync subscription_packages for check-limit ─────
INSERT INTO public.subscription_packages (name, max_posts)
VALUES
  ('Starter', 1),
  ('Basic',   3),
  ('Pro',     10),
  ('Elite',   999)
ON CONFLICT DO NOTHING;
