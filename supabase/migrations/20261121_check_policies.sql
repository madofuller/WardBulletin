-- Read-only: lists the live row-level security setup for the tables the app
-- depends on. Run before and after Part 2 and keep both outputs.
-- (Not a migration; safe to run any time.)

SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('users', 'bulletins', 'tokens', 'profile_shares', 'profile_invitations',
                    'announcement_submissions', 'recurring_announcements', 'user_documents')
ORDER BY 1;

SELECT tablename, policyname, cmd, roles, permissive, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'bulletins', 'tokens', 'profile_shares', 'profile_invitations',
                    'announcement_submissions', 'recurring_announcements', 'user_documents')
ORDER BY tablename, cmd, policyname;
