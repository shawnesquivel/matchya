-- File: supabase/migrations/20250605053222_fix_prompt_embed_triggers.sql

-- Drop existing embedding triggers
DROP TRIGGER IF EXISTS embed_therapist_prompts_insert ON therapist_prompts;
DROP TRIGGER IF EXISTS embed_therapist_prompts_update ON therapist_prompts;

-- Create a function to call the prompt-specific embed function
CREATE OR REPLACE FUNCTION private.embed_prompt_answers()
RETURNS TRIGGER AS $$
DECLARE
  batch_size int = 5;
  batch_count int = ceiling((select count(*) from inserted) / batch_size::float);
  therapeutic_category_id uuid;
BEGIN
  -- Get therapeutic category ID
  SELECT id INTO therapeutic_category_id FROM prompt_categories WHERE name = 'therapeutic';

  -- Debug output
  RAISE NOTICE 'Embedding function for prompts called with % rows', (select count(*) from inserted);

  -- Call our specialized edge function
  for i in 0 .. (batch_count-1) loop
    perform
      net.http_post(
        url := 'https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/embed_prompt',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs'
        ),
        body := jsonb_build_object(
          'ids', (
            SELECT json_agg(row_id) 
            FROM (
              SELECT tp.id as row_id
              FROM inserted tp
              JOIN prompts p ON tp.prompt_id = p.id
              WHERE p.category_id = therapeutic_category_id
              LIMIT batch_size 
              OFFSET i*batch_size
            ) subq
          ),
          'table', 'therapist_prompts',
          'contentColumn', 'answer',
          'embeddingColumn', 'answer_embedding'
        ),
        timeout_milliseconds := 30000
      );
  end loop;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create new triggers using our prompt-specific function
CREATE TRIGGER embed_therapist_prompts_insert
  AFTER INSERT ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.embed_prompt_answers();

CREATE TRIGGER embed_therapist_prompts_update
  AFTER UPDATE ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT  
  EXECUTE FUNCTION private.embed_prompt_answers();

-- Add comment describing the function
COMMENT ON FUNCTION private.embed_prompt_answers IS 'Trigger function to generate embeddings for therapeutic prompt answers using the specialized edge function';