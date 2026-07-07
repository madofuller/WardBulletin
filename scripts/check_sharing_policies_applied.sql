-- Was the profile-sharing RLS migration (20250127_enable_profile_sharing_rls.sql)
-- ever applied to this database? Paste the whole file into the Supabase SQL
-- Editor and run it. Read the `verdict` column of the first result.
--
-- Why it matters: without that migration, tokens (bulletin content) are
-- readable only by the account that created them - a shared editor sees every
-- bulletin load blank no matter what the app code does.

-- 1. One-line verdict
SELECT
  CASE
    WHEN COUNT(*) FILTER (
      WHERE policyname = 'Users can read tokens they created or for shared profiles'
    ) > 0
    THEN 'YES - sharing policies are live: editors can read the owner''s bulletin content'
    WHEN COUNT(*) FILTER (
      WHERE policyname IN (
        'Users can view their own tokens',   -- original schema name
        'Users can read their own tokens'    -- emergency_rollback.sql name
      )
    ) > 0
    THEN 'NO - creator-only token policies are live: run supabase/migrations/20250127_enable_profile_sharing_rls.sql'
    ELSE 'UNCLEAR - no recognized token read policy found; review the full list below'
  END AS verdict
FROM pg_policies
WHERE tablename = 'tokens' AND cmd = 'SELECT';

-- 2. Every policy currently on the two tables (the ground truth)
SELECT tablename, cmd, policyname
FROM pg_policies
WHERE tablename IN ('tokens', 'bulletins')
ORDER BY tablename, cmd, policyname;

-- 3. The helper functions that migration creates (both should be listed)
SELECT proname AS helper_function_present
FROM pg_proc
WHERE proname IN ('user_has_profile_access', 'user_can_edit_profile');

-- 4. Is RLS even enabled on these tables? (should be true for both)
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('tokens', 'bulletins')
  AND relnamespace = 'public'::regnamespace;
