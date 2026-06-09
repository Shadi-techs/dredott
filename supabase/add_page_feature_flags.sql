-- ============================================================
-- Migration: Add page-level feature flags to platform_features
-- Run this in Supabase SQL Editor
-- ============================================================

INSERT INTO platform_features (feature_key, module, enabled, description, description_ar)
VALUES
  ('cars_page_accessible',       'cars',       true,  'Cars page accessible to public',       'صفحة السيارات متاحة للزوار'),
  ('properties_page_accessible', 'properties', true,  'Properties page accessible to public', 'صفحة الوحدات متاحة للزوار'),
  ('jobs_page_enabled',          'jobs',        true,  'Jobs page accessible to public',       'صفحة الوظائف متاحة للزوار'),
  ('registration_enabled',       'general',    true,  'New user registration enabled',        'تسجيل المستخدمين الجدد مفعّل')
ON CONFLICT (feature_key) DO NOTHING;
