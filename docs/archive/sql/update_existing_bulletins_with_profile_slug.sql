-- Update existing bulletins to add profile_slug from their creator
-- Run this once to migrate old bulletins to the new profile-based system

-- This updates all bulletins that:
-- 1. Don't have a profile_slug yet (profile_slug IS NULL)
-- 2. Were created by a user who has a profile_slug set

UPDATE bulletins
SET profile_slug = users.profile_slug
FROM users
WHERE bulletins.created_by = users.id
  AND bulletins.profile_slug IS NULL
  AND users.profile_slug IS NOT NULL;

-- Check how many bulletins were updated
SELECT
  COUNT(*) as updated_bulletins,
  'Bulletins updated with profile_slug' as description
FROM bulletins
WHERE profile_slug IS NOT NULL;

-- Show bulletins still without profile_slug (users who haven't set one yet)
SELECT
  COUNT(*) as bulletins_without_profile,
  'Bulletins from users without profile_slug' as description
FROM bulletins b
LEFT JOIN users u ON b.created_by = u.id
WHERE b.profile_slug IS NULL;
