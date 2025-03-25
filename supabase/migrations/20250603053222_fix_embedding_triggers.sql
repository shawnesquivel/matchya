-- Create a new migration file: 20250602053222_fix_embed_triggers.sql

-- Drop the problematic triggers
DROP TRIGGER IF EXISTS embed_therapist_prompt_answers_insert ON therapist_prompts;
DROP TRIGGER IF EXISTS embed_therapist_prompt_answers_update ON therapist_prompts;
DROP FUNCTION IF EXISTS private.embed_therapeutic_prompt_answers();

-- Create new triggers using the correct function signature
CREATE TRIGGER embed_therapist_prompts_insert
  AFTER INSERT ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.embed('answer', 'answer_embedding');

CREATE TRIGGER embed_therapist_prompts_update
  AFTER UPDATE ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT  
  EXECUTE FUNCTION private.embed('answer', 'answer_embedding');

-- Deprecated, fixed in 20250605053222_fix_prompt_embed_triggers.sql