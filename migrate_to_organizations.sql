-- ============================================
-- MIGRATION: Move from profile_slug to organization_id
-- This is backward-compatible and safe for production
-- ============================================

-- Step 1: Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_slug TEXT UNIQUE,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create organization_members table (replaces profile_shares)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Step 3: Add organization_id columns (don't drop profile_slug yet for safety)
ALTER TABLE bulletins
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

ALTER TABLE profile_invitations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Step 4: Create organizations from existing users with profile_slug
-- Use user's ID as their organization ID for simplicity
INSERT INTO organizations (id, name, profile_slug, created_by)
SELECT
  id as id,
  COALESCE(profile_slug, email) as name,
  profile_slug,
  id as created_by
FROM users
WHERE profile_slug IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Migrate bulletins to organization_id
-- Option A: Bulletins with profile_slug -> find org with that slug
UPDATE bulletins b
SET organization_id = o.id
FROM organizations o
WHERE b.profile_slug = o.profile_slug
  AND b.profile_slug IS NOT NULL
  AND b.organization_id IS NULL;

-- Option B: Bulletins without profile_slug -> create personal org for creator
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT created_by
    FROM bulletins
    WHERE profile_slug IS NULL
      AND organization_id IS NULL
  LOOP
    -- Create personal org if doesn't exist
    INSERT INTO organizations (id, name, profile_slug, created_by)
    SELECT
      user_record.created_by,
      u.email,
      NULL,  -- No slug for personal orgs
      user_record.created_by
    FROM users u
    WHERE u.id = user_record.created_by
    ON CONFLICT (id) DO NOTHING;

    -- Assign bulletins to personal org
    UPDATE bulletins
    SET organization_id = user_record.created_by
    WHERE created_by = user_record.created_by
      AND organization_id IS NULL;
  END LOOP;
END $$;

-- Step 6: Migrate profile_shares to organization_members
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  o.id as organization_id,
  ps.shared_with_id as user_id,
  ps.role
FROM profile_shares ps
JOIN organizations o ON ps.profile_slug = o.profile_slug
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Step 7: Add organization owners as members
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  id as organization_id,
  created_by as user_id,
  'owner' as role
FROM organizations
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Step 8: Migrate profile_invitations
UPDATE profile_invitations pi
SET organization_id = o.id
FROM organizations o
WHERE pi.profile_slug = o.profile_slug
  AND pi.organization_id IS NULL;

-- Step 9: Create helper functions for new organization-based system
CREATE OR REPLACE FUNCTION user_has_organization_access(org_id UUID, user_id_param UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_can_edit_organization(org_id UUID, user_id_param UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = user_id_param
    AND role IN ('owner', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Update RLS policies for bulletins to use organization_id
DROP POLICY IF EXISTS "Users can read bulletins they created or have shared access to" ON bulletins;
DROP POLICY IF EXISTS "Users can insert bulletins to their profile or shared profiles" ON bulletins;
DROP POLICY IF EXISTS "Users can update bulletins they created or have edit access to" ON bulletins;
DROP POLICY IF EXISTS "Users can delete bulletins they created or have edit access to" ON bulletins;

CREATE POLICY "Users can read bulletins they have access to"
  ON bulletins FOR SELECT
  USING (
    auth.uid() = created_by
    OR (organization_id IS NOT NULL AND user_has_organization_access(organization_id, auth.uid()))
  );

CREATE POLICY "Users can insert bulletins to their organization"
  ON bulletins FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      organization_id IS NULL
      OR user_can_edit_organization(organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can update bulletins they have edit access to"
  ON bulletins FOR UPDATE
  USING (
    auth.uid() = created_by
    OR (organization_id IS NOT NULL AND user_can_edit_organization(organization_id, auth.uid()))
  )
  WITH CHECK (
    auth.uid() = created_by
    OR (organization_id IS NOT NULL AND user_can_edit_organization(organization_id, auth.uid()))
  );

CREATE POLICY "Users can delete bulletins they have edit access to"
  ON bulletins FOR DELETE
  USING (
    auth.uid() = created_by
    OR (organization_id IS NOT NULL AND user_can_edit_organization(organization_id, auth.uid()))
  );

-- Step 11: Update RLS policies for tokens to use organization_id
DROP POLICY IF EXISTS "Users can read tokens they created or for shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can insert tokens for their profile or shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can update tokens they created or for shared profiles" ON tokens;
DROP POLICY IF EXISTS "Users can delete tokens they created or for shared profiles" ON tokens;

CREATE POLICY "Users can read tokens they have access to"
  ON tokens FOR SELECT
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.organization_id IS NOT NULL
        AND user_has_organization_access(b.organization_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert tokens for their organization"
  ON tokens FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.organization_id IS NOT NULL
        AND user_can_edit_organization(b.organization_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can update tokens they have access to"
  ON tokens FOR UPDATE
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.organization_id IS NOT NULL
        AND user_can_edit_organization(b.organization_id, auth.uid())
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
        AND b.organization_id IS NOT NULL
        AND user_can_edit_organization(b.organization_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete tokens they have access to"
  ON tokens FOR DELETE
  USING (
    auth.uid() = created_by
    OR (
      key LIKE 'bulletin-%'
      AND EXISTS (
        SELECT 1 FROM bulletins b
        WHERE b.slug = substring(key from 'bulletin-(.+)-.+')
        AND b.organization_id IS NOT NULL
        AND user_can_edit_organization(b.organization_id, auth.uid())
      )
    )
  );

-- Step 12: Add RLS policies for organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read organizations they belong to"
  ON organizations FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own organizations"
  ON organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Organization owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Step 13: Add RLS policies for organization_members table
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
    )
  );

CREATE POLICY "Users can accept organization invitations"
  ON organization_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profile_invitations pi
      WHERE pi.organization_id = organization_members.organization_id
      AND pi.invited_email = (SELECT email FROM users WHERE id = auth.uid())
      AND pi.accepted_at IS NULL
      AND pi.expires_at > now()
    )
  );

-- Step 14: Verify migration
DO $$
DECLARE
  bulletin_count INTEGER;
  org_count INTEGER;
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bulletin_count FROM bulletins WHERE organization_id IS NOT NULL;
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO member_count FROM organization_members;

  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - Organizations created: %', org_count;
  RAISE NOTICE '  - Bulletins migrated: %', bulletin_count;
  RAISE NOTICE '  - Members migrated: %', member_count;
END $$;
