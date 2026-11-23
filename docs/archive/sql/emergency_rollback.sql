-- EMERGENCY ROLLBACK SCRIPT
-- Only use this if something breaks after running the migration
-- This restores basic functionality

-- ============================================
-- Drop all new policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage their own bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can create bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can update accessible bulletins" ON bulletins;
DROP POLICY IF EXISTS "Users can delete accessible bulletins" ON bulletins;

DROP POLICY IF EXISTS "Users can read their own tokens" ON tokens;
DROP POLICY IF EXISTS "Users can create their own tokens" ON tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON tokens;

-- ============================================
-- Restore basic working policies
-- ============================================

-- Bulletins: Basic policies for authenticated users
CREATE POLICY "Users can manage their own bulletins"
  ON bulletins FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Keep public reading (CRITICAL - don't remove this!)
-- NOTE: "Public bulletins are readable by anyone" should still exist

-- Tokens: Basic policies for authenticated users
CREATE POLICY "Users can read their own tokens"
  ON tokens FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own tokens"
  ON tokens FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tokens"
  ON tokens FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tokens"
  ON tokens FOR DELETE
  USING (auth.uid() = created_by);

-- Keep anon token reading (CRITICAL - don't remove this!)
-- NOTE: "Allow anon read for public bulletin tokens" should still exist

-- ============================================
-- Drop helper functions (optional - won't hurt if left)
-- ============================================
DROP FUNCTION IF EXISTS user_has_profile_access(text, uuid);
DROP FUNCTION IF EXISTS user_can_edit_profile(text, uuid);

-- ============================================
-- DONE!
-- ============================================
-- Your site should now work as before the migration
-- You've lost collaborative editing, but core functionality is restored
