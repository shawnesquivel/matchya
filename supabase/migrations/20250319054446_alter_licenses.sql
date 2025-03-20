-- Allow empty license numbers while keeping the column as NOT NULL
-- This allows inserting empty strings but still requires the column to be present
ALTER TABLE therapist_licenses
ALTER COLUMN license_number DROP NOT NULL;

-- Ensure license_number is never NULL (but can be empty string)
ALTER TABLE therapist_licenses
ADD CONSTRAINT therapist_licenses_license_number_not_null
CHECK (license_number IS NOT NULL);

COMMENT ON COLUMN therapist_licenses.license_number IS 'License number, which can be empty string but must be provided';

-- Convert state enum to TEXT type
ALTER TABLE therapist_licenses
ALTER COLUMN state TYPE TEXT;

-- Convert title enum to TEXT type
ALTER TABLE therapist_licenses
ALTER COLUMN title TYPE TEXT;

-- Ensure state is never NULL
ALTER TABLE therapist_licenses
ADD CONSTRAINT therapist_licenses_state_not_null
CHECK (state IS NOT NULL);

-- Ensure title is never NULL
ALTER TABLE therapist_licenses
ADD CONSTRAINT therapist_licenses_title_not_null
CHECK (title IS NOT NULL);

-- Create a function to normalize licenses during insertion
CREATE OR REPLACE FUNCTION sanitize_therapist_license()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert empty license numbers to placeholder
  IF NEW.license_number = '' THEN
    NEW.license_number := '00000';
  END IF;
  
  -- Handle state normalization for common full names
  IF NEW.state = 'Ontario' THEN
    NEW.state := 'ON';
  ELSIF NEW.state = 'British Columbia' THEN
    NEW.state := 'BC';
  ELSIF NEW.state = 'California' THEN
    NEW.state := 'CA';
  ELSIF NEW.state = 'New York' THEN
    NEW.state := 'NY';
  END IF;
  
  -- Normalize MCP titles for consistency
  IF NEW.title = 'MSC' THEN
    NEW.title := 'MSW';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function before insert or update
CREATE TRIGGER sanitize_therapist_license_trigger
BEFORE INSERT OR UPDATE ON therapist_licenses
FOR EACH ROW
EXECUTE FUNCTION sanitize_therapist_license();

-- Update comments for clarity
COMMENT ON TABLE therapist_licenses IS 'Therapist licenses with flexible validation to handle incomplete license data';
COMMENT ON COLUMN therapist_licenses.state IS 'Jurisdiction code as TEXT (automatically normalized if full province name is provided)';
COMMENT ON COLUMN therapist_licenses.title IS 'License title as TEXT (automatically normalized for common variations)';
