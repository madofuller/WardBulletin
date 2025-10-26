-- Enable RLS on profile_collaborators table (if it exists)
-- This fixes the Supabase Advisor warnings
ALTER TABLE IF EXISTS public.profile_collaborators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own collaborations" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Users can view profiles they collaborate on" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can insert collaborators" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can update collaborators" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can delete collaborators" ON public.profile_collaborators;

-- Only create policies if the table actually exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_collaborators') THEN
    -- Policy: Users can view collaborations where they are the shared user
    EXECUTE 'CREATE POLICY "Users can view their own collaborations"
    ON public.profile_collaborators
    FOR SELECT
    USING (auth.uid() = shared_with_id)';

    -- Policy: Users can view collaborations on profiles they own
    EXECUTE 'CREATE POLICY "Users can view profiles they collaborate on"
    ON public.profile_collaborators
    FOR SELECT
    USING (auth.uid() = owner_id)';

    -- Policy: Profile owners can insert new collaborators
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

    -- Policy: Profile owners can update collaborator roles
    EXECUTE 'CREATE POLICY "Profile owners can update collaborators"
    ON public.profile_collaborators
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id)';

    -- Policy: Profile owners can delete collaborators
    EXECUTE 'CREATE POLICY "Profile owners can delete collaborators"
    ON public.profile_collaborators
    FOR DELETE
    USING (auth.uid() = owner_id)';

    -- Grant necessary permissions
    EXECUTE 'GRANT SELECT ON public.profile_collaborators TO authenticated';
    EXECUTE 'GRANT INSERT, UPDATE, DELETE ON public.profile_collaborators TO authenticated';
  END IF;
END $$;

-- Also ensure RLS is enabled on profile_shares (the table you actually use)
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on profile_shares
DROP POLICY IF EXISTS "Users can view their own shares" ON public.profile_shares;
DROP POLICY IF EXISTS "Users can view shares they own" ON public.profile_shares;
DROP POLICY IF EXISTS "Profile owners can insert shares" ON public.profile_shares;
DROP POLICY IF EXISTS "Profile owners can update shares" ON public.profile_shares;
DROP POLICY IF EXISTS "Profile owners can delete shares" ON public.profile_shares;

-- Create policies for profile_shares
CREATE POLICY "Users can view their own shares"
ON public.profile_shares
FOR SELECT
USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);

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

CREATE POLICY "Profile owners can update shares"
ON public.profile_shares
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Profile owners can delete shares"
ON public.profile_shares
FOR DELETE
USING (auth.uid() = owner_id);

-- Grant permissions on profile_shares
GRANT SELECT ON public.profile_shares TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_shares TO authenticated;
