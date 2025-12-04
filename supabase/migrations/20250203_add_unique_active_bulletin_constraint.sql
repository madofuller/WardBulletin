-- Migration: Add unique constraint for active bulletins
-- This ensures only one bulletin can be active per user/profile at a time
-- Prevents race conditions and multiple active bulletins

-- Drop existing constraint if it exists (in case of re-run)
ALTER TABLE bulletins DROP CONSTRAINT IF EXISTS unique_active_bulletin_per_user;
ALTER TABLE bulletins DROP CONSTRAINT IF EXISTS unique_active_bulletin_per_profile;

-- Create a partial unique index for bulletins without profile_slug
-- This ensures users without shared profiles can only have one active bulletin
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_bulletin_per_user
ON bulletins (created_by)
WHERE status = 'active' AND profile_slug IS NULL;

-- Create a partial unique index for bulletins with profile_slug
-- This ensures shared profiles can only have one active bulletin
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_bulletin_per_profile
ON bulletins (profile_slug)
WHERE status = 'active' AND profile_slug IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX unique_active_bulletin_per_user IS
'Ensures only one active bulletin per user for non-shared profiles';

COMMENT ON INDEX unique_active_bulletin_per_profile IS
'Ensures only one active bulletin per shared profile';
