-- Migration: Add profile sharing functionality
-- Run this migration on existing Supabase instances to add profile sharing support

-- Create profile shares table
CREATE TABLE IF NOT EXISTS public.profile_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_slug TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    shared_with_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_slug, shared_with_id)
);

-- Create profile invitations table
CREATE TABLE IF NOT EXISTS public.profile_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_slug TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_slug, invited_email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_shares_profile_slug ON public.profile_shares(profile_slug);
CREATE INDEX IF NOT EXISTS idx_profile_shares_shared_with ON public.profile_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_profile_invitations_token ON public.profile_invitations(token);
CREATE INDEX IF NOT EXISTS idx_profile_invitations_email ON public.profile_invitations(invited_email);

-- Enable RLS
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_invitations ENABLE ROW LEVEL SECURITY;

-- Profile shares table policies
CREATE POLICY "Users can view shares they own or are part of" ON public.profile_shares
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

CREATE POLICY "Profile owners can create shares" ON public.profile_shares
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Profile owners can update shares" ON public.profile_shares
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Profile owners can delete shares" ON public.profile_shares
    FOR DELETE USING (auth.uid() = owner_id);

-- Profile invitations table policies
CREATE POLICY "Users can view invitations they created" ON public.profile_invitations
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Profile owners can create invitations" ON public.profile_invitations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Profile owners can update invitations" ON public.profile_invitations
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Profile owners can delete invitations" ON public.profile_invitations
    FOR DELETE USING (auth.uid() = owner_id);

-- Function to create owner share when profile is created
CREATE OR REPLACE FUNCTION create_profile_owner_share()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user sets their profile_slug, create an owner share record
    IF NEW.profile_slug IS NOT NULL AND (OLD.profile_slug IS NULL OR OLD.profile_slug != NEW.profile_slug) THEN
        INSERT INTO public.profile_shares (profile_slug, owner_id, shared_with_id, role)
        VALUES (NEW.profile_slug, NEW.id, NEW.id, 'owner')
        ON CONFLICT (profile_slug, shared_with_id)
        DO UPDATE SET role = 'owner', updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile owner shares
DROP TRIGGER IF EXISTS profile_owner_share_trigger ON public.users;
CREATE TRIGGER profile_owner_share_trigger
    AFTER UPDATE OF profile_slug ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_owner_share();

-- Create owner shares for existing users with profile slugs
INSERT INTO public.profile_shares (profile_slug, owner_id, shared_with_id, role)
SELECT profile_slug, id, id, 'owner'
FROM public.users
WHERE profile_slug IS NOT NULL
ON CONFLICT (profile_slug, shared_with_id) DO NOTHING;

-- Function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.profile_invitations
    WHERE expires_at < NOW() AND accepted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profile_shares TO authenticated;
GRANT ALL ON public.profile_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_token() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;