-- Create a separate schema for indie hackers
CREATE SCHEMA IF NOT EXISTS ih;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Define industry type as enum
CREATE TYPE ih.industry_type AS ENUM (
  'agriculture_agtech',
  'artificial_intelligence',
  'ar_vr',
  'b2b_enterprise',
  'biomedical_biotech',
  'blockchain',
  'climate_sustainability',
  'consumer',
  'ecommerce',
  'developer_tools',
  'education_edtech',
  'energy',
  'entertainment',
  'financial_fintech',
  'food_beverage',
  'gaming',
  'government',
  'hardware',
  'hard_tech',
  'health_wellness',
  'healthcare',
  'marketplace',
  'non_profit'
);

-- Profiles table
CREATE TABLE ih.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  profile_image_url TEXT,
  x_link TEXT,
  linkedin_url TEXT,
  personal_website TEXT,
  blog_url TEXT,
  perplexity_analysis TEXT,
  scraped_content TEXT,
  raw_product_links TEXT NOT NULL, -- Required: comma-separated links
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for profiles
CREATE INDEX idx_ih_profiles_first_name ON ih.profiles (first_name);

