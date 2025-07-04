-- ------------------------------------------------------------------
--  Phase 1: Step 1 - Foundational Backend & Data Persistence
--  - Create a profiles table to sync with Clerk users.
--  - Link existing lotus_sessions to the new profiles table.
-- ------------------------------------------------------------------

-- 1. Create the profiles table
-- This table will be populated by a webhook from Clerk upon user creation.
create table public.profiles (
  id text not null primary key, -- Corresponds to Clerk's user.id
  email text,
  first_name text,
  last_name text,
  
  -- Application-specific data
  voice_tokens_remaining integer not null default 3,
  has_passed_safety_assessment boolean not null default false,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

comment on table public.profiles is 'User profile data synced from Clerk and app-specific metadata.';
comment on column public.profiles.id is 'Clerk User ID.';


-- 2. Add a user_id foreign key to the lotus_sessions table
alter table public.lotus_sessions
add column user_id text references public.profiles(id) on delete cascade;

-- We will make this `not null` in a subsequent migration after
-- ensuring all existing sessions (if any) are associated with a user.
-- For a new setup, this is the safest approach.
alter table public.lotus_sessions
alter column user_id set not null;

-- Add an index for faster lookups of a user's sessions
create index lotus_sessions_user_id_idx
  on public.lotus_sessions(user_id); 