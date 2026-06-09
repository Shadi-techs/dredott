-- ============================================================
-- DEPRECATED: This migration is superseded by add_moderation_columns.sql
-- Run add_moderation_columns.sql instead — it includes everything here
-- plus review_status, cars columns, and RLS policies.
-- ============================================================

-- Kept for reference only — safe to skip if you run add_moderation_columns.sql
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 1;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS size_sqm  DECIMAL(10,2);
