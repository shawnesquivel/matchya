-- Add safety assessment fields to profiles table
ALTER TABLE profiles 
ADD COLUMN safety_assessment_completed_at TIMESTAMPTZ,
ADD COLUMN safety_assessment_answers JSONB;
