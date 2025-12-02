-- Create app_settings table for configuration
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Set default image provider
INSERT INTO public.app_settings (key, value) VALUES ('image_provider', 'dalle3');

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON public.app_settings
FOR SELECT USING (true);

-- No one can update via normal queries (only via edge function)
CREATE POLICY "No direct updates" ON public.app_settings
FOR UPDATE USING (false);

-- No one can insert via normal queries
CREATE POLICY "No direct inserts" ON public.app_settings
FOR INSERT WITH CHECK (false);

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();