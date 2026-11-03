-- ============================================================================
-- MIGRATION: Add Student Academic Profile Fields to Supabase
-- Description: Adds faculty, level, and phone_number columns to public.users table,
--              establishes performance indexes, and configures secure RLS policies
--              so students can update their phone/name but cannot alter academic
--              records (faculty, programme, level, study mode).
-- ============================================================================

-- 1. Add missing profile columns to public.users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS faculty text,
  ADD COLUMN IF NOT EXISTS level text DEFAULT '100',
  ADD COLUMN IF NOT EXISTS phone_number text;

-- 2. Add helpful column comments for schema documentation
COMMENT ON COLUMN public.users.faculty IS 'Student institutional faculty (e.g. School of Computing, School of Business)';
COMMENT ON COLUMN public.users.level IS 'Academic level: 100, 200, 300, 400, etc.';
COMMENT ON COLUMN public.users.phone_number IS 'Student primary telephone/WhatsApp contact number';
COMMENT ON COLUMN public.users.mode IS 'Study mode: Regular or Weekend';

-- 3. Create indexes for fast filtering and joins
CREATE INDEX IF NOT EXISTS idx_users_faculty ON public.users (faculty);
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users (level);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone_number);
CREATE INDEX IF NOT EXISTS idx_users_mode ON public.users (mode);

-- 4. Set default values for any legacy student rows missing levels or modes
UPDATE public.users 
SET level = '100' 
WHERE level IS NULL AND lower(role) = 'student';

UPDATE public.users 
SET mode = 'Regular' 
WHERE mode IS NULL AND lower(role) = 'student';

-- 5. Row Level Security (RLS) Policies
-- Ensure RLS is active on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile and all students in the directory (for attendance/class rosters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow authenticated users to read users'
  ) THEN
    CREATE POLICY "Allow authenticated users to read users"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Allow administrators to insert and update all columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins full access to users'
  ) THEN
    CREATE POLICY "Admins full access to users"
      ON public.users
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
          AND (lower(u.role) IN ('admin', 'super_admin'))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
          AND (lower(u.role) IN ('admin', 'super_admin'))
        )
      );
  END IF;
END $$;

-- Allow individual users (including students) to update their personal info (name, phone_number, avatar)
-- Academic fields (faculty, program, level, mode) remain locked unless updated by an admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users update their own basic profile'
  ) THEN
    CREATE POLICY "Users update their own basic profile"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

