-- Enable vector extension for similarity search
create extension if not exists vector with schema extensions;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create ENUMs for identity fields
CREATE TYPE sexuality_type AS ENUM (
  'straight', 'gay', 'lesbian', 'bisexual', 'queer', 'pansexual', 
  'asexual', 'questioning', 'prefer_not_to_say'
);

CREATE TYPE ethnicity_type AS ENUM (
  'asian', 'black', 'hispanic', 'indigenous', 'middle_eastern', 
  'pacific_islander', 'white', 'multiracial', 'prefer_not_to_say'
);

CREATE TYPE faith_type AS ENUM (
  'agnostic', 'atheist', 'buddhist', 'christian', 'hindu', 'jewish',
  'muslim', 'sikh', 'spiritual', 'other', 'prefer_not_to_say'
);

-- Create ENUMs for fees validation
CREATE TYPE session_category_type AS ENUM (
  'initial', 'consultation', 'subsequent'
);

CREATE TYPE session_type_type AS ENUM (
  'individual', 'couples', 'family', 'group'
);

CREATE TYPE delivery_method_type AS ENUM (
  'in_person', 'virtual', 'hybrid'
);

-- Create ENUM for jurisdictions (Canadian provinces and US states with top 10 cities)
CREATE TYPE jurisdiction_type AS ENUM (
  -- Canadian Provinces
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
  -- US States with top 10 cities by population
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA'
);

-- Create ENUM for Canadian license types
CREATE TYPE license_title_type AS ENUM (
  'RCC', -- Registered Clinical Counsellor
  'RSW', -- Registered Social Worker
  'RP',  -- Registered Psychotherapist
  'CPsych', -- Clinical Psychologist
  'MFT', -- Marriage and Family Therapist
  'RPN', -- Registered Psychiatric Nurse
  'MD'   -- Psychiatrist (Medical Doctor)
);

-- Core therapists table
create table therapists (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Identity & Core Info
  first_name text not null,
  middle_name text,
  last_name text not null,
  pronouns text,
  gender text not null check (gender in ('female', 'male', 'non_binary')),
  sexuality sexuality_type[] not null default '{}',
  ethnicity ethnicity_type[] not null default '{}',
  faith faith_type[] not null default '{}',
  
  -- Profile & Links
  profile_img_url text check (profile_img_url ~ '^https?://.*$'),
  video_intro_link text check (video_intro_link ~ '^https?://.*$'),
  ai_summary text,
  clinic_profile_url text check (clinic_profile_url ~ '^https?://.*$'),
  clinic_booking_url text check (clinic_booking_url ~ '^https?://.*$'),
  
  -- Contact & Location (Flat Structure)
  therapist_email text,
  therapist_phone text check (therapist_phone ~ '^\+?[1-9]\d{1,14}$'),
  clinic_name text not null,
  clinic_street text not null,
  clinic_city text not null,
  clinic_province text not null,
  clinic_postal_code text not null,
  clinic_country char(2) not null,  -- ISO 3166-1 alpha-2
  clinic_phone text check (clinic_phone ~ '^\+?[1-9]\d{1,14}$'),
  
  -- Availability
  availability text not null check (availability in ('online', 'in_person', 'both')),
  
  -- Professional Details
  education text[] not null default '{}' 
    check (array_length(education, 1) <= 4),  -- max 4 entries
  certifications text[] not null default '{}'
    check (array_length(certifications, 1) <= 4),
  approaches jsonb not null default '{"long_term": [], "short_term": []}',
  areas_of_focus text[] not null default '{}',
  languages text[] not null default '{}',
  
  bio text,
  
  -- Vector Embedding
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  
  -- Verification Status
  is_verified boolean not null default false
);

-- Create fees table
CREATE TABLE therapist_fees (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  session_category session_category_type not null,
  session_type session_type_type not null,
  delivery_method delivery_method_type not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price decimal not null check (price > 0),
  currency char(3) check (currency ~ '^[A-Z]{3}$')
);

-- Create licenses table for structured license information
CREATE TABLE therapist_licenses (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- License Details
  license_number text not null,
  state jurisdiction_type not null,  -- Using our custom ENUM
  title license_title_type not null, -- Using our custom license title ENUM
  issuing_body text,                 -- e.g., BCACC, CRPO
  
  -- Verification Fields
  expiry_date date,
  last_verified_date timestamp with time zone,
  is_verified boolean not null default false
);

-- Add indexes
CREATE INDEX idx_therapist_fees_therapist_id ON therapist_fees(therapist_id);
CREATE INDEX idx_therapist_fees_price ON therapist_fees(price);
CREATE INDEX idx_therapist_licenses_therapist_id ON therapist_licenses(therapist_id);
CREATE INDEX therapists_embedding_idx ON therapists 
  using ivfflat (embedding vector_ip_ops)
  with (lists = 100);

-- Updated timestamp trigger
create trigger therapists_updated_at
  before update on therapists
  for each row
  execute function update_updated_at_column();

create trigger therapist_licenses_updated_at
  before update on therapist_licenses
  for each row
  execute function update_updated_at_column();

-- RLS Policies for therapists
alter table therapists enable row level security;

create policy "Public profiles are viewable by everyone"
  on therapists for select
  using (true);

create policy "Service role can modify therapists"
  on therapists for all
  to authenticated
  using (auth.role() = 'service_role');

-- RLS Policies for fees
ALTER TABLE therapist_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view fees"
  ON therapist_fees FOR SELECT
  USING (true);

CREATE POLICY "Service role can modify fees"
  ON therapist_fees FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

-- RLS Policies for licenses
ALTER TABLE therapist_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view licenses"
  ON therapist_licenses FOR SELECT
  USING (true);

CREATE POLICY "Service role can modify licenses"
  ON therapist_licenses FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

-- Allow public access for inserts
create policy "Allow public insert to therapists"
on therapists for insert
to public
with check (true);

-- Allow public access for selects
create policy "Allow public select from therapists"
on therapists for select
to public
using (true);

-- Allow public access for inserts to fees
create policy "Allow public insert to therapist_fees"
on therapist_fees for insert
to public
with check (true);

-- Allow public access for selects from fees
create policy "Allow public select from therapist_fees"
on therapist_fees for select
to public
using (true);

-- Allow public access for licenses
create policy "Allow public insert to therapist_licenses"
on therapist_licenses for insert
to public
with check (true);

create policy "Allow public select from therapist_licenses"
on therapist_licenses for select
to public
using (true);

-- Comments
comment on table therapists is 'Therapist profiles with vector search capabilities';
comment on table therapist_fees is 'Therapist session fees and pricing information';
comment on table therapist_licenses is 'Structured storage for therapist licenses and verification status';
comment on column therapists.embedding is 'Vector embedding of profile text and identity attributes';

-- Add RLS policies for edge function
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edge function can update embeddings"
  ON therapists 
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Edge function can read therapists"
  ON therapists
  FOR SELECT
  USING (true);

CREATE POLICY "Edge function can update licenses"
  ON therapist_licenses 
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Edge function can read licenses"
  ON therapist_licenses
  FOR SELECT
  USING (true);