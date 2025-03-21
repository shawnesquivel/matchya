-- Video platform and type enums
CREATE TYPE video_platform AS ENUM ('instagram', 'youtube');
CREATE TYPE video_type AS ENUM ('intro', 'faq', 'testimonial');

-- Main videos table
CREATE TABLE therapist_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Core video data
  url text NOT NULL CHECK (url ~ '^https?://.*$'), -- URL validation
  platform video_platform NOT NULL,
  type video_type NOT NULL,
  
  -- Metadata
  title text,
  description text,
  
  -- Display options
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,

  -- Integrity constraint to ensure valid platform URLs
  CONSTRAINT valid_platform_url CHECK (
    (platform = 'youtube' AND url ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/).+$') OR
    (platform = 'instagram' AND url ~ '^https?://(www\.)?instagram\.com/.+$')
  )
);

-- Add updated_at trigger
CREATE TRIGGER therapist_videos_updated_at
  BEFORE UPDATE ON therapist_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE therapist_videos ENABLE ROW LEVEL SECURITY;

-- Public can view all videos
CREATE POLICY "Public can view therapist videos"
  ON therapist_videos FOR SELECT
  USING (true);

-- Only service role can modify videos (will expand with auth later)
CREATE POLICY "Service role can modify therapist videos"
  ON therapist_videos FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role');

-- Allow public access for selects
CREATE POLICY "Allow public select from therapist_videos"
  ON therapist_videos FOR SELECT
  TO public
  USING (true);

-- Indexes for performance
CREATE INDEX idx_therapist_videos_therapist_id ON therapist_videos(therapist_id);
CREATE INDEX idx_therapist_videos_type_platform ON therapist_videos(type, platform);

-- Comments
COMMENT ON TABLE therapist_videos IS 'Therapist video content for profiles';
COMMENT ON COLUMN therapist_videos.type IS 'Video category (intro, faq, testimonial)';
COMMENT ON COLUMN therapist_videos.platform IS 'Video hosting platform (instagram, youtube)';
COMMENT ON COLUMN therapist_videos.display_order IS 'Sequence for display order, lower numbers first'; 