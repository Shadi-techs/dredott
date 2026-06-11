-- ============================================================
-- Cleanup fake/test data & approve Shadi's real property
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- STEP 1: See everything first (just to review before deleting)
SELECT
  p.id,
  p.name,
  p.type,
  p.area,
  p.status,
  p.review_status,
  p.price_per_night,
  p.created_at,
  pr.first_name,
  pr.last_name,
  au.email
FROM properties p
LEFT JOIN profiles pr ON pr.id = p.owner_user_id
LEFT JOIN auth.users au ON au.id = p.owner_user_id
ORDER BY p.created_at DESC;

-- ============================================================
-- STEP 2: Delete properties with NO real owner (orphaned/seeded)
-- ============================================================
DELETE FROM properties
WHERE owner_user_id IS NULL;

-- ============================================================
-- STEP 3: Delete fake/test properties created by any email
-- that is NOT shady.abdulsalam@gmail.com
-- (Run this only if you confirm the SELECT above shows fake ones)
-- ============================================================
/*
DELETE FROM properties p
USING auth.users au
WHERE p.owner_user_id = au.id
  AND au.email NOT IN (
    'shady.abdulsalam@gmail.com'
    -- add other real owner emails here if needed
  );
*/

-- ============================================================
-- STEP 4: Approve Shadi's property
-- Finds ALL properties owned by shady.abdulsalam@gmail.com
-- and sets them to approved + available
-- ============================================================
UPDATE properties p
SET
  review_status = 'approved',
  status        = 'available',
  reviewed_at   = NOW()
FROM auth.users au
WHERE p.owner_user_id = au.id
  AND au.email = 'shady.abdulsalam@gmail.com';

-- ============================================================
-- STEP 5: Confirm — should show your property as approved
-- ============================================================
SELECT
  p.id,
  p.name,
  p.status,
  p.review_status,
  au.email
FROM properties p
JOIN auth.users au ON au.id = p.owner_user_id
WHERE au.email = 'shady.abdulsalam@gmail.com';
