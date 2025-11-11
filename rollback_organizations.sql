-- ============================================
-- ROLLBACK: Revert from organization_id back to profile_slug
-- Use this if something goes wrong with the migration
-- ============================================

-- Step 1: Restore old RLS policies for bulletins
DROP POLICY IF EXISTS "Users can read bulletins they have access to" ON bulletins;
DROP POLICY IF EXISTS "Users can insert bulletins to their organization" ON bulletins;
DROP POLICY IF EXISTS "Users can update bulletins they have edit access to" ON bulletins;
DROP POLICY IF EXISTS "Users can delete bulletins they have edit access to" ON bulletins;

CREATE POLICY "Users can read bulletins they created or have shared access to"
  ON bulletins FOR SELECT
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_has_profile_access(profile_slug, auth.uid()))
  );

CREATE POLICY "Users can insert bulletins to their profile or shared profiles"
  ON bulletins FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      profile_slug IS NULL
      OR user_can_edit_profile(profile_slug, auth.uid())
    )
  );

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

CREATE POLICY "Users can delete bulletins they created or have edit access to"
  ON bulletins FOR DELETE
  USING (
    auth.uid() = created_by
    OR (profile_slug IS NOT NULL AND user_can_edit_profile(profile_slug, auth.uid()))
  );

-- Step 2: Restore old RLS policies for tokens
DROP POLICY IF EXISTS "Users can read tokens they have access to" ON tokens;
DROP POLICY IF EXISTS "Users can insert tokens for their organization" ON tokens;
DROP POLICY IF EXISTS "Users can update tokens they have access to" ON tokens;
DROP POLICY IF EXISTS "Users can delete tokens they have access to" ON tokens;

CREATE POLICY "Users can read tokens they created or for shared profiles"
  ON tokens FOR SELECT
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.profile_slug IS NOT NULL
        AND user_has_profile_access(b.profile_slug, auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert tokens for their profile or shared profiles"
  ON tokens FOR INSERT
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

-- Step 3: Restore profile_slug on bulletins from organization
UPDATE bulletins b
SET profile_slug = o.profile_slug
FROM organizations o
WHERE b.organization_id = o.id
  AND o.profile_slug IS NOT NULL;

-- Step 4: Clear organization_id from bulletins (but keep the column for safety)
UPDATE bulletins
SET organization_id = NULL;

-- Step 5: Clear organization_id from profile_invitations
UPDATE profile_invitations
SET organization_id = NULL;

-- Step 6: Drop RLS policies on new tables
DROP POLICY IF EXISTS "Users can read organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create their own organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can accept organization invitations" ON organization_members;

-- Step 7: Drop helper functions for organization-based system
DROP FUNCTION IF EXISTS user_has_organization_access(UUID, UUID);
DROP FUNCTION IF EXISTS user_can_edit_organization(UUID, UUID);

-- Step 8: Drop new tables (be careful - this deletes data!)
-- Comment these out if you want to keep the data for future migration attempts
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Step 9: Remove columns from bulletins and profile_invitations
-- Comment these out if you want to keep the columns for safety
ALTER TABLE bulletins DROP COLUMN IF EXISTS organization_id;
ALTER TABLE profile_invitations DROP COLUMN IF EXISTS organization_id;

-- Step 10: Verify rollback
DO $$
DECLARE
  bulletin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bulletin_count FROM bulletins WHERE profile_slug IS NOT NULL;

  RAISE NOTICE 'Rollback complete:';
  RAISE NOTICE '  - Bulletins with profile_slug: %', bulletin_count;
  RAISE NOTICE 'System reverted to profile_slug-based sharing';
END $$;
