-- DEFINITIONS IN docs/THERAPIST_PROMPT_FUNCTIONS.md

-- Create search function for finding therapists with similar prompt answers
CREATE OR REPLACE FUNCTION search_therapists_by_prompt_answers(
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
  therapeutic_category_id uuid;
BEGIN
  -- Get the therapeutic category ID
  SELECT id INTO therapeutic_category_id FROM prompt_categories WHERE name = category_filter;
  
  -- For direct embedding generation, we need to call the OpenAI API through the edge function
  -- This would typically be done through the edge function, but for search we'll use a different approach
  -- We'll leverage the existing embeddings infrastructure for consistency
  
  -- Generate temporary embedding record in a function-local temp table
  CREATE TEMP TABLE temp_query_embedding (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text,
    embedding vector(1536)
  ) ON COMMIT DROP;
  
  -- Insert the query text
  INSERT INTO temp_query_embedding (content) VALUES (query_text);
  
  -- Call the embedding function directly on this temporary record
  -- Note: This is a workaround - in production you might want to call your edge function directly
  PERFORM net.http_post(
    url := 'https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/embed',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs'
    ),
    body := jsonb_build_object(
      'ids', (SELECT json_agg(id) FROM temp_query_embedding),
      'table', 'temp_query_embedding',
      'contentColumn', 'content',
      'embeddingColumn', 'embedding'
    ),
    timeout_milliseconds := 30000
  );
  
  -- Retrieve the generated embedding
  SELECT embedding INTO query_embedding FROM temp_query_embedding LIMIT 1;
  
  -- If we couldn't generate an embedding, raise an error
  IF query_embedding IS NULL THEN
    RAISE EXCEPTION 'Could not generate embedding for query text';
  END IF;
  
  RETURN QUERY
  WITH prompt_matches AS (
    SELECT
      tp.therapist_id,
      tp.prompt_id,
      tp.answer,
      1 - (tp.answer_embedding <=> query_embedding) AS similarity
    FROM
      therapist_prompts tp
      JOIN prompts p ON tp.prompt_id = p.id
    WHERE
      tp.answer_embedding IS NOT NULL
      AND p.category_id = therapeutic_category_id
      AND 1 - (tp.answer_embedding <=> query_embedding) > match_threshold
    ORDER BY
      similarity DESC
    LIMIT limit_count
  )
  SELECT
    pm.therapist_id,
    t.first_name,
    t.last_name,
    pm.prompt_id,
    p.question,
    pm.answer,
    pc.name AS category_name,
    pm.similarity
  FROM
    prompt_matches pm
    JOIN therapists t ON pm.therapist_id = t.id
    JOIN prompts p ON pm.prompt_id = p.id
    JOIN prompt_categories pc ON p.category_id = pc.id
  ORDER BY
    pm.similarity DESC;
END;
$$;

COMMENT ON FUNCTION search_therapists_by_prompt_answers IS 'Search for therapists with prompt answers similar to the query text, primarily for therapeutic approach matching';

-- Function to get all prompt answers for a therapist
CREATE OR REPLACE FUNCTION get_therapist_prompt_answers(therapist_id_param uuid)
RETURNS TABLE (
  prompt_id uuid,
  question text,
  answer text,
  category_name text,
  category_display_name text
)
LANGUAGE sql
AS $$
  SELECT
    tp.prompt_id,
    p.question,
    tp.answer,
    pc.name AS category_name,
    pc.display_name AS category_display_name
  FROM
    therapist_prompts tp
    JOIN prompts p ON tp.prompt_id = p.id
    JOIN prompt_categories pc ON p.category_id = pc.id
  WHERE
    tp.therapist_id = therapist_id_param
  ORDER BY
    pc.display_order, p.display_order;
$$;

COMMENT ON FUNCTION get_therapist_prompt_answers IS 'Get all prompt answers for a specific therapist, organized by category and display order';

