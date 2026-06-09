-- ============================================================
-- Migration: Add moderation + missing columns to properties & cars
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. PROPERTIES: add missing columns ───────────────────────

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS bathrooms          INTEGER     DEFAULT 1,
  ADD COLUMN IF NOT EXISTS size_sqm           DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS review_status      TEXT        DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS review_note        TEXT,
  ADD COLUMN IF NOT EXISTS change_request_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT,
  ADD COLUMN IF NOT EXISTS resubmission_count INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_status TEXT       DEFAULT 'unverified';

-- Add CHECK constraints (safe: won't fail if constraint already exists via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'properties_review_status_check'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_review_status_check
      CHECK (review_status IN ('pending_review', 'approved', 'rejected', 'changes_requested'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'properties_verification_status_check'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_verification_status_check
      CHECK (verification_status IN ('unverified', 'verified', 'flagged'));
  END IF;
END $$;

-- ── 2. CARS: add missing columns ─────────────────────────────

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS review_status         TEXT    DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS review_note           TEXT,
  ADD COLUMN IF NOT EXISTS change_request_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason      TEXT,
  ADD COLUMN IF NOT EXISTS resubmission_count    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_status   TEXT    DEFAULT 'unverified';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cars_review_status_check'
  ) THEN
    ALTER TABLE public.cars
      ADD CONSTRAINT cars_review_status_check
      CHECK (review_status IN ('pending_review', 'approved', 'rejected', 'changes_requested'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cars_verification_status_check'
  ) THEN
    ALTER TABLE public.cars
      ADD CONSTRAINT cars_verification_status_check
      CHECK (verification_status IN ('unverified', 'verified', 'flagged'));
  END IF;
END $$;

-- ── 3. CARS: allow 'coming_soon' status (owner listing form uses it) ──
-- Drop and recreate the CHECK constraint to add 'coming_soon'
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_status_check;
ALTER TABLE public.cars
  ADD CONSTRAINT cars_status_check
  CHECK (status IN ('available', 'unavailable', 'maintenance', 'coming_soon'));

-- ── 4. RLS: owners can insert/update their own properties & cars ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'properties' AND policyname = 'Owners can insert their own properties'
  ) THEN
    CREATE POLICY "Owners can insert their own properties"
      ON public.properties FOR INSERT
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'properties' AND policyname = 'Owners can update their own properties'
  ) THEN
    CREATE POLICY "Owners can update their own properties"
      ON public.properties FOR UPDATE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cars' AND policyname = 'Owners can insert their own cars'
  ) THEN
    CREATE POLICY "Owners can insert their own cars"
      ON public.cars FOR INSERT
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cars' AND policyname = 'Owners can update their own cars'
  ) THEN
    CREATE POLICY "Owners can update their own cars"
      ON public.cars FOR UPDATE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- ── 5. Reload schema cache (PostgREST) ───────────────────────
NOTIFY pgrst, 'reload schema';

-- ── Fix: ensure DEFAULT fires for rows inserted without review_status ──
ALTER TABLE public.properties ALTER COLUMN review_status SET DEFAULT 'pending_review';
ALTER TABLE public.cars       ALTER COLUMN review_status SET DEFAULT 'pending_review';

-- Backfill any existing NULL rows
UPDATE public.properties SET review_status = 'pending_review' WHERE review_status IS NULL;
UPDATE public.cars       SET review_status = 'pending_review' WHERE review_status IS NULL;
