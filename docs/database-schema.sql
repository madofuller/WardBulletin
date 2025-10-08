-- MyWardBulletin Database Schema
-- This file contains the complete database schema for contributors to set up their own Supabase instance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    profile_slug TEXT UNIQUE,
    active_bulletin_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bulletins (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    meeting_date DATE NOT NULL,
    meeting_type TEXT NOT NULL,
    view_permission TEXT DEFAULT 'private',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profile_slug TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'archived')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    auto_activate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    visibility TEXT DEFAULT 'private',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, created_by)
);

-- Profile sharing tables
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
CREATE INDEX IF NOT EXISTS idx_bulletins_created_by ON public.bulletins(created_by);
CREATE INDEX IF NOT EXISTS idx_bulletins_slug ON public.bulletins(slug);
CREATE INDEX IF NOT EXISTS idx_bulletins_status ON public.bulletins(status);
CREATE INDEX IF NOT EXISTS idx_bulletins_scheduled_date ON public.bulletins(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bulletins_auto_activate ON public.bulletins(auto_activate, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bulletins_profile_slug ON public.bulletins(profile_slug);
CREATE INDEX IF NOT EXISTS idx_tokens_created_by ON public.tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_tokens_key ON public.tokens(key);
CREATE INDEX IF NOT EXISTS idx_users_profile_slug ON public.users(profile_slug);
CREATE INDEX IF NOT EXISTS idx_profile_shares_profile_slug ON public.profile_shares(profile_slug);
CREATE INDEX IF NOT EXISTS idx_profile_shares_shared_with ON public.profile_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_profile_invitations_token ON public.profile_invitations(token);
CREATE INDEX IF NOT EXISTS idx_profile_invitations_email ON public.profile_invitations(invited_email);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_invitations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Bulletins table policies
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

CREATE POLICY "Users can create bulletins" ON public.bulletins
    FOR INSERT WITH CHECK (auth.uid() = created_by);

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

-- Tokens table policies
CREATE POLICY "Users can view their own tokens" ON public.tokens
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create tokens" ON public.tokens
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tokens" ON public.tokens
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tokens" ON public.tokens
    FOR DELETE USING (auth.uid() = created_by);

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

-- Function to automatically create user record on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Set up Supabase Auth
-- You'll need to configure the following in your Supabase dashboard:
-- 1. Go to Authentication → Settings
-- 2. Enable email confirmations if desired
-- 3. Set up any additional auth providers you want to use