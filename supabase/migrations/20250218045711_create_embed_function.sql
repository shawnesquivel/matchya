create function private.embed()
returns trigger
language plpgsql
as $$
declare
  content_column text = TG_ARGV[0];
  embedding_column text = TG_ARGV[1];
  batch_size int = case when array_length(TG_ARGV, 1) >= 3 then TG_ARGV[2]::int else 5 end;
  timeout_milliseconds int = case when array_length(TG_ARGV, 1) >= 4 then TG_ARGV[3]::int else 5 * 60 * 1000 end;
  batch_count int = ceiling((select count(*) from inserted) / batch_size::float);
begin
  -- Loop through each batch and invoke edge function
  for i in 0 .. (batch_count-1) loop
  perform
    net.http_post(
      url := 'http://host.docker.internal:54321/functions/v1/embed',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'ids', (select json_agg(ds.id) from (select id from inserted limit batch_size offset i*batch_size) ds),
        'table', TG_TABLE_NAME,
        'contentColumn', content_column,
        'embeddingColumn', embedding_column
      ),
      timeout_milliseconds := timeout_milliseconds
    );
  end loop;

  return null;
end;
$$;

-- Update therapists table to use correct vector dimensions
ALTER TABLE therapists 
  ALTER COLUMN embedding TYPE vector(1536); -- OpenAI text-embedding-3-small outputs 1536 dimensions

-- Trigger only for inserts
create trigger embed_therapist_profiles
  after insert on therapists
  referencing new table as inserted
  for each statement
  execute procedure private.embed('bio', 'embedding');