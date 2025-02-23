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
  ethnicity ethnicity_type[],
  sexuality sexuality_type[],
  faith faith_type[],
  availability text,
  languages text[],
  ai_summary text,
  areas_of_focus text[],
  approaches jsonb,
  initial_price text,
  subsequent_price text,
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
    t.ethnicity,
    t.sexuality,
    t.faith,
    t.availability,
    t.languages,
    t.ai_summary,
    t.areas_of_focus,
    t.approaches,
    case 
      when tf_initial.price is not null then concat('$', tf_initial.price::text, ' ', coalesce(tf_initial.currency, 'USD'))
      else null
    end as initial_price,
    case 
      when tf_subsequent.price is not null then concat('$', tf_subsequent.price::text, ' ', coalesce(tf_subsequent.currency, 'USD'))
      else null
    end as subsequent_price,
    1 - (t.embedding <=> query_embedding) as similarity
  from therapists t
  left join therapist_fees tf_initial on tf_initial.therapist_id = t.id 
    and tf_initial.session_category = 'initial'
    and tf_initial.session_type = 'individual'
  left join therapist_fees tf_subsequent on tf_subsequent.therapist_id = t.id 
    and tf_subsequent.session_category = 'subsequent'
    and tf_subsequent.session_type = 'individual'
  where 1 - (t.embedding <=> query_embedding) > match_threshold
    and (gender_filter is null or t.gender = gender_filter)
    and (sexuality_filter is null or t.sexuality && sexuality_filter)
    and (ethnicity_filter is null or t.ethnicity && ethnicity_filter)
    and (faith_filter is null or t.faith && faith_filter)
    and (max_price_initial is null or tf_initial.price <= max_price_initial)
    and (availability_filter is null or t.availability = availability_filter)
  order by similarity desc;
end;
$$;