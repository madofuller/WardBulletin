-- =============================================================================
-- Security hardening, PART 2 of 2 (removes access: run AFTER Part 1 AND after
-- the new frontend is deployed)
--
-- Written against the live policy list (snapshot taken 2026-11-23). Closes:
--   * anonymous reads of every ward's bulletins (all rows have
--     view_permission = 'public', so "Public bulletins are readable by anyone"
--     exposed everything, drafts included) and of their content (tokens)
--   * the "Allow all operations" policy on profile_invitations, which let
--     anyone read, create, edit or delete invitations (and so invite
--     themselves into any ward)
--   * anonymous reads of users (emails)
--   * self-service share inserts ("Users can accept invitations"); accepting
--     now goes through accept_invitation(), which checks the token server-side
--
-- After this, anonymous visitors reach bulletins only through
-- get_public_bulletin() and invitations only through get_invitation_by_token()
-- (both from Part 1). Owners/editors keep their existing per-user policies.
--
-- Safe to re-run. Aborts (changes nothing) if Part 1 or the owner/editor read
-- policies are missing. Every change is reported with RAISE NOTICE.
-- To undo: re-create the dropped policies from the "before" snapshot.
-- =============================================================================

DO $$
DECLARE
  r RECORD;
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
    RAISE EXCEPTION 'Part 2 aborted: the owner/editor read policies are not in place; removing the public read policies would lock editors out of their own bulletins.';
  END IF;

  -- ---- 1. Named open policies on the live database --------------------------
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND (tablename, policyname) IN (
      ('bulletins',           'Public bulletins are readable by anyone'),
      ('tokens',              'Allow anon read for public bulletin tokens'),
      ('tokens',              'Allow read tokens for public bulletins (public read)'),
      ('profile_invitations', 'Allow all operations on profile_invitations'),
      ('users',               'Public can view user profiles by slug'),
      ('users',               'Allow anon read of profiles with slugs'),
      ('profile_shares',      'Users can accept invitations')
    )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Dropped policy "%" on %', r.policyname, r.tablename;
  END LOOP;

  -- ---- 2. Anything else still wide open on these tables --------------------
  FOR r IN
    SELECT tablename, policyname, cmd FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('bulletins', 'tokens', 'profile_invitations', 'users')
      AND cmd IN ('SELECT', 'ALL')
      AND (qual IS NULL OR btrim(qual) IN ('true', '(true)'))
      AND (roles @> ARRAY['public']::name[] OR roles @> ARRAY['anon']::name[])
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Dropped open % policy "%" on %', r.cmd, r.policyname, r.tablename;
  END LOOP;

  -- ---- 3. Invitations: owner-managed, readable by the ward's editors -------
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Ward members can read invitations') THEN
    CREATE POLICY "Ward members can read invitations"
      ON public.profile_invitations FOR SELECT TO authenticated
      USING (owner_id = auth.uid() OR public.user_has_profile_access(profile_slug, auth.uid()));
    RAISE NOTICE 'Created policy "Ward members can read invitations"';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Ward owners can insert invitations') THEN
    CREATE POLICY "Ward owners can insert invitations"
      ON public.profile_invitations FOR INSERT TO authenticated
      WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.profile_slug = profile_invitations.profile_slug)
      );
    RAISE NOTICE 'Created policy "Ward owners can insert invitations"';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Ward owners can update invitations') THEN
    CREATE POLICY "Ward owners can update invitations"
      ON public.profile_invitations FOR UPDATE TO authenticated
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());
    RAISE NOTICE 'Created policy "Ward owners can update invitations"';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_invitations'
                 AND policyname = 'Ward owners can delete invitations') THEN
    CREATE POLICY "Ward owners can delete invitations"
      ON public.profile_invitations FOR DELETE TO authenticated
      USING (owner_id = auth.uid());
    RAISE NOTICE 'Created policy "Ward owners can delete invitations"';
  END IF;

  -- ---- 4. Users: signed-in only (collaborator lists, ward-link checks) -----
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users'
                 AND policyname = 'Signed-in users can read users') THEN
    CREATE POLICY "Signed-in users can read users"
      ON public.users FOR SELECT TO authenticated USING (true);
    RAISE NOTICE 'Created policy "Signed-in users can read users" (replaces the anonymous ones)';
  END IF;

  -- ---- 5. Share inserts must come from the ward owner -----------------------
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profile_shares' AND cmd = 'INSERT'
      AND policyname NOT IN ('Profile owners can insert shares', 'Ward owners can insert shares')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profile_shares', r.policyname);
    RAISE NOTICE 'Dropped insert policy "%" on profile_shares', r.policyname;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_shares'
                 AND policyname IN ('Profile owners can insert shares', 'Ward owners can insert shares')) THEN
    CREATE POLICY "Ward owners can insert shares"
      ON public.profile_shares FOR INSERT TO authenticated
      WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.profile_slug = profile_shares.profile_slug)
      );
    RAISE NOTICE 'Created policy "Ward owners can insert shares"';
  END IF;
END $$;
