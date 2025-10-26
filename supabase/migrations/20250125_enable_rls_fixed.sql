-- Safe migration to enable RLS on profile tables
-- Fixed to match actual table schema

-- Enable RLS on profile_shares (the table actually used by the app)
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_shares
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

-- Enable RLS on profile_collaborators if it exists (separate from profile_shares)
-- This table appears to have a different schema, so we'll just enable RLS
-- and create basic policies without making assumptions about column names
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_collaborators') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.profile_collaborators ENABLE ROW LEVEL SECURITY';

    -- Create a permissive policy for authenticated users to view
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_collaborators' AND policyname = 'Authenticated users can view collaborators') THEN
      EXECUTE 'CREATE POLICY "Authenticated users can view collaborators"
      ON public.profile_collaborators
      FOR SELECT
      TO authenticated
      USING (true)';
    END IF;

    -- Grant basic permissions
    EXECUTE 'GRANT SELECT ON public.profile_collaborators TO authenticated';
  END IF;
END $$;