-- Create an enhanced version of match_therapists that includes prompt similarity
-- This function is for future use and isn't integrated with the main matching yet
CREATE OR REPLACE FUNCTION match_therapists_with_prompts(
  query_embedding vector(1536),
  match_threshold float,
  prompt_query_text text DEFAULT NULL,
  prompt_match_threshold float DEFAULT 0.6,
  prompt_weight float DEFAULT 0.3,
  prompt_category text DEFAULT 'therapeutic',
  gender_filter text DEFAULT NULL,
  sexuality_filter sexuality_type[] DEFAULT NULL,
  ethnicity_filter ethnicity_type[] DEFAULT NULL,
  faith_filter faith_type[] DEFAULT NULL,
  max_price_initial float DEFAULT NULL,
  availability_filter text DEFAULT NULL,
  areas_of_focus_filter text[] DEFAULT NULL,
  clinic_city_param text DEFAULT NULL,
  clinic_province_param text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  first_name text,
  middle_name text,
  last_name text,
  pronouns text,
  bio text,
  gender text,
  ethnicity ethnicity_type[],
  sexuality sexuality_type[],
  faith faith_type[],
  availability text,
  languages text[],
  ai_summary text,
  areas_of_focus text[],
  approaches text[],
  initial_price text,
  subsequent_price text,
  bio_similarity float,
  prompt_similarity float,
  combined_similarity float,
  profile_img_url text,
  video_intro_link text,
  clinic_profile_url text,
  clinic_booking_url text,
  therapist_email text,
  therapist_phone text,
  clinic_name text,
  clinic_street text,
  clinic_city text,
  clinic_province text,
  clinic_postal_code text,
  clinic_country char(2),
  clinic_phone text,
  education text[],
  certifications text[],
  licenses jsonb,
  is_verified boolean,
  matching_prompt_answer text,
  matching_prompt_question text
)
LANGUAGE plpgsql
AS $$
DECLARE
  prompt_query_embedding vector(1536);
  therapeutic_category_id uuid;
