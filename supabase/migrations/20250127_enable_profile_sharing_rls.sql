-- Enable profile-based sharing for bulletins and tokens
-- This allows multiple users to collaborate on the same bulletins

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read bulletins they created or have shared access to" ON bulletins;
DROP POLICY IF EXISTS "Users can insert bulletins to their profile or shared profiles" ON bulletins;
DROP POLICY IF EXISTS "Users can update bulletins they created or have edit access to" ON bulletins;
DROP POLICY IF EXISTS "Users can delete bulletins they created or have edit access to" ON bulletins;

DROP POLICY IF EXISTS "Users can read tokens they created or for shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can insert tokens for their profile or shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can update tokens they created or for shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can delete tokens they created or for shared profiles" ON tokens;

-- Create helper function to check if user has access to a profile_slug
CREATE OR REPLACE FUNCTION user_has_profile_access(profile_slug_param text, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user owns the profile
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id_param
    AND profile_slug = profile_slug_param
  ) THEN
    RETURN true;
  END IF;

  -- Check if user has shared access
  IF EXISTS (
    SELECT 1 FROM profile_shares
    WHERE profile_slug = profile_slug_param
    AND shared_with_id = user_id_param
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user can edit a profile
CREATE OR REPLACE FUNCTION user_can_edit_profile(profile_slug_param text, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user owns the profile
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id_param
    AND profile_slug = profile_slug_param
  ) THEN
    RETURN true;
  END IF;

  -- Check if user has editor or owner role
  IF EXISTS (
    SELECT 1 FROM profile_shares
    WHERE profile_slug = profile_slug_param
    AND shared_with_id = user_id_param
    AND role IN ('editor', 'owner')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bulletin RLS Policies
-- Read: Users can see bulletins they created OR bulletins from profiles they have access to
CREATE POLICY "Users can read bulletins they created or have shared access to"
  ON bulletins FOR SELECT
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_has_profile_access(profile_slug, auth.uid()))
  );

-- Insert: Users can create bulletins for their profile or shared profiles with edit access
CREATE POLICY "Users can insert bulletins to their profile or shared profiles"
  ON bulletins FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      profile_slug IS NULL
      OR user_can_edit_profile(profile_slug, auth.uid())
    )
  );

-- Update: Users can update bulletins they created OR bulletins from profiles they have edit access to
CREATE POLICY "Users can update bulletins they created or have edit access to"
  ON bulletins FOR UPDATE
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  )
  WITH CHECK (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  );

-- Delete: Users can delete bulletins they created OR bulletins from profiles they have edit access to
CREATE POLICY "Users can delete bulletins they created or have edit access to"
  ON bulletins FOR DELETE
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  );

-- Token RLS Policies
-- Read: Users can see tokens they created OR tokens for bulletins from shared profiles
CREATE POLICY "Users can read tokens they created or for shared profiles"
  ON tokens FOR SELECT
  USING (
    auth.uid() = created_by
    OR (
      -- Check if token is for a bulletin from a shared profile
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_has_profile_access(b.profile_slug, auth.uid())
      )
    )
  );

-- Insert: Users can create tokens for their bulletins or shared profile bulletins
CREATE POLICY "Users can insert tokens for their profile or shared profiles"
  ON tokens FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    OR (
      -- Check if token is for a bulletin from a shared profile with edit access
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_can_edit_profile(b.profile_slug, auth.uid())
      )
    )
  );

-- Update: Users can update tokens they created or for shared profiles with edit access
CREATE POLICY "Users can update tokens they created or for shared profiles"
  ON tokens FOR UPDATE
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_can_edit_profile(b.profile_slug, auth.uid())
      )
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_can_edit_profile(b.profile_slug, auth.uid())
      )
    )
  );

-- Delete: Users can delete tokens they created or for shared profiles with edit access
CREATE POLICY "Users can delete tokens they created or for shared profiles"
  ON tokens FOR DELETE
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_can_edit_profile(b.profile_slug, auth.uid())
      )
    )
  );
