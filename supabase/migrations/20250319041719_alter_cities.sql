CREATE INDEX idx_therapist_location ON therapists(clinic_province);

CREATE TABLE IF NOT EXISTS supported_regions (
  id SERIAL PRIMARY KEY,
  region_code TEXT NOT NULL,  -- Province or state code (e.g., BC, ON, CA, NY)
  region_name TEXT NOT NULL,  -- Full name (e.g., British Columbia, Ontario)
  country TEXT NOT NULL DEFAULT 'Canada',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(region_code, country)
);

-- Add region_id foreign key and region_log column
ALTER TABLE therapists ADD COLUMN region_id INTEGER REFERENCES supported_regions(id) NULL;
ALTER TABLE therapists ADD COLUMN region_log JSONB;
COMMENT ON COLUMN therapists.region_log IS 'JSONB data containing information about region matching and updates';

-- Insert initial supported regions
INSERT INTO supported_regions (region_code, region_name, country) VALUES
  ('BC', 'British Columbia', 'Canada'),
  ('ON', 'Ontario', 'Canada'),
  ('CA', 'California', 'United States'),
  ('NY', 'New York', 'United States')
ON CONFLICT (region_code, country) DO NOTHING;

-- Function to update the region_id automatically based on province
CREATE OR REPLACE FUNCTION update_therapist_region_id()
RETURNS TRIGGER AS $$
DECLARE
  region_log_entry JSONB;
BEGIN
  -- Try to find a match in supported regions
  SELECT id INTO NEW.region_id
  FROM supported_regions
  WHERE 
    LOWER(region_code) = LOWER(NEW.clinic_province);
  
  -- Prepare region log data
  region_log_entry := jsonb_build_object(
    'timestamp', now(),
    'action', 'region_id_update',
    'province', NEW.clinic_province,
    'found_match', NEW.region_id IS NOT NULL
  );
  
  -- If no match found, add detail to log
  IF NEW.region_id IS NULL THEN
    region_log_entry := region_log_entry || 
      jsonb_build_object('message', 'No matching region found in supported_regions table');
  ELSE
    region_log_entry := region_log_entry || 
      jsonb_build_object('region_id', NEW.region_id);
  END IF;
  
  -- Append to existing region_log or create new one
  IF NEW.region_log IS NOT NULL THEN
    -- If existing log is an array, append to it
    IF jsonb_typeof(NEW.region_log) = 'array' THEN
      NEW.region_log := NEW.region_log || region_log_entry;
    ELSE
      -- If existing log is not an array, create a new array with both values
      NEW.region_log := jsonb_build_array(NEW.region_log, region_log_entry);
    END IF;
  ELSE
    -- No existing log, create a new array with one entry
    NEW.region_log := jsonb_build_array(region_log_entry);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update region_id when therapist is inserted or updated
CREATE TRIGGER therapist_region_update
BEFORE INSERT OR UPDATE OF clinic_province ON therapists
FOR EACH ROW
EXECUTE FUNCTION update_therapist_region_id();

-- Update existing therapists with region_id and initialize region_log
UPDATE therapists t
SET 
  region_id = sr.id,
  region_log = jsonb_build_array(
    jsonb_build_object(
      'timestamp', now(),
      'action', 'initial_region_update',
      'province', t.clinic_province,
      'found_match', sr.id IS NOT NULL,
      'region_id', sr.id
    )
  )
FROM supported_regions sr
WHERE 
  LOWER(t.clinic_province) = LOWER(sr.region_code);

-- Create a function to filter therapists by region
CREATE OR REPLACE FUNCTION filter_therapists_by_region(region_code TEXT)
RETURNS TABLE (therapist_id UUID) AS $$
BEGIN
  -- Filter by region code
  IF region_code IS NOT NULL AND region_code <> '' THEN    
    RETURN QUERY
    SELECT t.id::UUID
    FROM therapists t
    WHERE 
      LOWER(t.clinic_province) = LOWER(region_code)
      OR t.availability = 'online'; -- Include online therapists regardless of location
  ELSE
    -- Return all therapists if no region filter
    RETURN QUERY SELECT id::UUID FROM therapists;
  END IF;
END;
$$ LANGUAGE plpgsql;