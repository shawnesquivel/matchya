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
  id uuid,                -- Column 1
  first_name text,        -- Column 2
  middle_name text,       -- Column 3
  last_name text,         -- Column 4
  pronouns text,          -- Column 5
  bio text,               -- Column 6
  gender text,            -- Column 7
  ethnicity ethnicity_type[], -- Column 8
  sexuality sexuality_type[], -- Column 9
  faith faith_type[],     -- Column 10
  availability text,      -- Column 11
  languages text[],       -- Column 12
  ai_summary text,        -- Column 13
  areas_of_focus text[],  -- Column 14
  approaches jsonb,       -- Column 15
  initial_price text,     -- Column 16
  subsequent_price text,  -- Column 17
  similarity float,       -- Column 18
  profile_img_url text,   -- Column 19
  video_intro_link text,  -- Column 20
  clinic_profile_url text, -- Column 21
  clinic_booking_url text, -- Column 22
  therapist_email text,   -- Column 23
  therapist_phone text,   -- Column 24
  clinic_name text,       -- Column 25
  clinic_street text,     -- Column 26
  clinic_city text,       -- Column 27
  clinic_province text,   -- Column 28
  clinic_postal_code text, -- Column 29
  clinic_country char(2), -- Column 30
  clinic_phone text,      -- Column 31
  education text[],       -- Column 32
  certifications text[],  -- Column 33
  licenses jsonb,         -- Column 34
  is_verified boolean     -- Column 35
) language plpgsql as $$
begin
  return query
  select 
    t.id,                -- Column 1
    t.first_name,        -- Column 2
    t.middle_name,       -- Column 3
    t.last_name,         -- Column 4
    t.pronouns,          -- Column 5
    t.bio,               -- Column 6
    t.gender,            -- Column 7
    t.ethnicity,         -- Column 8
    t.sexuality,         -- Column 9
    t.faith,             -- Column 10
    t.availability,      -- Column 11
    t.languages,         -- Column 12
    t.ai_summary,        -- Column 13
    t.areas_of_focus,    -- Column 14
    t.approaches,        -- Column 15
    case 
      when tf_initial.price is not null then concat('$', tf_initial.price::text, ' ', coalesce(tf_initial.currency, 'USD'))
      else null
    end as initial_price, -- Column 16
    case 
      when tf_subsequent.price is not null then concat('$', tf_subsequent.price::text, ' ', coalesce(tf_subsequent.currency, 'USD'))
      else null
    end as subsequent_price, -- Column 17
    1 - (t.embedding <=> query_embedding) as similarity, -- Column 18
    t.profile_img_url,   -- Column 19
    t.video_intro_link,  -- Column 20
    t.clinic_profile_url, -- Column 21
    t.clinic_booking_url, -- Column 22
    t.therapist_email,   -- Column 23
    t.therapist_phone,   -- Column 24
    t.clinic_name,       -- Column 25
    t.clinic_street,     -- Column 26
    t.clinic_city,       -- Column 27
    t.clinic_province,   -- Column 28
    t.clinic_postal_code, -- Column 29
    t.clinic_country,    -- Column 30
    t.clinic_phone,      -- Column 31
    t.education,         -- Column 32
    t.certifications,    -- Column 33
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', tl.id,
          'license_number', tl.license_number,
          'state', tl.state,
          'title', tl.title,
          'issuing_body', tl.issuing_body,
          'expiry_date', tl.expiry_date,
          'is_verified', tl.is_verified
        )
      )
      from therapist_licenses tl
      where tl.therapist_id = t.id
    ) as licenses,       -- Column 34
    t.is_verified        -- Column 35
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