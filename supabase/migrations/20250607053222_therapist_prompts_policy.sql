CREATE POLICY "Allow embedding updates from edge function" 
ON therapist_prompts
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Allow embedding updates from edge function" ON therapist_prompts IS 
'Permits the anonymous (anon) role to update therapist_prompts records. 
Supabase Edge Functions connect to the database using the anon role by default when using the supabase-js client. Without this policy, the edge function can successfully generate embeddings but cannot save them to the database due to Row Level Security (RLS) restrictions. The status code 204 (success) was misleading, as it indicated the query syntax was valid but the actual update operation was silently blocked by RLS.';


