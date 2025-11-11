-- Run this in Supabase SQL editor to check what policies currently exist
-- This is read-only and completely safe

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('bulletins', 'tokens')
ORDER BY tablename, policyname;
