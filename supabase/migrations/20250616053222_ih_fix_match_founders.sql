-- 20250616053222_public_match_founders.sql
CREATE OR REPLACE FUNCTION public.match_founders(
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