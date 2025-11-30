-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'parent');

-- Create user_roles table (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    class_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    teacher_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Add foreign key for profiles.class_id
ALTER TABLE public.profiles ADD CONSTRAINT profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- Create kort_kategori enum
CREATE TYPE public.kort_kategori AS ENUM ('karaktar', 'plats', 'tid', 'kansla', 'problem');

-- Create kort table (story cards)
CREATE TABLE public.kort (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategori kort_kategori NOT NULL,
    text TEXT NOT NULL,
    bild_prompt TEXT NOT NULL,
    niva INTEGER NOT NULL DEFAULT 1 CHECK (niva >= 1 AND niva <= 3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kort ENABLE ROW LEVEL SECURITY;

-- Create saga_status enum
CREATE TYPE public.saga_status AS ENUM ('draft', 'finished');

-- Create sagor table (stories)
CREATE TABLE public.sagor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Min saga',
    student_id UUID NOT NULL,
    inledning_text TEXT,
    huvuddel_text TEXT,
    avslutning_text TEXT,
    bild_inledning TEXT,
    bild_huvuddel TEXT,
    bild_avslutning TEXT,
    audio_elevenlabs_url TEXT,
    audio_elevens_egen_url TEXT,
    status saga_status NOT NULL DEFAULT 'draft',
    lage TEXT NOT NULL DEFAULT 'pussel',
    teacher_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sagor ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view students in their class"
ON public.profiles FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'teacher') AND
    class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
);

-- RLS Policies for classes
CREATE POLICY "Teachers can manage own classes"
ON public.classes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Students can view their class"
ON public.classes FOR SELECT
TO authenticated
USING (id IN (SELECT class_id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for kort (public read)
CREATE POLICY "Anyone can view kort"
ON public.kort FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for sagor
CREATE POLICY "Students can manage own sagor"
ON public.sagor FOR ALL
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view students sagor"
ON public.sagor FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'teacher') AND
    student_id IN (
        SELECT user_id FROM public.profiles 
        WHERE class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    )
);

CREATE POLICY "Teachers can update student sagor comments"
ON public.sagor FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'teacher') AND
    student_id IN (
        SELECT user_id FROM public.profiles 
        WHERE class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    )
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'name', 'Användare'),
        NEW.email
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student')
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sagor_updated_at
    BEFORE UPDATE ON public.sagor
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();