-- =============================================================================
-- Security hardening, PART 2 of 2 (removes access: run AFTER Part 1 AND after
-- the new frontend is deployed)
--
-- Closes:
--   * anonymous reads of every ward's bulletins, bulletin content (tokens),
--     invitations, and user rows (emails)
--   * self-service "invite yourself to someone else's ward": share and
--     invitation inserts now require owning the ward link
--
-- This file can't see the live policies when it's written, so it is defensive:
--   * it ABORTS (changes nothing) if Part 1 isn't applied or if the owner/editor
--     read policies that keep the editor working are missing
--   * it only drops policies that are wide open (USING true) or that let users
--     insert shares/invitations for wards they don't own
--   * every drop is reported with RAISE NOTICE, so the output is a change log
--
-- Run 20261121_check_policies.sql before and after to compare.
-- To undo: re-create the dropped policies from the "before" output.
-- =============================================================================

DO $$
DECLARE
  r RECORD;
  v_users_open BOOLEAN := false;
BEGIN
  -- ---- Guards -------------------------------------------------------------
  IF to_regprocedure('public.get_public_bulletin(text, timestamp without time zone)') IS NULL
     OR to_regprocedure('public.accept_invitation(text)') IS NULL
     OR to_regprocedure('public.get_invitation_by_token(text)') IS NULL THEN
    RAISE EXCEPTION 'Part 2 aborted: run 20261121_part1_security_functions.sql first.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bulletins'
                 AND policyname = 'Users can read bulletins they created or have shared access to')
     OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tokens'
                 AND policyname = 'Users can read tokens they created or for shared profiles') THEN
    RAISE EXCEPTION 'Part 2 aborted: the owner/editor read policies from 20250127_enable_profile_sharing_rls.sql are not in place. Removing the open read policies now would lock editors out of their own bulletins. Apply that migration first.';
  END IF;

  -- ---- 1. Open reads on bulletins, tokens, invitations ---------------------
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('bulletins', 'tokens', 'profile_invitations')
      AND cmd = 'SELECT'
      AND (qual IS NULL OR btrim(qual) IN ('true', '(true)'))
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Dropped open read policy "%" on %', r.policyname, r.tablename;
  END LOOP;

  -- Invitations stay readable by the ward owner who sent them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Owners can read their invitations') THEN
    CREATE POLICY "Owners can read their invitations"
      ON public.profile_invitations FOR SELECT TO authenticated
      USING (owner_id = auth.uid());
    RAISE NOTICE 'Created policy "Owners can read their invitations"';
  END IF;

  -- ---- 2. Anonymous reads of users (emails) ---------------------------------
  -- Signed-in features still look up other users (collaborator emails, ward
  -- link availability), so signed-in read access is kept; only anonymous goes.
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND cmd = 'SELECT'
      AND (qual IS NULL OR btrim(qual) IN ('true', '(true)'))
      AND (roles @> ARRAY['public']::name[] OR roles @> ARRAY['anon']::name[])
  LOOP
    EXECUTE format('DROP POLICY %I ON public.users', r.policyname);
    RAISE NOTICE 'Dropped anonymous read policy "%" on users', r.policyname;
    v_users_open := true;
  END LOOP;
  IF v_users_open AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users'
                                  AND policyname = 'Signed-in users can read users') THEN
    CREATE POLICY "Signed-in users can read users"
      ON public.users FOR SELECT TO authenticated USING (true);
    RAISE NOTICE 'Created policy "Signed-in users can read users" (replaces the anonymous one)';
  END IF;

  -- ---- 3. Share / invitation inserts must come from the ward owner ---------
  -- Accepting an invitation now goes through accept_invitation(), which checks
  -- the token and runs with its own rights, so no user needs to insert a share
  -- for a ward they don't own.
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('profile_shares', 'profile_invitations')
      AND cmd = 'INSERT'
      AND policyname NOT IN ('Ward owners can insert shares', 'Ward owners can insert invitations')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Dropped insert policy "%" on %', r.policyname, r.tablename;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_shares'
                 AND policyname = 'Ward owners can insert shares') THEN
    CREATE POLICY "Ward owners can insert shares"
      ON public.profile_shares FOR INSERT TO authenticated
      WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.profile_slug = profile_shares.profile_slug)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Ward owners can insert invitations') THEN
    CREATE POLICY "Ward owners can insert invitations"
      ON public.profile_invitations FOR INSERT TO authenticated
      WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.profile_slug = profile_invitations.profile_slug)
      );
  END IF;

  -- FOR ALL policies also grant inserts. They aren't dropped automatically
  -- (that would also remove reads/updates); flag them for a human to review.
  FOR r IN
    SELECT tablename, policyname, qual, with_check FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('bulletins', 'tokens', 'users', 'profile_shares', 'profile_invitations')
      AND cmd = 'ALL'
  LOOP
    RAISE WARNING 'Review FOR ALL policy "%" on % (USING: %, CHECK: %). It may still allow what Part 2 closes.',
      r.policyname, r.tablename, r.qual, r.with_check;
  END LOOP;
END $$;
