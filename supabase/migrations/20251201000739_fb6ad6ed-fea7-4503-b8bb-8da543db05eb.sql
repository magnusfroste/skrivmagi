-- Create helper functions to break circular RLS references

-- Function to get a user's class_id
CREATE OR REPLACE FUNCTION public.get_user_class_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT class_id FROM profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get a teacher's class IDs
CREATE OR REPLACE FUNCTION public.get_teacher_class_ids(_teacher_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM classes WHERE teacher_id = _teacher_id
$$;

-- Function to get student user_ids in a teacher's classes
CREATE OR REPLACE FUNCTION public.get_students_in_teacher_classes(_teacher_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.user_id 
  FROM profiles p
  INNER JOIN classes c ON p.class_id = c.id
  WHERE c.teacher_id = _teacher_id
$$;

-- Update classes policies
DROP POLICY IF EXISTS "Students can view their class" ON classes;
CREATE POLICY "Students can view their class"
ON classes FOR SELECT
TO authenticated
USING (id = public.get_user_class_id(auth.uid()));

-- Update profiles policies
DROP POLICY IF EXISTS "Teachers can view students in their class" ON profiles;
CREATE POLICY "Teachers can view students in their class"
ON profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::app_role) 
  AND class_id IN (SELECT public.get_teacher_class_ids(auth.uid()))
);

-- Update sagor policies
DROP POLICY IF EXISTS "Teachers can view students sagor" ON sagor;
DROP POLICY IF EXISTS "Teachers can update student sagor comments" ON sagor;

CREATE POLICY "Teachers can view students sagor"
ON sagor FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::app_role) 
  AND student_id IN (SELECT public.get_students_in_teacher_classes(auth.uid()))
);

CREATE POLICY "Teachers can update student sagor comments"
ON sagor FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::app_role) 
  AND student_id IN (SELECT public.get_students_in_teacher_classes(auth.uid()))
);