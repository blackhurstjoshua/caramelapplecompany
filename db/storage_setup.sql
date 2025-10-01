-- Storage setup for Caramel Apple Company
-- Run this in your Supabase SQL editor

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the images bucket
CREATE POLICY "Anyone can view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated' AND (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'images' AND (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK (bucket_id = 'images' AND (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete images" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin');

-- Create a view for easier image URL generation
CREATE OR REPLACE VIEW public.image_urls AS
SELECT 
  name,
  id,
  CONCAT('https://', current_setting('app.settings.supabase_url', true), '/storage/v1/object/public/images/', name) as url,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'images';

-- Grant access to the view
GRANT SELECT ON public.image_urls TO anon, authenticated;
