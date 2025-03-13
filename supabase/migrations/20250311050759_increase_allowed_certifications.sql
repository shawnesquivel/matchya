-- Drop the existing constraint first
ALTER TABLE therapists 
DROP CONSTRAINT IF EXISTS therapists_certifications_check;

-- Add a new constraint with higher limit
ALTER TABLE therapists
ADD CONSTRAINT therapists_certifications_check 
CHECK (array_length(certifications, 1) <= 20);