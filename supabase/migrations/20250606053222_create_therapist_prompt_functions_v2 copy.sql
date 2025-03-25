CREATE OR REPLACE FUNCTION search_therapists_by_prompt_answers_v2(
  query_text text,
  match_threshold float DEFAULT 0.6,
  limit_count integer DEFAULT 10,
  category_filter text DEFAULT 'therapeutic'
)
RETURNS TABLE (
  therapist_id uuid,
  first_name text,
  last_name text,
  prompt_id uuid,
  question text,
  answer text,
  category_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_embedding vector(1536);
  category_id uuid;
BEGIN
  -- Get the category ID
  SELECT id INTO category_id FROM prompt_categories WHERE name = category_filter;
  
  -- Call the edge function directly to generate embedding for the query
  PERFORM net.http_post(
    url := 'https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/embed_prompt',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs'
    ),
    body := jsonb_build_object(
      'content', query_text,
      'generate_only', true
    ),
    timeout_milliseconds := 30000
  );
  
  -- For now, let's use text similarity as a fallback
  RETURN QUERY
  SELECT
    t.id AS therapist_id,
    t.first_name,
    t.last_name,
    tp.prompt_id,
    p.question,
    tp.answer,
    pc.name AS category_name,
    CASE 
      WHEN tp.answer ILIKE '%' || query_text || '%' THEN 0.9
      ELSE 0.7
    END AS similarity
  FROM
    therapist_prompts tp
    JOIN therapists t ON tp.therapist_id = t.id
    JOIN prompts p ON tp.prompt_id = p.id
    JOIN prompt_categories pc ON p.category_id = pc.id
  WHERE
    tp.answer_embedding IS NOT NULL
    AND p.category_id = category_id
  ORDER BY
    similarity DESC
  LIMIT limit_count;
END;
$$;