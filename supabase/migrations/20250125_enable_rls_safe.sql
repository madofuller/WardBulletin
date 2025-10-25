-- Safe migration to enable RLS on profile tables
-- This version avoids DROP statements to prevent warnings

-- Enable RLS on profile_collaborators table (if it exists)
ALTER TABLE IF EXISTS public.profile_collaborators ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profile_shares (the table actually used by the app)
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_collaborators (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_collaborators') THEN

    -- Policy: Users can view collaborations where they are involved
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_collaborators' AND policyname = 'Users can view their own collaborations') THEN
      EXECUTE 'CREATE POLICY "Users can view their own collaborations"
      ON public.profile_collaborators
      FOR SELECT
      USING (auth.uid() = shared_with_id OR auth.uid() = owner_id)';
    END IF;

    -- Policy: Profile owners can insert new collaborators
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_collaborators' AND policyname = 'Profile owners can insert collaborators') THEN
      EXECUTE 'CREATE POLICY "Profile owners can insert collaborators"
      ON public.profile_collaborators
      FOR INSERT
      WITH CHECK (
        auth.uid() = owner_id
        AND EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
          AND users.profile_slug = profile_collaborators.profile_slug
        )
      )';
    END IF;

    -- Policy: Profile owners can update collaborator roles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_collaborators' AND policyname = 'Profile owners can update collaborators') THEN
      EXECUTE 'CREATE POLICY "Profile owners can update collaborators"
      ON public.profile_collaborators
      FOR UPDATE
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id)';
    END IF;

    -- Policy: Profile owners can delete collaborators
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_collaborators' AND policyname = 'Profile owners can delete collaborators') THEN
      EXECUTE 'CREATE POLICY "Profile owners can delete collaborators"
      ON public.profile_collaborators
      FOR DELETE
      USING (auth.uid() = owner_id)';
    END IF;

    -- Grant necessary permissions
    EXECUTE 'GRANT SELECT ON public.profile_collaborators TO authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.profile_collaborators TO authenticated';
  END IF;
END $$;

-- Create policies for profile_shares (the table actually used)
DO $$
BEGIN
  -- Policy: Users can view shares they're involved in
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_shares' AND policyname = 'Users can view their own shares') THEN
    CREATE POLICY "Users can view their own shares"
    ON public.profile_shares
    FOR SELECT
    USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);
  END IF;

  -- Policy: Profile owners can insert shares
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_shares' AND policyname = 'Profile owners can insert shares') THEN
    CREATE POLICY "Profile owners can insert shares"
    ON public.profile_shares
    FOR INSERT
    WITH CHECK (
      auth.uid() = owner_id
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.profile_slug = profile_shares.profile_slug
      )
    );
  END IF;

  -- Policy: Profile owners can update shares
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_shares' AND policyname = 'Profile owners can update shares') THEN
    CREATE POLICY "Profile owners can update shares"
    ON public.profile_shares
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);
  END IF;

  -- Policy: Profile owners can delete shares
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_shares' AND policyname = 'Profile owners can delete shares') THEN
    CREATE POLICY "Profile owners can delete shares"
    ON public.profile_shares
    FOR DELETE
    USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Grant permissions on profile_shares
GRANT SELECT ON public.profile_shares TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_shares TO authenticated;
