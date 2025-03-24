-- Function to extract domain from URL and insert into image_domains
CREATE OR REPLACE FUNCTION public.extract_and_save_image_domain()
RETURNS TRIGGER AS $$
DECLARE
  domain TEXT;
BEGIN
  -- Only process if profile_img_url exists
  IF NEW.profile_img_url IS NOT NULL THEN
    -- Extract domain from URL
    domain := regexp_replace(
      regexp_replace(NEW.profile_img_url, '^https?://(www\.)?', ''),
      '/.*$', ''
    );
    
    -- Insert domain if it doesn't exist
    IF domain != '' THEN
      INSERT INTO public.image_domains (hostname, protocol)
      VALUES (domain, 'https')
      ON CONFLICT (hostname) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on therapists table
CREATE TRIGGER insert_image_domain_trigger
AFTER INSERT OR UPDATE OF profile_img_url ON public.therapists
FOR EACH ROW
EXECUTE FUNCTION public.extract_and_save_image_domain();