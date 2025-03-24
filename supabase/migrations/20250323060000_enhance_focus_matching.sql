-- Enhance the match_therapists function to improve area_of_focus matching
CREATE OR REPLACE FUNCTION match_therapists(
  query_embedding vector(1536),
  match_threshold float,
  gender_filter text default null,
  sexuality_filter sexuality_type[] default null,
  ethnicity_filter ethnicity_type[] default null,
  faith_filter faith_type[] default null,
  max_price_initial float default null,
  availability_filter text default null,
  areas_of_focus_filter text[] default null,
  clinic_city_param text default null,
  clinic_province_param text default null
) returns table (
  id uuid,
  first_name text,
  middle_name text,
  last_name text,
  pronouns text,
  bio text,
  gender text,
  ethnicity ethnicity_type[],
  sexuality sexuality_type[],
  faith faith_type[],
  availability text,
  languages text[],
  ai_summary text,
  areas_of_focus text[],
  approaches text[],
  initial_price text,
  subsequent_price text,
  similarity float,
  profile_img_url text,
  video_intro_link text,
  clinic_profile_url text,
  clinic_booking_url text,
  therapist_email text,
  therapist_phone text,
  clinic_name text,
  clinic_street text,
  clinic_city text,
  clinic_province text,
  clinic_postal_code text,
  clinic_country char(2),
  clinic_phone text,
  education text[],
  certifications text[],
  licenses jsonb,
  is_verified boolean
) language plpgsql as $$
begin
  return query
  WITH filtered_therapists AS (
    select 
      t.id,
      t.first_name,
      t.middle_name,
      t.last_name,
      t.pronouns::text,
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
      1 - (t.embedding <=> query_embedding) as similarity,
      t.profile_img_url,
      t.video_intro_link,
      t.clinic_profile_url,
      t.clinic_booking_url,
      t.therapist_email,
      t.therapist_phone,
      t.clinic_name,
      t.clinic_street,
      t.clinic_city,
      t.clinic_province,
      t.clinic_postal_code,
      t.clinic_country,
      t.clinic_phone,
      t.education,
      t.certifications,
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
      ) as licenses,
      t.is_verified
    from therapists t
    left join lateral (
      select price, currency
      from therapist_fees
      where therapist_id = t.id 
        and session_category = 'initial'
        and session_type = 'individual'
      limit 1
    ) tf_initial on true
    left join lateral (
      select price, currency
      from therapist_fees
      where therapist_id = t.id 
        and session_category = 'subsequent'
        and session_type = 'individual'
      limit 1
    ) tf_subsequent on true
    where 1 - (t.embedding <=> query_embedding) > match_threshold
      and (gender_filter is null or t.gender = gender_filter)
      and (sexuality_filter is null or t.sexuality && sexuality_filter)
      and (ethnicity_filter is null or t.ethnicity && ethnicity_filter)
      and (faith_filter is null or t.faith && faith_filter)
      and (
        max_price_initial is null 
        or exists (
          select 1 from therapist_fees 
          where therapist_id = t.id 
            and session_category = 'initial' 
            and price <= max_price_initial
        )
      )
      and (availability_filter is null or t.availability = availability_filter)
      and (
        areas_of_focus_filter is null 
        or 
        (
          case when areas_of_focus_filter is not null then
            exists (
              select 1
              from unnest(t.areas_of_focus) as t_area,
                   unnest(areas_of_focus_filter) as f_area
              where 
                -- Current matching (substring with case insensitivity)
                lower(t_area) like '%' || lower(f_area) || '%'
                -- Add word boundary matching for better precision with acronyms
                or t_area ~* ('(^|\s)' || regexp_replace(f_area, '\+', '\\\+') || '($|\s|\W)')
                -- Special case for LGBTQ+ variations
                or (
                  lower(f_area) = 'lgbtq' AND 
                  (
                    lower(t_area) ~* 'lgbtq[a-z0-9\+]*' OR
                    lower(t_area) ~* '2slgbtq[a-z0-9\+]*' OR
                    lower(t_area) ~ 'two.?spirit'
                  )
                )
                -- Handle Non-Binary variations
                or (
                  lower(f_area) = 'non-binary' AND
                  (
                    lower(t_area) ~ 'non.?binary' OR
                    lower(t_area) = 'nb' OR
                    lower(t_area) ~ 'gender.?non.?conforming' OR
                    lower(t_area) = 'gnc'
                  )
                )
                -- Specific case for QTBIPOC
                or (
                  (lower(f_area) = 'lgbtq' OR lower(f_area) = 'qtbipoc') AND
                  lower(t_area) ~* '.*qtbipoc.*'
                )
                -- Fallback exact matches
                or t_area = f_area
                or t_area = initcap(f_area)
            )
          else true
          end
        )
      )
      and (
        (clinic_city_param is null or t.clinic_city = clinic_city_param)
        and
        (clinic_province_param is null or t.clinic_province = clinic_province_param)
      )
  )
  
  SELECT DISTINCT ON (id) *
  FROM filtered_therapists
  ORDER BY id, similarity DESC;
end;
$$;

-- Add comment to explain the enhanced function
COMMENT ON FUNCTION match_therapists(vector(1536), float, text, sexuality_type[], ethnicity_type[], faith_type[], float, text, text[], text, text) 
IS 'Matches therapists based on embedding similarity and enhanced filtering, including improved LGBTQ+ and terminology matching'; 