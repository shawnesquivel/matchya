-- Allow fees to have 0 minutes.
ALTER TABLE therapist_fees
DROP CONSTRAINT therapist_fees_duration_minutes_check;

ALTER TABLE therapist_fees
ADD CONSTRAINT therapist_fees_duration_minutes_check
CHECK (duration_minutes >= 0);


-- Add a column to store errors during profile creation
ALTER TABLE therapists
ADD COLUMN creation_log text;

COMMENT ON COLUMN therapists.creation_log IS 'JSON string containing logs, warnings, and errors from the profile creation process';

-- Add allowed pronouns
ALTER TYPE pronouns_type ADD VALUE 'she/they';
ALTER TYPE pronouns_type ADD VALUE 'he/they';

-- Allow clinic_street to be not null
ALTER TABLE therapists
ALTER COLUMN clinic_street DROP NOT NULL;