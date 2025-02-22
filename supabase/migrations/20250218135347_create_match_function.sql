create or replace function match_therapists(
  query_embedding vector(384),
  match_threshold float,
  gender_filter text default null,
  sexuality_filter sexuality_type[] default null,
  ethnicity_filter ethnicity_type[] default null,
  faith_filter faith_type[] default null,
  max_price_initial float default null,
  availability_filter text default null
) returns table (
  id uuid,
  first_name text,
  last_name text,
  bio text,
  gender text,
  ai_summary text,
  areas_of_focus text[],
  approaches jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select 
    t.id,
    t.first_name,
    t.last_name,
    t.bio,
    t.gender,
    t.ai_summary,
    t.areas_of_focus,
    t.approaches,
    1 - (t.embedding <=> query_embedding) as similarity
  from therapists t
  where 1 - (t.embedding <=> query_embedding) > match_threshold
    and (gender_filter is null or t.gender = gender_filter)
    and (sexuality_filter is null or t.sexuality && sexuality_filter)
    and (ethnicity_filter is null or t.ethnicity && ethnicity_filter)
    and (faith_filter is null or t.faith && faith_filter)
    and (max_price_initial is null or exists (
      select 1 from therapist_fees tf
      where tf.therapist_id = t.id 
        and tf.session_category = 'initial'
        and tf.price <= max_price_initial
    ))
    and (availability_filter is null or t.availability = availability_filter)
  order by similarity desc;
end;
$$;