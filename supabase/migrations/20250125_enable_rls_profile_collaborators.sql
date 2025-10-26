-- Enable RLS on profile_collaborators table
ALTER TABLE public.profile_collaborators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to recreate them properly)
DROP POLICY IF EXISTS "Users can view their own collaborations" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Users can view profiles they collaborate on" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can manage collaborators" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can insert collaborators" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can update collaborators" ON public.profile_collaborators;
DROP POLICY IF EXISTS "Profile owners can delete collaborators" ON public.profile_collaborators;

-- Policy: Users can view collaborations where they are the shared user
CREATE POLICY "Users can view their own collaborations"
ON public.profile_collaborators
FOR SELECT
USING (auth.uid() = shared_with_id);

-- Policy: Users can view collaborations on profiles they own
CREATE POLICY "Users can view profiles they collaborate on"
ON public.profile_collaborators
FOR SELECT
USING (auth.uid() = owner_id);

-- Policy: Profile owners can insert new collaborators
CREATE POLICY "Profile owners can insert collaborators"
ON public.profile_collaborators
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.profile_slug = profile_collaborators.profile_slug
  )
);

-- Policy: Profile owners can update collaborator roles
CREATE POLICY "Profile owners can update collaborators"
ON public.profile_collaborators
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Profile owners can delete collaborators
CREATE POLICY "Profile owners can delete collaborators"
ON public.profile_collaborators
FOR DELETE
USING (auth.uid() = owner_id);

-- Grant necessary permissions
GRANT SELECT ON public.profile_collaborators TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_collaborators TO authenticated;
