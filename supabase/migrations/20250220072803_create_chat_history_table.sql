-- WARNING: This is a simple public access implementation.
-- TODO: Consider implementing rate limiting (Option 4) before production:
-- 1. Add IP-based rate limiting to prevent abuse
-- 2. Add request counting and time windows
-- 3. Implement exponential backoff for repeated requests
-- This is especially important for AI-powered chat systems where
-- each request costs money and could be exploited.

create table if not exists public.chat_history (
  id bigint generated always as identity primary key,
  chat_id text not null,
  message text not null,
  source text not null check (source in ('USER', 'OPENAI')),
  user_id uuid references auth.users (id),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_history enable row level security;

-- Allow anyone to insert messages
-- Anonymous users can only insert with null user_id
-- Authenticated users can only insert with their own user_id
create policy "Public can insert chat messages"
on public.chat_history for insert
to public
with check (
  (auth.uid() is null and user_id is null) or
  (auth.uid() = user_id)
);

-- Anyone can read messages
-- This is fine since chat history is meant to be public
create policy "Public can view chat messages"
on public.chat_history for select
to public
using (true);

-- Add helpful comments
comment on table public.chat_history is 'Stores chat messages between users and AI';
comment on column public.chat_history.chat_id is 'Groups messages into conversations';
comment on column public.chat_history.source is 'Origin of message - either USER or OPENAI';
comment on column public.chat_history.user_id is 'Optional link to authenticated user';