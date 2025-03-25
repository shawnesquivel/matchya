-- Create prompt categories table
CREATE TABLE prompt_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create prompts table (for both system and potential future custom prompts)
CREATE TABLE prompts (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references prompt_categories(id) not null,
  question text not null,
  is_active boolean default true,
  is_custom boolean default false,
  created_by_therapist_id uuid references therapists(id) on delete set null,
  is_public boolean default false,
  display_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create therapist answers table with embedding support
CREATE TABLE therapist_prompts (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid references therapists(id) on delete cascade not null,
  prompt_id uuid references prompts(id) on delete restrict not null,
  answer text not null,
  answer_embedding vector(1536), -- Add embedding column for future search
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  UNIQUE(therapist_id, prompt_id)
);

-- Apply the existing updated_at trigger to our new tables
CREATE TRIGGER prompt_categories_updated_at
  BEFORE UPDATE ON prompt_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER therapist_prompts_updated_at
  BEFORE UPDATE ON therapist_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view prompt categories"
  ON prompt_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view prompts"
  ON prompts FOR SELECT
  USING (true);

CREATE POLICY "Public can view therapist prompts"
  ON therapist_prompts FOR SELECT
  USING (true);

-- Add service role policies for writing
CREATE POLICY "Service role can modify prompt categories"
  ON prompt_categories FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can modify prompts"
  ON prompts FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can modify therapist prompts"
  ON therapist_prompts FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

-- Create indexes for faster queries
CREATE INDEX idx_therapist_prompts_therapist_id ON therapist_prompts(therapist_id);
CREATE INDEX idx_prompts_category_id ON prompts(category_id);

-- Add embedding index for future vector search
CREATE INDEX therapist_prompts_embedding_idx ON therapist_prompts 
  USING ivfflat (answer_embedding vector_ip_ops)
  WITH (lists = 100);

-- Insert initial categories with simple lowercase names as requested
INSERT INTO prompt_categories (name, display_name, description, display_order)
VALUES 
('personal', 'Personal', 'Insights into the therapist as a person', 10),
('therapeutic', 'Therapeutic Approach', 'Information about professional style', 20),
('fun', 'Fun Facts', 'Lighter, more relatable content', 30);

-- Create separate triggers for insert and update, with filtering for therapeutic prompts only
-- For INSERT trigger
CREATE OR REPLACE FUNCTION private.embed_therapeutic_prompt_answers()
RETURNS TRIGGER AS $$
DECLARE
  therapeutic_category_id uuid;
BEGIN
  -- Get the therapeutic category ID
  SELECT id INTO therapeutic_category_id FROM prompt_categories WHERE name = 'therapeutic';
  
  -- Only embed answers to therapeutic prompts
  PERFORM
    private.embed(
      'answer',
      'answer_embedding',
      'therapist_prompts',
      'id',
      ARRAY(
        SELECT tp.id 
        FROM therapist_prompts tp
        JOIN prompts p ON tp.prompt_id = p.id
        WHERE p.category_id = therapeutic_category_id
        AND tp.id IN (SELECT id FROM inserted)
      )
    );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert trigger
CREATE TRIGGER embed_therapist_prompt_answers_insert
  AFTER INSERT ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.embed_therapeutic_prompt_answers();

-- Update trigger  
CREATE TRIGGER embed_therapist_prompt_answers_update
  AFTER UPDATE ON therapist_prompts
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.embed_therapeutic_prompt_answers();

-- Insert initial prompts from the documentation
-- First get the category IDs
DO $$
DECLARE
    personal_id uuid;
    therapeutic_id uuid;
    fun_id uuid;
BEGIN
    SELECT id INTO personal_id FROM prompt_categories WHERE name = 'personal';
    SELECT id INTO therapeutic_id FROM prompt_categories WHERE name = 'therapeutic';
    SELECT id INTO fun_id FROM prompt_categories WHERE name = 'fun';
    
    -- Insert personal prompts
    INSERT INTO prompts (category_id, question, display_order)
    VALUES
    (personal_id, 'If therapy had a theme song, mine would be', 10),
    (personal_id, 'The best advice I''ve ever received is', 20),
    (personal_id, 'If I weren''t a therapist, I''d be', 30),
    (personal_id, 'My go-to self-care ritual is', 40),
    (personal_id, 'A book that changed my perspective on mental health', 50),
    (personal_id, 'If I could have a conversation with any historical figure about mental well-being, it would be', 60);
    
    -- Insert therapeutic prompts
    INSERT INTO prompts (category_id, question, display_order)
    VALUES
    (therapeutic_id, 'In my therapy room, you can always expect', 10),
    (therapeutic_id, 'My therapy style in three words', 20),
    (therapeutic_id, 'My experiences and interests give me a unique understanding of', 30),
    (therapeutic_id, 'A common misconception about therapy that I wish more people knew', 40),
    (therapeutic_id, 'I believe healing looks like', 50),
    (therapeutic_id, 'I''m not the right therapist for you if you''re looking for', 60),
    (therapeutic_id, 'If my therapy style were a coffee order, it would be', 70);
    
    -- Insert fun prompts
    INSERT INTO prompts (category_id, question, display_order)
    VALUES
    (fun_id, 'The emoji that best represents my therapy style', 10),
    (fun_id, 'If my clients could describe me in a meme, it would be', 20),
    (fun_id, 'If I could add one ''unconventional'' tool to my therapy practice, it would be', 30),
    (fun_id, 'If my job had a tagline, it would be', 40),
    (fun_id, 'The most rewarding part of my work is', 50);
END $$;

-- Add comments to tables
COMMENT ON TABLE prompt_categories IS 'Categories for therapist profile prompts';
COMMENT ON TABLE prompts IS 'Questions for therapists to answer on their profiles';
COMMENT ON TABLE therapist_prompts IS 'Therapist answers to profile prompts with vector search capabilities';
COMMENT ON COLUMN therapist_prompts.answer_embedding IS 'Vector embedding of prompt answer for similarity search';