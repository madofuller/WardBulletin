-- Diagnose (and optionally recover) duplicate bulletin token rows.
--
-- Background: bulletin content lives in the `tokens` table, unique per
-- (key, created_by) - NOT per key. When a bulletin is saved by both its
-- creator and a shared-profile editor, the same key can exist under two
-- different accounts. The editor used to load such bulletins as BLANK
-- (the app's .single() lookup errored on duplicates and treated it as
-- "no data"), and re-saving from that blank screen could overwrite the
-- creator's row with empty values.
--
-- Run each section in the Supabase SQL Editor (as postgres, bypasses RLS).
-- Sections 1-3 are read-only. Section 4 modifies data - review Section 3
-- output first.

-- ============================================================
-- 1. Which RLS policies are live on bulletins/tokens?
--    (Confirms whether the shared-profile policies from
--    20250127_enable_profile_sharing_rls.sql are applied.)
-- ============================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('bulletins', 'tokens')
ORDER BY tablename, cmd, policyname;

-- ============================================================
-- 2. All duplicate token keys (same key, multiple accounts),
--    with who owns each row and how much content it holds.
-- ============================================================
WITH dup_keys AS (
  SELECT key
  FROM public.tokens
  GROUP BY key
  HAVING COUNT(DISTINCT created_by) > 1
)
SELECT
  t.key,
  u.email AS row_owner_email,
  t.created_by,
  length(t.value) AS value_length,
  left(t.value, 80) AS value_preview,
  t.created_at
FROM public.tokens t
JOIN dup_keys d ON d.key = t.key
LEFT JOIN public.users u ON u.id = t.created_by
ORDER BY t.key, t.created_at;

-- ============================================================
-- 3. Suspected wipes: duplicate keys where the BULLETIN CREATOR's
--    row is empty but another account's row still has content.
--    These are the rows Section 4 would restore.
-- ============================================================
WITH bulletin_tokens AS (
  SELECT
    t.key,
    t.created_by,
    t.value,
    b.created_by AS bulletin_creator,
    b.profile_slug
  FROM public.tokens t
  JOIN public.bulletins b
    ON b.slug = substring(t.key FROM '^bulletin-(.*)-[^-]+$')
  WHERE t.key LIKE 'bulletin-%'
),
creator_rows AS (
  SELECT * FROM bulletin_tokens WHERE created_by = bulletin_creator
),
other_rows AS (
  SELECT * FROM bulletin_tokens WHERE created_by <> bulletin_creator
)
SELECT
  c.key,
  c.profile_slug,
  length(c.value) AS creator_value_length,
  left(c.value, 60) AS creator_value_preview,
  o.created_by AS other_row_owner,
  length(o.value) AS other_value_length,
  left(o.value, 60) AS other_value_preview
FROM creator_rows c
JOIN other_rows o ON o.key = c.key
WHERE (c.value IS NULL OR c.value IN ('', '[]', '{}', 'none'))
  AND o.value IS NOT NULL
  AND o.value NOT IN ('', '[]', '{}', 'none')
ORDER BY c.key;

-- ============================================================
-- 4. RECOVERY (destructive - review Section 3 output first!)
--    Copies content from the surviving duplicate row into the
--    bulletin creator's row, ONLY where the creator's row is
--    currently empty. Uncomment to run.
-- ============================================================
-- WITH bulletin_tokens AS (
--   SELECT
--     t.id,
--     t.key,
--     t.created_by,
--     t.value,
--     b.created_by AS bulletin_creator
--   FROM public.tokens t
--   JOIN public.bulletins b
--     ON b.slug = substring(t.key FROM '^bulletin-(.*)-[^-]+$')
--   WHERE t.key LIKE 'bulletin-%'
-- ),
-- recoverable AS (
--   SELECT c.id AS creator_token_id, o.value AS recovered_value
--   FROM bulletin_tokens c
--   JOIN bulletin_tokens o
--     ON o.key = c.key AND o.created_by <> c.created_by
--   WHERE c.created_by = c.bulletin_creator
--     AND (c.value IS NULL OR c.value IN ('', '[]', '{}', 'none'))
--     AND o.value IS NOT NULL
--     AND o.value NOT IN ('', '[]', '{}', 'none')
-- )
-- UPDATE public.tokens t
-- SET value = r.recovered_value
-- FROM recoverable r
-- WHERE t.id = r.creator_token_id;
