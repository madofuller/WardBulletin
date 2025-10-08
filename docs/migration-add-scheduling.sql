-- Migration: Add scheduling functionality to bulletins
-- Run this migration on existing Supabase instances to add scheduling support

-- Add new columns to bulletins table
ALTER TABLE public.bulletins
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_activate BOOLEAN DEFAULT false;

-- Add constraint for status values
ALTER TABLE public.bulletins
ADD CONSTRAINT bulletins_status_check
CHECK (status IN ('draft', 'scheduled', 'active', 'archived'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bulletins_status ON public.bulletins(status);
CREATE INDEX IF NOT EXISTS idx_bulletins_scheduled_date ON public.bulletins(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bulletins_auto_activate ON public.bulletins(auto_activate, scheduled_date);

-- Update existing bulletins to have a status
-- Set status to 'active' for bulletins that are currently active
UPDATE public.bulletins
SET status = 'active'
WHERE id IN (
  SELECT active_bulletin_id
  FROM public.users
  WHERE active_bulletin_id IS NOT NULL
);

-- Set remaining bulletins to 'draft'
UPDATE public.bulletins
SET status = 'draft'
WHERE status IS NULL;

-- Make status NOT NULL now that all records have values
ALTER TABLE public.bulletins
ALTER COLUMN status SET NOT NULL;

-- Create function to automatically activate scheduled bulletins
CREATE OR REPLACE FUNCTION activate_scheduled_bulletins()
RETURNS void AS $$
DECLARE
  bulletin_record RECORD;
  old_active_id TEXT;
BEGIN
  -- Get all bulletins that should be activated
  FOR bulletin_record IN
    SELECT id, created_by
    FROM public.bulletins
    WHERE status = 'scheduled'
      AND auto_activate = true
      AND scheduled_date <= NOW()
  LOOP
    -- Get the current active bulletin for this user
    SELECT active_bulletin_id INTO old_active_id
    FROM public.users
    WHERE id = bulletin_record.created_by;

    -- Archive the old active bulletin if it exists
    IF old_active_id IS NOT NULL THEN
      UPDATE public.bulletins
      SET status = 'archived'
      WHERE id = old_active_id;
    END IF;

    -- Activate the new bulletin
    UPDATE public.bulletins
    SET status = 'active'
    WHERE id = bulletin_record.id;

    -- Update user's active bulletin
    UPDATE public.users
    SET active_bulletin_id = bulletin_record.id
    WHERE id = bulletin_record.created_by;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle bulletin status transitions
CREATE OR REPLACE FUNCTION handle_bulletin_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If a bulletin is being set to active, update the user's active_bulletin_id
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    -- Archive any other active bulletins for this user
    UPDATE public.bulletins
    SET status = 'archived'
    WHERE created_by = NEW.created_by
      AND status = 'active'
      AND id != NEW.id;

    -- Update user's active bulletin
    UPDATE public.users
    SET active_bulletin_id = NEW.id
    WHERE id = NEW.created_by;
  END IF;

  -- If a bulletin is being deactivated and it's the user's active bulletin, clear it
  IF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE public.users
    SET active_bulletin_id = NULL
    WHERE id = NEW.created_by AND active_bulletin_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for bulletin status changes
DROP TRIGGER IF EXISTS bulletin_status_change_trigger ON public.bulletins;
CREATE TRIGGER bulletin_status_change_trigger
  AFTER UPDATE OF status ON public.bulletins
  FOR EACH ROW
  EXECUTE FUNCTION handle_bulletin_status_change();

-- Grant execute permission on the activation function
GRANT EXECUTE ON FUNCTION activate_scheduled_bulletins() TO authenticated;