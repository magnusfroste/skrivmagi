-- Add join_code column to classes table
ALTER TABLE public.classes 
ADD COLUMN join_code text UNIQUE;

-- Function to generate random 6-character class code
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate random 6-character code (uppercase letters and numbers)
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM classes WHERE join_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Trigger function to auto-generate join_code on insert
CREATE OR REPLACE FUNCTION public.set_class_join_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_set_class_join_code
BEFORE INSERT ON public.classes
FOR EACH ROW
EXECUTE FUNCTION set_class_join_code();

-- Generate codes for existing classes
UPDATE public.classes
SET join_code = generate_class_code()
WHERE join_code IS NULL;