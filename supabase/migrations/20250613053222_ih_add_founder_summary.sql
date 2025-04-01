-- Add llm_founder_summary column to profiles table
ALTER TABLE ih.profiles
ADD COLUMN llm_founder_summary TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN ih.profiles.llm_founder_summary IS 'AI-generated summary of the founder''s background and achievements'; 