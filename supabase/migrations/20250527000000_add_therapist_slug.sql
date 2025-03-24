-- Add slug column if it doesn't exist
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs with proper formatting and hyphen between first and last name
-- This will run even if the table is empty (no rows affected) and is safe to run multiple times
UPDATE therapists
SET slug = LOWER(
  REGEXP_REPLACE(first_name, '[^a-zA-Z0-9]', '', 'g')
  || '-' ||
  REGEXP_REPLACE(last_name, '[^a-zA-Z0-9]', '', 'g')
  || '-' || 
  SUBSTRING(id::text, 1, 6)
)
WHERE slug IS NULL OR slug = '';

-- Create unique index if it doesn't exist
DROP INDEX IF EXISTS therapists_slug_idx;
CREATE UNIQUE INDEX therapists_slug_idx ON therapists (slug);

-- Add column comment
COMMENT ON COLUMN therapists.slug IS 'Unique URL-friendly identifier for this therapist in format first-last-uuid*6';
