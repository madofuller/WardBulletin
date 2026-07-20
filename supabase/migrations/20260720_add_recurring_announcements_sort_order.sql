-- Add explicit ordering to recurring announcements so clerks control the
-- order they appear in the bulletin, instead of newest-created-first.
-- Backfill in creation order so existing lists keep the order users saved
-- them in.
ALTER TABLE recurring_announcements
  ADD COLUMN IF NOT EXISTS sort_order integer;

UPDATE recurring_announcements ra
SET sort_order = sub.rn
FROM (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY profile_slug ORDER BY created_at ASC) - 1 AS rn
  FROM recurring_announcements
) sub
WHERE ra.id = sub.id
  AND ra.sort_order IS NULL;
