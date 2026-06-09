-- ============================================================
-- Migration: Fix properties table - add missing columns
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add bathrooms column (was missing from original schema)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 1;

-- Add size_sqm column (used in listing form)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS size_sqm DECIMAL(10,2);

-- Add owner_policy so owners can insert their own properties
-- (the current INSERT policy may be missing)
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

-- Allow owners to update their own properties
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
