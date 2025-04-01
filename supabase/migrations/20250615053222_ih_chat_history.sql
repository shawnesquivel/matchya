-- Create chat history table for indie hacker conversations
CREATE TABLE IF NOT EXISTS ih.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('USER', 'OPENAI')),
  founder_ids UUID[] DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to explain the table
COMMENT ON TABLE ih.chat_history IS 'Stores chat history for indie hacker conversations';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_history_chat_id ON ih.chat_history(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_source ON ih.chat_history(source);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON ih.chat_history(created_at);

-- Create GIN index for founder_ids array for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_history_founder_ids ON ih.chat_history USING GIN (founder_ids);

-- Enable RLS
ALTER TABLE ih.chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (for POC, would be more restricted in production)
CREATE POLICY chat_history_public_access
  ON ih.chat_history
  FOR ALL
  TO PUBLIC
  USING (true); 