alter table public.chat_history add column model text; -- Store which AI model was used
comment on column public.chat_history.model is 'AI model used for response (e.g., GPT-4o, Claude)';

alter table public.chat_history add column feedback smallint; -- For future thumbs up/down (-1, 0, 1)
comment on column public.chat_history.feedback is 'User feedback on message (-1=negative, 1=positive)';

alter table public.chat_history add column metadata jsonb default '{}'; -- For flexible storage of additional data
comment on column public.chat_history.metadata is 'Flexible JSON storage for additional data like therapist recommendations';

create index chat_history_chat_id_idx on public.chat_history(chat_id);
