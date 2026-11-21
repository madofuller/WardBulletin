-- =============================================================================
-- Security hardening, PART 1 of 2 (additive: safe to run any time)
--
-- Adds server-side functions the app now prefers over direct table access,
-- plus spam limits on public announcement submissions and a per-user cloud
-- copy of saved templates / baptism programs. Nothing here removes access,
-- so the currently deployed site keeps working before and after.
--
-- Run PART 2 (20261121_part2_lock_down_policies.sql) only after the new
-- frontend that calls these functions is live.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Public bulletin read (replaces anonymous reads of users/bulletins/tokens)
--
-- Returns only what the public bulletin page renders, for one ward link:
-- the active bulletin, or else the newest *published* (active/archived)
-- bulletin. Drafts and scheduled bulletins are never returned.
--
-- p_local_now is the viewer's local wall-clock time. Scheduled bulletins are
-- stored in the ward's local time, so a scheduled bulletin that is due is
-- activated here, on first view, instead of waiting for an editor to log in.
-- It is clamped to a valid time-zone offset from server time.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_bulletin(
  p_profile_slug TEXT,
  p_local_now TIMESTAMP DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner RECORD;
  v_bulletin RECORD;
  v_bulletin_id TEXT;
  v_now TIMESTAMP;
  v_utc TIMESTAMP := (now() AT TIME ZONE 'UTC');
  v_due RECORD;
  v_tokens jsonb;
BEGIN
  IF p_profile_slug IS NULL OR length(p_profile_slug) = 0 OR length(p_profile_slug) > 100 THEN
    RETURN NULL;
  END IF;

  SELECT id, active_bulletin_id, unit_type, language
  INTO v_owner
  FROM public.users
  WHERE profile_slug = p_profile_slug;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Activate a due scheduled bulletin (same rules as the editor's login check:
  -- a manually activated bulletin is respected and cancels the schedule).
  v_now := COALESCE(p_local_now, v_utc);
  IF v_now > v_utc + INTERVAL '14 hours' THEN v_now := v_utc + INTERVAL '14 hours'; END IF;
  IF v_now < v_utc - INTERVAL '12 hours' THEN v_now := v_utc - INTERVAL '12 hours'; END IF;

  SELECT id, created_by
  INTO v_due
  FROM public.bulletins
  WHERE status = 'scheduled'
    AND auto_activate = true
    AND scheduled_date <= v_now
    AND (profile_slug = p_profile_slug OR (profile_slug IS NULL AND created_by = v_owner.id))
  ORDER BY scheduled_date DESC
  LIMIT 1;

  IF FOUND THEN
    IF EXISTS (
      SELECT 1 FROM public.bulletins
      WHERE status = 'active' AND auto_activate = false AND id <> v_due.id
        AND (profile_slug = p_profile_slug OR (profile_slug IS NULL AND created_by = v_owner.id))
    ) THEN
      UPDATE public.bulletins SET auto_activate = false WHERE id = v_due.id;
    ELSE
      UPDATE public.bulletins SET status = 'archived'
      WHERE status = 'active' AND id <> v_due.id
        AND (profile_slug = p_profile_slug OR (profile_slug IS NULL AND created_by = v_owner.id));
      UPDATE public.bulletins SET status = 'active', auto_activate = false WHERE id = v_due.id;
      UPDATE public.users SET active_bulletin_id = v_due.id WHERE id = v_owner.id;
    END IF;
  END IF;

  -- The active bulletin, if it still exists (re-read: activation above may have changed it)
  SELECT active_bulletin_id::TEXT INTO v_bulletin_id FROM public.users WHERE id = v_owner.id;
  IF v_bulletin_id IS NOT NULL THEN
    SELECT id, slug, created_by, profile_slug, meeting_date, meeting_type, status, created_at
    INTO v_bulletin
    FROM public.bulletins WHERE id::TEXT = v_bulletin_id;
    IF NOT FOUND THEN v_bulletin_id := NULL; END IF;
  END IF;

  -- Otherwise the newest published bulletin (never a draft)
  IF v_bulletin_id IS NULL THEN
    SELECT id, slug, created_by, profile_slug, meeting_date, meeting_type, status, created_at
    INTO v_bulletin
    FROM public.bulletins
    WHERE (created_by = v_owner.id OR profile_slug = p_profile_slug)
      AND status IN ('active', 'archived')
    ORDER BY created_at DESC
    LIMIT 1;
    IF NOT FOUND THEN
      RETURN NULL;
    END IF;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('key', t.key, 'value', t.value, 'created_by', t.created_by)
                            ORDER BY t.created_at DESC), '[]'::jsonb)
  INTO v_tokens
  FROM public.tokens t
  WHERE t.key IN (
    SELECT 'bulletin-' || v_bulletin.slug || '-' || suffix
    FROM unnest(ARRAY['ward_name','theme','userTheme','bishopric','announcements','meetings','events',
                      'agenda','prayers','music','leadership','wardLeadership','missionaries',
                      'wardMissionaries','serviceMissionaries','image','imageUrl','imagePosition',
                      'imageOpacity']) AS suffix
  );

  RETURN jsonb_build_object(
    'owner', jsonb_build_object('id', v_owner.id, 'unit_type', v_owner.unit_type, 'language', v_owner.language),
    'bulletin', jsonb_build_object(
      'id', v_bulletin.id, 'slug', v_bulletin.slug, 'created_by', v_bulletin.created_by,
      'profile_slug', v_bulletin.profile_slug, 'meeting_date', v_bulletin.meeting_date,
      'meeting_type', v_bulletin.meeting_type, 'created_at', v_bulletin.created_at),
    'tokens', v_tokens
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_bulletin(TEXT, TIMESTAMP) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_bulletin(TEXT, TIMESTAMP) TO anon, authenticated;


-- -----------------------------------------------------------------------------
-- 2. Invitations: look up by token, accept on the server
-- -----------------------------------------------------------------------------

-- What the invite page shows. Replaces the anonymous read of profile_invitations
-- and the anonymous "does this email have an account" lookup on users.
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token TEXT)
RETURNS TABLE (
  profile_slug TEXT,
  invited_email TEXT,
  role TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  email_registered BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT i.profile_slug::TEXT, i.invited_email::TEXT, i.role::TEXT, i.expires_at, i.created_at,
         EXISTS (SELECT 1 FROM public.users u WHERE lower(u.email) = lower(i.invited_email))
  FROM public.profile_invitations i
  WHERE i.token::TEXT = p_token
    AND i.accepted_at IS NULL
    AND i.expires_at > now();
$$;

REVOKE ALL ON FUNCTION public.get_invitation_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO anon, authenticated;

-- Accepting an invitation. The checks the browser used to do (pending, not
-- expired, email matches) now happen here, plus one the browser never did:
-- the inviter must actually own the ward link. This is what stops someone from
-- inviting themselves to a ward they don't own.
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_inv RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_inv
  FROM public.profile_invitations
  WHERE token::TEXT = p_token AND accepted_at IS NULL AND expires_at > now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_invitation';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL OR lower(trim(v_email)) <> lower(trim(v_inv.invited_email)) THEN
    RAISE EXCEPTION 'email_mismatch';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = v_inv.owner_id AND profile_slug = v_inv.profile_slug
  ) THEN
    RAISE EXCEPTION 'inviter_does_not_own_profile';
  END IF;

  INSERT INTO public.profile_shares (profile_slug, owner_id, shared_with_id, role)
  VALUES (v_inv.profile_slug, v_inv.owner_id, v_uid, v_inv.role)
  ON CONFLICT (profile_slug, shared_with_id) DO UPDATE SET role = EXCLUDED.role, owner_id = EXCLUDED.owner_id;

  UPDATE public.profile_invitations SET accepted_at = now() WHERE id = v_inv.id;

  RETURN jsonb_build_object('role', v_inv.role, 'profile_slug', v_inv.profile_slug);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT) TO authenticated;


