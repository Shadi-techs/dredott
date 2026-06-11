-- ============================================================
-- Add missing columns to the properties table
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run multiple times — uses IF NOT EXISTS
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS title               TEXT,
  ADD COLUMN IF NOT EXISTS floor_area          NUMERIC,
  ADD COLUMN IF NOT EXISTS ai_description_draft TEXT,
  ADD COLUMN IF NOT EXISTS ai_description_used  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS compound_id         UUID,
  ADD COLUMN IF NOT EXISTS building_number     TEXT,
  ADD COLUMN IF NOT EXISTS street_name         TEXT,
  ADD COLUMN IF NOT EXISTS lat                 NUMERIC,
  ADD COLUMN IF NOT EXISTS lng                 NUMERIC,
  ADD COLUMN IF NOT EXISTS km_from_sea         NUMERIC,
  ADD COLUMN IF NOT EXISTS price_per_week      NUMERIC,
  ADD COLUMN IF NOT EXISTS price_per_month     NUMERIC,
  ADD COLUMN IF NOT EXISTS price_hidden        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS governorate         TEXT,
  ADD COLUMN IF NOT EXISTS review_status       TEXT DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS review_feedback     TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at         TIMESTAMP,
  ADD COLUMN IF NOT EXISTS amenities           JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS change_request_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason    TEXT,
  ADD COLUMN IF NOT EXISTS resubmission_count  INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMP DEFAULT NOW();

-- Confirm columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
