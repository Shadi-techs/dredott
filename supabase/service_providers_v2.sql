-- ============================================================
-- Service Providers v2 — Run once in Supabase SQL editor
-- ============================================================

-- 1. Add re-submission tracking + sub-services to service_providers
ALTER TABLE service_providers
  ADD COLUMN IF NOT EXISTS services_offered    text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS submission_count    integer       DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_resubmitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS previous_snapshot   jsonb,
  ADD COLUMN IF NOT EXISTS suspended_by_admin  boolean       DEFAULT false;

-- 2. Seed the 7 top-level service categories
-- (safe: only inserts rows that don't already exist by name_en)
DO $$
DECLARE
  cats JSONB := '[
    {"name_en":"Transport & Mobility",       "name_ar":"نقل وتنقل",          "icon":"🚗","sort_order":1},
    {"name_en":"Accommodation Services",     "name_ar":"خدمات الإقامة",       "icon":"🏠","sort_order":2},
    {"name_en":"Food & Beverage",            "name_ar":"طعام وشراب",          "icon":"🍽️","sort_order":3},
    {"name_en":"Activities & Entertainment", "name_ar":"أنشطة وترفيه",        "icon":"🏖️","sort_order":4},
    {"name_en":"Health & Wellness",          "name_ar":"صحة وعناية",          "icon":"💆","sort_order":5},
    {"name_en":"Professional Services",      "name_ar":"خدمات احترافية",      "icon":"📸","sort_order":6},
    {"name_en":"Other Services",             "name_ar":"خدمات أخرى",          "icon":"🔧","sort_order":7}
  ]';
  cat JSONB;
BEGIN
  FOR cat IN SELECT * FROM jsonb_array_elements(cats) LOOP
    INSERT INTO service_provider_categories (name_en, name_ar, icon, is_active, sort_order)
    VALUES (
      cat->>'name_en', cat->>'name_ar', cat->>'icon', true,
      (cat->>'sort_order')::int
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 3. Add module_services flag to platform_features (if not exists)
INSERT INTO platform_features (feature_key, module, enabled, description)
VALUES ('module_services', 'services', true, 'Services section on/off')
ON CONFLICT DO NOTHING;
