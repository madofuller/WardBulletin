-- Migration: Formal profile ownership transfer
-- Lets the current owner of a profile (ward link) hand it to another account,
-- instead of the old workaround of changing the account email and sharing the
-- password. Moves the profile_slug, active bulletin, collaborator shares, and
-- pending invitations to the new owner in a single transaction.
--
-- Runs as SECURITY DEFINER because RLS (correctly) prevents one user from
-- updating another user's row in public.users.

CREATE OR REPLACE FUNCTION public.transfer_profile_ownership(new_owner_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_slug TEXT;
    v_active_bulletin TEXT;
    v_new_owner_id UUID;
    v_new_owner_slug TEXT;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    SELECT profile_slug, active_bulletin_id
    INTO v_slug, v_active_bulletin
    FROM public.users
    WHERE id = v_caller_id;

    IF v_slug IS NULL THEN
        RAISE EXCEPTION 'no_profile_to_transfer';
    END IF;

    SELECT id, profile_slug
    INTO v_new_owner_id, v_new_owner_slug
    FROM public.users
    WHERE lower(email) = lower(trim(new_owner_email))
    LIMIT 1;

    IF v_new_owner_id IS NULL THEN
        RAISE EXCEPTION 'recipient_not_found';
    END IF;

    IF v_new_owner_id = v_caller_id THEN
        RAISE EXCEPTION 'cannot_transfer_to_self';
    END IF;

    -- profile_slug is UNIQUE and a user can only own one profile
    IF v_new_owner_slug IS NOT NULL THEN
        RAISE EXCEPTION 'recipient_already_has_profile';
    END IF;

    -- Move the ward identity (slug + active bulletin pointer) to the new owner.
    -- Old owner is cleared first so the UNIQUE(profile_slug) constraint holds.
    UPDATE public.users
    SET profile_slug = NULL, active_bulletin_id = NULL
    WHERE id = v_caller_id;

    UPDATE public.users
    SET profile_slug = v_slug, active_bulletin_id = v_active_bulletin
    WHERE id = v_new_owner_id;

    -- The new owner no longer needs a collaborator share on their own profile
    DELETE FROM public.profile_shares
    WHERE profile_slug = v_slug AND shared_with_id = v_new_owner_id;

    -- Existing collaborators and pending invitations now belong to the new owner
    UPDATE public.profile_shares
    SET owner_id = v_new_owner_id, updated_at = NOW()
    WHERE profile_slug = v_slug;

    DELETE FROM public.profile_invitations
    WHERE profile_slug = v_slug
    AND lower(invited_email) = lower(trim(new_owner_email));

    UPDATE public.profile_invitations
    SET owner_id = v_new_owner_id
    WHERE profile_slug = v_slug;

    -- Keep the previous owner on as an editor so the handoff isn't abrupt;
    -- the new owner can remove this share at any time.
    INSERT INTO public.profile_shares (profile_slug, owner_id, shared_with_id, role)
    VALUES (v_slug, v_new_owner_id, v_caller_id, 'editor')
    ON CONFLICT (profile_slug, shared_with_id)
    DO UPDATE SET owner_id = EXCLUDED.owner_id, role = 'editor', updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'profile_slug', v_slug,
        'new_owner_id', v_new_owner_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_profile_ownership(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transfer_profile_ownership(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.transfer_profile_ownership(TEXT) TO authenticated;

COMMENT ON FUNCTION public.transfer_profile_ownership(TEXT) IS
'Transfers the caller''s profile (ward link, active bulletin, shares, invitations) to the account with the given email. The recipient must already have an account and must not own a profile. The previous owner is kept as an editor.';
