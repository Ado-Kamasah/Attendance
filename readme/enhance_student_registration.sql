-- ============================================================================
-- Southshore University College: Enhanced Student Registration & Level Selection
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- 1. Ensure level, faculty, mode, and program columns exist in public.users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '100',
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS program TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Regular';

-- 2. Ensure level column supports 100 through 700
DO $$
BEGIN
  -- If there is an existing check constraint on level, drop and recreate it to support 100-700
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_level_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_level_check;
  END IF;

  ALTER TABLE public.users 
    ADD CONSTRAINT users_level_check 
    CHECK (level IN ('100', '200', '300', '400', '500', '600', '700'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- 3. Create or update trigger function to populate public.users from auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_id_number TEXT;
  v_faculty TEXT;
  v_program TEXT;
  v_level TEXT;
  v_mode TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Student');
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_id_number := COALESCE(NEW.raw_user_meta_data->>'id_number', NULL);
  v_faculty := COALESCE(NEW.raw_user_meta_data->>'faculty', NULL);
  v_program := COALESCE(NEW.raw_user_meta_data->>'program', NULL);
  v_level := COALESCE(NEW.raw_user_meta_data->>'level', '100');
  v_mode := COALESCE(NEW.raw_user_meta_data->>'mode', 'Regular');

  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    id_number,
    faculty,
    program,
    level,
    mode,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    LOWER(NEW.email),
    v_name,
    v_role,
    v_id_number,
    v_faculty,
    v_program,
    v_level,
    v_mode,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    id_number = COALESCE(EXCLUDED.id_number, public.users.id_number),
    faculty = COALESCE(EXCLUDED.faculty, public.users.faculty),
    program = COALESCE(EXCLUDED.program, public.users.program),
    level = COALESCE(EXCLUDED.level, public.users.level),
    mode = COALESCE(EXCLUDED.mode, public.users.mode),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for fast level and mode lookups
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_mode ON public.users(mode);
CREATE INDEX IF NOT EXISTS idx_users_program ON public.users(program);

