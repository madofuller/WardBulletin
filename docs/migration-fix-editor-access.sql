-- Migration: Fix editor access to shared profile bulletins
-- This migration updates RLS policies to allow editors to access bulletins from shared profiles

-- First, we need to add profile_slug column to bulletins table if it doesn't exist
ALTER TABLE public.bulletins ADD COLUMN IF NOT EXISTS profile_slug TEXT;

-- Create index for profile_slug if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bulletins_profile_slug ON public.bulletins(profile_slug);

-- Drop existing bulletins policies that only allow access to own bulletins
DROP POLICY IF EXISTS "Users can view their own bulletins" ON public.bulletins;
DROP POLICY IF EXISTS "Users can update their own bulletins" ON public.bulletins;
DROP POLICY IF EXISTS "Users can delete their own bulletins" ON public.bulletins;

-- Create new policies that allow access to bulletins for shared profiles

-- Allow users to view bulletins they created OR bulletins for profiles they have access to
CREATE POLICY "Users can view accessible bulletins" ON public.bulletins
    FOR SELECT USING (
        auth.uid() = created_by
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profile_shares
                WHERE profile_shares.profile_slug = bulletins.profile_slug
                AND profile_shares.shared_with_id = auth.uid()
            )
        )
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.users
                WHERE users.profile_slug = bulletins.profile_slug
                AND users.id = auth.uid()
            )
        )
    );

-- Allow users to update bulletins they created OR bulletins for profiles they have editor access to
CREATE POLICY "Users can update accessible bulletins" ON public.bulletins
    FOR UPDATE USING (
        auth.uid() = created_by
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profile_shares
                WHERE profile_shares.profile_slug = bulletins.profile_slug
                AND profile_shares.shared_with_id = auth.uid()
                AND profile_shares.role = 'editor'
            )
        )
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.users
                WHERE users.profile_slug = bulletins.profile_slug
                AND users.id = auth.uid()
            )
        )
    );

-- Allow users to delete bulletins they created OR bulletins for profiles they have editor access to
CREATE POLICY "Users can delete accessible bulletins" ON public.bulletins
    FOR DELETE USING (
        auth.uid() = created_by
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profile_shares
                WHERE profile_shares.profile_slug = bulletins.profile_slug
                AND profile_shares.shared_with_id = auth.uid()
                AND profile_shares.role = 'editor'
            )
        )
        OR (
            profile_slug IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.users
                WHERE users.profile_slug = bulletins.profile_slug
                AND users.id = auth.uid()
            )
        )
    );

-- Keep the existing create policy unchanged
CREATE POLICY "Users can create bulletins" ON public.bulletins
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Update existing bulletins to have the correct profile_slug
-- This sets the profile_slug for bulletins based on the creator's profile_slug
UPDATE public.bulletins
SET profile_slug = (
    SELECT users.profile_slug
    FROM public.users
    WHERE users.id = bulletins.created_by
)
WHERE profile_slug IS NULL
AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = bulletins.created_by
    AND users.profile_slug IS NOT NULL
);