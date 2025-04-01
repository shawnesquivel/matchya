-- Create match_founders function
CREATE OR REPLACE FUNCTION ih.match_founders(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  min_mrr numeric DEFAULT NULL,
  max_mrr numeric DEFAULT NULL,
  limit_count integer DEFAULT 10
) 
RETURNS TABLE (
  id uuid,
  user_id text,
  first_name text,
  last_name text,
  x_link text,
  raw_product_links text,
  total_estimated_mrr numeric,
  llm_founder_summary text,
  perplexity_analysis text,
  similarity float
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.x_link,
    p.raw_product_links,
    p.total_estimated_mrr,
    p.llm_founder_summary,
    p.perplexity_analysis,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM 
    ih.profiles p
  WHERE 
    p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (min_mrr IS NULL OR p.total_estimated_mrr >= min_mrr)
    AND (max_mrr IS NULL OR p.total_estimated_mrr <= max_mrr)
  ORDER BY 
    p.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$;

-- Add comment to explain the function
COMMENT ON FUNCTION ih.match_founders IS 'Finds indie hackers based on embedding similarity with optional MRR filtering';

-- Create index on embedding for faster vector search
CREATE INDEX IF NOT EXISTS idx_ih_profiles_embedding ON ih.profiles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on MRR for faster filtering
CREATE INDEX IF NOT EXISTS idx_ih_profiles_mrr ON ih.profiles(total_estimated_mrr); 