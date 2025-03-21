CREATE OR REPLACE FUNCTION get_therapist_info_v2(p_first_name TEXT, p_last_name TEXT)
RETURNS TEXT AS $$
DECLARE
    therapist_info TEXT;
    license_info TEXT;
    fee_info TEXT;
BEGIN
    -- Lookup Therapist
    SELECT STRING_AGG(ROW_TO_JSON(t)::TEXT, ', ')
    INTO therapist_info
    FROM therapists t
    WHERE LOWER(t.first_name) = LOWER(p_first_name) AND LOWER(t.last_name) = LOWER(p_last_name);

    -- License information
    SELECT STRING_AGG(ROW_TO_JSON(l)::TEXT, ', ')
    INTO license_info
    FROM therapist_licenses l
    JOIN therapists t ON l.therapist_id = t.id
    WHERE LOWER(t.first_name) = LOWER(p_first_name) AND LOWER(t.last_name) = LOWER(p_last_name);

    -- Fee information
    SELECT STRING_AGG(ROW_TO_JSON(f)::TEXT, ', ')
    INTO fee_info
    FROM therapist_fees f
    JOIN therapists t ON f.therapist_id = t.id
    WHERE LOWER(t.first_name) = LOWER(p_first_name) AND LOWER(t.last_name) = LOWER(p_last_name);

    -- Combine all results into a single string
    RETURN 'Therapist Info: [' || COALESCE(therapist_info, 'No therapist found') || '], ' ||
           'License Info: [' || COALESCE(license_info, 'No licenses found') || '], ' ||
           'Fee Info: [' || COALESCE(fee_info, 'No fees found') || ']';
END;
$$ LANGUAGE plpgsql;