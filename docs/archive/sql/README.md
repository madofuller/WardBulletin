# Archived SQL scripts

These are historical, one-off SQL scripts that were once run by hand against
the production database (organization migration and rollback, profile-sharing
migration, emergency policy rollback, policy inspection, slug backfill).

- They are **not** the source of truth for the schema or RLS policies. Several
  of them define conflicting policies.
- **Do not re-run them.** Running one now could overwrite or weaken current
  policies.
- The current schema lives in `supabase/migrations/`.

They are kept only for history and context.
