-- Add total_estimated_mrr column to profiles table
ALTER TABLE ih.profiles
ADD COLUMN total_estimated_mrr NUMERIC DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN ih.profiles.total_estimated_mrr IS 'Total estimated Monthly Recurring Revenue (MRR) across all products in USD. NULL if unknown.';