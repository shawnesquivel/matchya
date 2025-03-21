create schema private;

insert into storage.buckets (id, name)
values ('therapist-photos', 'therapist-photos');

create or replace function private.uuid_or_null(str text)
returns uuid
language plpgsql
as $$
begin
  return str::uuid;
  exception when invalid_text_representation then
    return null;
  end;
$$;

create policy "Authenticated users can upload therapist photos"
on storage.objects for insert to authenticated with check (
  bucket_id = 'therapist-photos' and
  owner = auth.uid() and
  private.uuid_or_null(path_tokens[1]) is not null and
  (metadata->>'size')::int < 5242880 and -- 5MB limit
  (metadata->>'mimetype' like 'image/%') -- Only allow images
);

create policy "Anyone can view therapist photos"
on storage.objects for select using (
  bucket_id = 'therapist-photos'
);

create policy "Service role can update therapist photos"
on storage.objects for update to authenticated with check (
  bucket_id = 'therapist-photos' and
  auth.role() = 'service_role'
);

create policy "Service role can delete therapist photos"
on storage.objects for delete to authenticated using (
  bucket_id = 'therapist-photos' and
  auth.role() = 'service_role'
);