BEGIN
  -- If no prompt query, just use the standard match_therapists function
  IF prompt_query_text IS NULL THEN
    RETURN QUERY
    SELECT 
      t.*,
      t.similarity AS bio_similarity,
      0::float AS prompt_similarity,
      t.similarity AS combined_similarity,
      NULL::text AS matching_prompt_answer,
      NULL::text AS matching_prompt_question
    FROM match_therapists(
      query_embedding,
      match_threshold,
      gender_filter,
      sexuality_filter,
      ethnicity_filter,
      faith_filter,
      max_price_initial,
      availability_filter,
      areas_of_focus_filter,
      clinic_city_param,
      clinic_province_param
    ) t;
    RETURN;
  END IF;
  
  -- Get the therapeutic category ID
  SELECT id INTO therapeutic_category_id FROM prompt_categories WHERE name = prompt_category;
  
  -- Generate embedding for prompt query
  CREATE TEMP TABLE temp_prompt_query_embedding (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text,
    embedding vector(1536)
  ) ON COMMIT DROP;
  
  -- Insert the query text
  INSERT INTO temp_prompt_query_embedding (content) VALUES (prompt_query_text);
  
  -- Call the embedding function
  PERFORM net.http_post(
    url := 'https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/embed',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs'
    ),
    body := jsonb_build_object(
      'ids', (SELECT json_agg(id) FROM temp_prompt_query_embedding),
      'table', 'temp_prompt_query_embedding',
      'contentColumn', 'content',
      'embeddingColumn', 'embedding'
    ),
    timeout_milliseconds := 30000
  );
  
  -- Retrieve the generated embedding
  SELECT embedding INTO prompt_query_embedding FROM temp_prompt_query_embedding LIMIT 1;
  
  -- If we couldn't generate an embedding, fall back to standard search
  IF prompt_query_embedding IS NULL THEN
    RETURN QUERY
    SELECT 
      t.*,
      t.similarity AS bio_similarity,
      0::float AS prompt_similarity,
      t.similarity AS combined_similarity,
      NULL::text AS matching_prompt_answer,
      NULL::text AS matching_prompt_question
    FROM match_therapists(
      query_embedding,
      match_threshold,
      gender_filter,
      sexuality_filter,
      ethnicity_filter,
      faith_filter,
      max_price_initial,
      availability_filter,
      areas_of_focus_filter,
      clinic_city_param,
      clinic_province_param
    ) t;
    RETURN;
  END IF;
  
  -- First get base matches from the standard function
  RETURN QUERY
  WITH base_matches AS (
    SELECT * FROM match_therapists(
      query_embedding,
      match_threshold,
      gender_filter,
      sexuality_filter,
      ethnicity_filter,
      faith_filter,
      max_price_initial,
      availability_filter,
      areas_of_focus_filter,
      clinic_city_param,
      clinic_province_param
    )
  ),
  -- Find best prompt match for each therapist
  prompt_matches AS (
    SELECT DISTINCT ON (tp.therapist_id)
      tp.therapist_id,
      tp.answer AS matching_prompt_answer,
      p.question AS matching_prompt_question,
      1 - (tp.answer_embedding <=> prompt_query_embedding) AS prompt_similarity
    FROM
      therapist_prompts tp
      JOIN prompts p ON tp.prompt_id = p.id
    WHERE
      tp.answer_embedding IS NOT NULL
      AND p.category_id = therapeutic_category_id
    ORDER BY
      tp.therapist_id, prompt_similarity DESC
  ),
  -- Combine results
  combined_results AS (
    SELECT
      bm.*,
      bm.similarity AS bio_similarity,
      COALESCE(pm.prompt_similarity, 0) AS prompt_similarity,
      (bm.similarity * (1 - prompt_weight) + COALESCE(pm.prompt_similarity, 0) * prompt_weight) AS combined_similarity,
      pm.matching_prompt_answer,
      pm.matching_prompt_question
    FROM
      base_matches bm
      LEFT JOIN prompt_matches pm ON bm.id = pm.therapist_id
    WHERE
      prompt_query_text IS NULL OR COALESCE(pm.prompt_similarity, 0) >= prompt_match_threshold
  )
  SELECT * FROM combined_results
  ORDER BY combined_similarity DESC;
END;
$$;

COMMENT ON FUNCTION match_therapists_with_prompts IS 'Enhanced version of match_therapists that includes prompt answer similarity in the ranking';

-- Create a view that simplifies access to prompts and answers
CREATE OR REPLACE VIEW therapist_prompt_view AS
SELECT
  tp.id AS answer_id,
  tp.therapist_id,
  t.first_name,
  t.last_name,
  tp.prompt_id,
  p.question,
  pc.name AS category_name,
  pc.display_name AS category_display_name,
  tp.answer,
  p.display_order AS question_order,
  pc.display_order AS category_order
FROM
  therapist_prompts tp
  JOIN therapists t ON tp.therapist_id = t.id
  JOIN prompts p ON tp.prompt_id = p.id
  JOIN prompt_categories pc ON p.category_id = pc.id
ORDER BY
  tp.therapist_id, pc.display_order, p.display_order;

COMMENT ON VIEW therapist_prompt_view IS 'Simplified view of therapist prompt answers with related information';

-- Create a utility function to insert a therapist's answer to a prompt
CREATE OR REPLACE FUNCTION add_therapist_prompt_answer(
  therapist_id_param uuid,
  prompt_question_text text,
  answer_text text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  prompt_id_val uuid;
  result_id uuid;
BEGIN
  -- Find the prompt ID from the question text
  SELECT id INTO prompt_id_val FROM prompts WHERE question = prompt_question_text;
  
  -- If prompt not found, raise an error
  IF prompt_id_val IS NULL THEN
    RAISE EXCEPTION 'Prompt with question "%" not found', prompt_question_text;
  END IF;
  
  -- Insert the answer
  INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
  VALUES (therapist_id_param, prompt_id_val, answer_text)
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

COMMENT ON FUNCTION add_therapist_prompt_answer IS 'Utility function to easily add a therapist''s answer to a prompt by question text';