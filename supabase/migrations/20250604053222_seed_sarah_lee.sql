-- Seed data for Sarah Lee with therapeutic prompt answers

DO $$
DECLARE
    sarah_id uuid;
    personal_id uuid;
    therapeutic_id uuid;
    fun_id uuid;
    prompt_id uuid;
BEGIN
    -- Get Sarah's ID
    SELECT id INTO sarah_id 
    FROM therapists 
    WHERE first_name = 'Sarah' AND last_name = 'Lee'
    LIMIT 1;

    -- If Sarah doesn't exist, raise an error
    IF sarah_id IS NULL THEN
        RAISE EXCEPTION 'Therapist Sarah Lee not found';
    END IF;

    -- Get category IDs
    SELECT id INTO personal_id FROM prompt_categories WHERE name = 'personal';
    SELECT id INTO therapeutic_id FROM prompt_categories WHERE name = 'therapeutic';
    SELECT id INTO fun_id FROM prompt_categories WHERE name = 'fun';

    -- PERSONAL CATEGORY ANSWERS --
    
    -- "The best advice I've ever received is"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = personal_id AND question = 'The best advice I''ve ever received is';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, 
        'Victor Frankl writes about meaning and suffering… while we may not always control our circumstances, we can choose how to respond to them. The ability to find meaning in life, even in the face of suffering, is what allows individuals to thrive and build resilience'
    )
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    -- "If I weren't a therapist, I'd be"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = personal_id AND question = 'If I weren''t a therapist, I''d be';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, 'A ceramicist ⚱️ or dog trainer 🐶')
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    -- THERAPEUTIC CATEGORY ANSWERS --
    
    -- "My therapy style in three words"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = therapeutic_id AND question = 'My therapy style in three words';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, 'Warm, cozy and non-judgemental')
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    -- "My experiences and interests give me a unique understanding of"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = therapeutic_id AND question = 'My experiences and interests give me a unique understanding of';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, 'BIPOC experience, expat/immigrant experiences, deconversion/religious trauma, identity and growth')
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    -- FUN CATEGORY ANSWERS --
    
    -- "The emoji that best represents my therapy style"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = fun_id AND question = 'The emoji that best represents my therapy style';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, '🌷🥹😊🌱🥺🧘‍♀️👏💪🌻🍃')
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    -- "The most rewarding part of my work is"
    SELECT id INTO prompt_id FROM prompts 
    WHERE category_id = fun_id AND question = 'The most rewarding part of my work is';
    
    INSERT INTO therapist_prompts (therapist_id, prompt_id, answer)
    VALUES (sarah_id, prompt_id, 'Being part of people''s lives and witnessing vulnerability, and the change that comes with that is an honour! Seeing people feel better about themselves or the world, even a little bit is incredible and humbling. It''s the best job ever.')
    ON CONFLICT ON CONSTRAINT therapist_prompts_therapist_id_prompt_id_key
    DO UPDATE 
    SET answer = EXCLUDED.answer,
        updated_at = now();

    RAISE NOTICE 'Successfully added/updated prompt answers for Sarah Lee (ID: %)', sarah_id;
END $$;

-- Check Sarah's prompt answers and embedding status (SQL Editor)
-- SELECT 
--   tp.id,
--   t.first_name || ' ' || t.last_name AS therapist_name,
--   pc.name AS category_name,
--   p.question,
--   substring(tp.answer, 1, 50) || '...' AS answer_preview,
--   tp.answer_embedding IS NOT NULL AS has_embedding,
--   LENGTH(tp.answer_embedding::text) > 0 AS embedding_not_empty,
--   tp.updated_at
-- FROM 
--   therapist_prompts tp
--   JOIN therapists t ON tp.therapist_id = t.id  
--   JOIN prompts p ON tp.prompt_id = p.id
--   JOIN prompt_categories pc ON p.category_id = pc.id
-- WHERE 
--   t.first_name = 'Sarah' AND t.last_name = 'Lee'
-- ORDER BY 
--   pc.display_order, p.display_order; 