-- SAFE Profile Sharing Migration
-- This preserves existing functionality while adding collaborative editing
-- Run this during low-traffic hours if possible

-- ============================================
-- STEP 1: Clean up duplicate/conflicting policies
-- ============================================

-- Drop duplicate bulletin policies (keeping the most permissive ones)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON bulletins;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON bulletins;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON bulletins;
DROP POLICY IF EXISTS "Users can insert their own bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can select their own bulletins" ON bulletins;

-- Drop old collaborative policies (we'll replace with better ones)
DROP POLICY IF EXISTS "Users can create bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can delete accessible bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can update accessible bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can view accessible bulletins" ON bulletins;

-- Drop duplicate token policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON tokens;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON tokens;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON tokens;

-- ============================================
-- STEP 2: Create helper functions
-- ============================================

-- Check if user has access to a profile (owner or shared)
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

-- Check if user can edit a profile (owner or editor)
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

-- ============================================
-- STEP 3: Create new consolidated bulletin policies
-- ============================================

-- CRITICAL: Keep public bulletin viewing (for public bulletin page)
-- This policy stays exactly as is - don't touch it!
-- "Public bulletins are readable by anyone" - ALREADY EXISTS, LEAVE IT

-- SELECT: Users can read their own bulletins OR bulletins from shared profiles
CREATE POLICY "Users can manage their own bulletins"
  ON bulletins FOR SELECT
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_has_profile_access(profile_slug, auth.uid()))
  );

-- INSERT: Users can create bulletins for themselves or shared profiles with edit access
CREATE POLICY "Users can create bulletins"
  ON bulletins FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      profile_slug IS NULL
      OR user_can_edit_profile(profile_slug, auth.uid())
    )
  );

-- UPDATE: Users can update their own bulletins OR bulletins from shared profiles with edit access
CREATE POLICY "Users can update accessible bulletins"
  ON bulletins FOR UPDATE
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  )
  WITH CHECK (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  );

-- DELETE: Users can delete their own bulletins OR bulletins from shared profiles with edit access
CREATE POLICY "Users can delete accessible bulletins"
  ON bulletins FOR DELETE
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  );

-- ============================================
-- STEP 4: Create new consolidated token policies
-- ============================================

-- CRITICAL: Keep anon read for public bulletin tokens
-- This policy stays exactly as is - don't touch it!
-- "Allow anon read for public bulletin tokens" - ALREADY EXISTS, LEAVE IT

-- SELECT: Users can read their own tokens OR tokens for shared profiles
CREATE POLICY "Users can read their own tokens"
  ON tokens FOR SELECT
  USING (
    auth.uid() = created_by
    OR (
      -- Allow reading tokens for bulletins from shared profiles
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_has_profile_access(b.profile_slug, auth.uid())
      )
    )
  );

-- INSERT: Users can create their own tokens OR tokens for shared profiles with edit access
CREATE POLICY "Users can create their own tokens"
  ON tokens FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    OR (
      -- Allow creating tokens for bulletins from shared profiles with edit access
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_can_edit_profile(b.profile_slug, auth.uid())
      )
    )
  );

-- UPDATE: Users can update their own tokens OR tokens for shared profiles with edit access
CREATE POLICY "Users can update their own tokens"
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

-- DELETE: Users can delete their own tokens OR tokens for shared profiles with edit access
CREATE POLICY "Users can delete their own tokens"
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

-- ============================================
-- DONE!
-- ============================================
-- This migration:
-- ✅ Preserves public bulletin viewing (critical!)
-- ✅ Preserves anon token reading (for public page)
-- ✅ Adds collaborative editing via profile sharing
-- ✅ Cleans up duplicate policies
-- ✅ Is backward compatible with existing code
