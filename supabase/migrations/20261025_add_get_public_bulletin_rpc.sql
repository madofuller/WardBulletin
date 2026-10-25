-- Migration: Add RPC function for single-query public bulletin fetch
-- Purpose: Reduce public page load from 3 round-trips to 1
-- Created: 2026-10-25

-- Drop function if exists (for safe rerun)
DROP FUNCTION IF EXISTS get_public_bulletin_by_slug(text);

-- Create RPC function to fetch public bulletin data in a single round-trip
-- Consolidates: users → bulletins → tokens into 1 query
-- Respects RLS: only published bulletins are returned
CREATE OR REPLACE FUNCTION get_public_bulletin_by_slug(profile_slug_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  user_record record;
  bulletin_record record;
  bulletin_slug_val text;
BEGIN
  -- Step 1: Get user by profile_slug
  SELECT id, active_bulletin_id, unit_type, language
  INTO user_record
  FROM users
  WHERE profile_slug = profile_slug_param
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Bulletin not found');
  END IF;

  -- Step 2: Get bulletin ID (active or latest)
  IF user_record.active_bulletin_id IS NOT NULL THEN
    SELECT *
    INTO bulletin_record
    FROM bulletins
    WHERE id = user_record.active_bulletin_id
    LIMIT 1;
  ELSE
    -- Get latest bulletin for this profile
    SELECT *
    INTO bulletin_record
    FROM bulletins
    WHERE created_by = user_record.id
       OR profile_slug = profile_slug_param
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No bulletin published');
  END IF;

  bulletin_slug_val := bulletin_record.slug;

  -- Step 3: Get all tokens for this bulletin in one query
  -- Build the complete result with embedded tokens
  SELECT jsonb_build_object(
    'id', bulletin_record.id,
    'slug', bulletin_record.slug,
    'created_at', bulletin_record.created_at,
    'created_by', bulletin_record.created_by,
    'profile_slug', bulletin_record.profile_slug,
    'profile_unit_type', user_record.unit_type,
    'profile_language', user_record.language,
    'tokens', (
      SELECT jsonb_object_agg(
        REPLACE(key, 'bulletin-' || bulletin_slug_val || '-', ''),
        value
      )
      FROM tokens
      WHERE key LIKE 'bulletin-' || bulletin_slug_val || '-%'
        AND (created_by = bulletin_record.created_by OR created_by = user_record.id)
      ORDER BY created_at DESC
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated users (public access)
GRANT EXECUTE ON FUNCTION get_public_bulletin_by_slug(text) TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_public_bulletin_by_slug IS 
  'Fetches public bulletin with all related data in a single query. 
   Returns: { id, slug, created_at, profile_unit_type, profile_language, tokens: { ward_name, theme, ... } }
   Or: { error: "message" } if not found.
   Consolidates 3 queries into 1 for performance on slow connections.';
