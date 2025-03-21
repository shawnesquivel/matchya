-- Drop existing constraints
ALTER TABLE therapists 
DROP CONSTRAINT IF EXISTS therapists_education_check,
DROP CONSTRAINT IF EXISTS therapists_certifications_check,
DROP CONSTRAINT IF EXISTS therapists_approaches_check,
DROP CONSTRAINT IF EXISTS therapists_areas_of_focus_check,
DROP CONSTRAINT IF EXISTS therapists_languages_check;

-- Add new constraints with increased limits
ALTER TABLE therapists
ADD CONSTRAINT therapists_education_check 
CHECK (array_length(education, 1) <= 20),
ADD CONSTRAINT therapists_certifications_check 
CHECK (array_length(certifications, 1) <= 20),
ADD CONSTRAINT therapists_languages_check 
CHECK (array_length(languages, 1) <= 20);