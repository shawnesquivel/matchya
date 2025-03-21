-- Add is_accepting_clients column to therapists table
-- This flag indicates whether a therapist is currently accepting new clients
ALTER TABLE therapists 
ADD COLUMN is_accepting_clients BOOLEAN NOT NULL DEFAULT TRUE;

-- Add a comment explaining the purpose of this field
COMMENT ON COLUMN therapists.is_accepting_clients IS 'Indicates whether the therapist is currently accepting new clients';

-- Update existing therapists to default to accepting clients (true)
UPDATE therapists SET is_accepting_clients = TRUE;
