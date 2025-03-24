-- Create table for storing allowed image domains
CREATE TABLE IF NOT EXISTS public.image_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname TEXT NOT NULL UNIQUE,
  protocol TEXT NOT NULL DEFAULT 'https',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.image_domains ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all users" ON public.image_domains
  FOR SELECT USING (true);

-- Admins only can insert/update/delete
CREATE POLICY "Allow admin insert access" ON public.image_domains
  FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  
CREATE POLICY "Allow admin update access" ON public.image_domains
  FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
  
CREATE POLICY "Allow admin delete access" ON public.image_domains
  FOR DELETE TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to get all active domains
CREATE OR REPLACE FUNCTION public.get_active_image_domains()
RETURNS TABLE (hostname TEXT, protocol TEXT) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT hostname, protocol FROM public.image_domains WHERE is_active = true;
$$;

-- Add initial data from our existing domains
INSERT INTO public.image_domains (hostname, protocol)
VALUES
  ('assets-jane-cac1-20.janeapp.net', 'https'),
  ('assets-jane-cac1-21.janeapp.net', 'https'),
  ('www.peak-resilience.com', 'https'),
  ('assets-jane-cac1-22.janeapp.net', 'https'),
  ('assets-jane-cac1-23.janeapp.net', 'https'),
  ('assets-jane-cac1-24.janeapp.net', 'https'),
  ('randomuser.me', 'https'),
  ('images.unsplash.com', 'https'),
  ('thrivedowntown.com', 'https'),
  ('static.wixstatic.com', 'https'),
  ('openspacecounselling.ca', 'https'),
  ('skylarkclinic.ca', 'https'),
  ('lotustherapy.ca', 'https'),
  ('blueskywellnessclinic.ca', 'https'),
  ('www.blueskywellnessclinic.ca', 'https'),
  ('ayoua.com', 'https'),
  ('eastvancouvercounselling.ca', 'https'),
  ('arccounselling.ca', 'https'),
  ('clearheartcounselling.com', 'https'),
  ('gatherandground.ca', 'https'),
  ('chromacounselling.ca', 'https'),
  ('wellspringcounselling.ca', 'https'),
  ('fieldworkcounselling.ca', 'https'),
  ('freemindtherapy.ca', 'https'),
  ('providencetherapybc.com', 'https'),
  ('vancouvercounsellingclinic.ca', 'https'),
  ('jerichocounselling.com', 'https'),
  ('benchmarkcounselling.com', 'https'),
  ('richmondcounselling.com', 'https'),
  ('panoramawellness.ca', 'https'),
  ('cdn.prod.website-files.com', 'https'),
  ('abbotsford.skylarkclinic.ca', 'https'),
  ('cdn-hhfkf.nitrocdn.com', 'https'),
  ('images.squarespace-cdn.com', 'https'),
  ('repiphany.com', 'https'),
  ('vancouvercounsellingclinic.com', 'https'),
  ('hippo-ai-public-assets.s3.us-east-1.amazonaws.com', 'https'),
  ('mlddlxmupu0y.i.optimole.com', 'https')
ON CONFLICT (hostname) DO NOTHING;