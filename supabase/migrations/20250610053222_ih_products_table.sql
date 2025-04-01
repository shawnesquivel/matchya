-- Products table
CREATE TABLE ih.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  landing_page_link TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- MRR calculation fields (nullable since we might not get all info)
  total_user_count INTEGER,
  has_freemium BOOLEAN,
  conversion_rate DECIMAL DEFAULT 0.05,
  monthly_subscription_price DECIMAL,
  annual_subscription_price DECIMAL,
  blended_monthly_price DECIMAL,
  paying_user_count INTEGER,
  estimated_mrr DECIMAL,
  
  -- Analysis and metadata
  industry ih.industry_type[],
  llm_mrr_analysis TEXT,
  llm_product_summary TEXT,
  scraped_content TEXT,
  embedding vector(1536),
  mrr_calculation_complete BOOLEAN DEFAULT FALSE,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile-Product relationship table
CREATE TABLE ih.profile_products (
  profile_id UUID REFERENCES ih.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES ih.products(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  PRIMARY KEY (profile_id, product_id),
  CONSTRAINT fk_profile_names 
    FOREIGN KEY (profile_id) 
    REFERENCES ih.profiles(id) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_ih_products_industry ON ih.products USING GIN (industry);
CREATE INDEX idx_ih_products_mrr ON ih.products (estimated_mrr);
CREATE INDEX idx_ih_products_landing_page ON ih.products (landing_page_link);
CREATE INDEX idx_profile_products_names ON ih.profile_products (first_name, last_name);