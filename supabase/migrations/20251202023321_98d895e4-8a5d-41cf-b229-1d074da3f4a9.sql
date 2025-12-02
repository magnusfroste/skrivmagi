-- Add public sharing columns to sagor table
ALTER TABLE public.sagor ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.sagor ADD COLUMN IF NOT EXISTS share_slug text UNIQUE;
ALTER TABLE public.sagor ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0;

-- Create saga_upvotes table for tracking votes
CREATE TABLE IF NOT EXISTS public.saga_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id uuid REFERENCES public.sagor(id) ON DELETE CASCADE NOT NULL,
  voter_identifier text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(saga_id, voter_identifier)
);

-- Enable RLS on saga_upvotes
ALTER TABLE public.saga_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can view upvotes
CREATE POLICY "Anyone can view upvotes"
ON public.saga_upvotes FOR SELECT
USING (true);

-- Authenticated users can insert upvotes
CREATE POLICY "Users can insert upvotes"
ON public.saga_upvotes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes"
ON public.saga_upvotes FOR DELETE
TO authenticated
USING (true);

-- Anyone can view public sagor
CREATE POLICY "Anyone can view public sagor"
ON public.sagor FOR SELECT
USING (is_public = true OR student_id = auth.uid() OR public.has_role(auth.uid(), 'teacher'::app_role));

-- Create storage buckets for saga images and audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('saga-bilder', 'saga-bilder', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('saga-ljud', 'saga-ljud', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for saga-bilder bucket
CREATE POLICY "Public can view saga images"
ON storage.objects FOR SELECT
USING (bucket_id = 'saga-bilder');

CREATE POLICY "Authenticated users can upload saga images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'saga-bilder');

CREATE POLICY "Users can update their saga images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'saga-bilder');

CREATE POLICY "Users can delete their saga images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'saga-bilder');

-- Storage policies for saga-ljud bucket
CREATE POLICY "Public can view saga audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'saga-ljud');

CREATE POLICY "Authenticated users can upload saga audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'saga-ljud');

CREATE POLICY "Users can update their saga audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'saga-ljud');

CREATE POLICY "Users can delete their saga audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'saga-ljud');