-- -----------------------------------------------------------------------------
-- 3. Announcement submissions: size limits and rate limits
--
-- The public submission form inserts directly. NOT VALID keeps any existing
-- oversized rows; the limits apply to new rows.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcement_submissions_size_limits') THEN
    ALTER TABLE public.announcement_submissions
      ADD CONSTRAINT announcement_submissions_size_limits CHECK (
        length(profile_slug) <= 100
        AND length(submitter_name) <= 100
        AND (submitter_email IS NULL OR length(submitter_email) <= 255)
        AND length(title) <= 200
        AND length(content) <= 5000
      ) NOT VALID;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.limit_announcement_submissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- The ward link must exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE profile_slug = NEW.profile_slug) THEN
    RAISE EXCEPTION 'unknown_profile' USING ERRCODE = 'P0001';
  END IF;

  -- At most 30 submissions per ward per hour, and 200 waiting for review
  IF (SELECT count(*) FROM public.announcement_submissions
      WHERE profile_slug = NEW.profile_slug AND created_at > now() - INTERVAL '1 hour') >= 30 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(*) FROM public.announcement_submissions
      WHERE profile_slug = NEW.profile_slug AND status = 'pending') >= 200 THEN
    RAISE EXCEPTION 'too_many_pending' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS limit_announcement_submissions ON public.announcement_submissions;
CREATE TRIGGER limit_announcement_submissions
  BEFORE INSERT ON public.announcement_submissions
  FOR EACH ROW EXECUTE FUNCTION public.limit_announcement_submissions();


-- -----------------------------------------------------------------------------
-- 4. Per-user cloud copy of saved templates and baptism programs
--    (previously only in one browser's localStorage)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_documents (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('template', 'baptism_program')),
  doc_key TEXT NOT NULL CHECK (length(doc_key) <= 200),
  data jsonb NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, doc_key)
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own documents" ON public.user_documents;
CREATE POLICY "Users manage their own documents"
  ON public.user_documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_documents TO authenticated;


-- -----------------------------------------------------------------------------
-- 5. bulletins.updated_at, so the editor can detect that someone else saved a
--    bulletin since it was opened (instead of silently overwriting their work)
-- -----------------------------------------------------------------------------
ALTER TABLE public.bulletins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.touch_bulletin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_bulletin_updated_at ON public.bulletins;
CREATE TRIGGER touch_bulletin_updated_at
  BEFORE UPDATE ON public.bulletins
  FOR EACH ROW EXECUTE FUNCTION public.touch_bulletin_updated_at();
