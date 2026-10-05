-- ==============================================================================
-- Fix: Enable Sessions Table RLS Read Access for Authenticated Users
-- ==============================================================================
-- Run this in your Supabase project: https://supabase.com/dashboard
-- Navigate to: SQL Editor → New Query → Paste & Run
-- ==============================================================================

-- 1. Enable RLS on sessions (if not already enabled)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting existing policies on sessions
DROP POLICY IF EXISTS "sessions_read_authenticated" ON public.sessions;
DROP POLICY IF EXISTS "sessions_select_all" ON public.sessions;
DROP POLICY IF EXISTS "sessions_read_all" ON public.sessions;
DROP POLICY IF EXISTS "sessions_select" ON public.sessions;

-- 3. Allow all authenticated users to READ sessions
CREATE POLICY "sessions_read_authenticated"
  ON public.sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Allow lecturers to INSERT their own sessions
DROP POLICY IF EXISTS "sessions_insert_lecturer" ON public.sessions;
CREATE POLICY "sessions_insert_lecturer"
  ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid() = lecturer_id);

-- 5. Allow lecturers to UPDATE their own sessions (e.g. close/deactivate)
DROP POLICY IF EXISTS "sessions_update_lecturer" ON public.sessions;
CREATE POLICY "sessions_update_lecturer"
  ON public.sessions
  FOR UPDATE
  USING (auth.uid() = lecturer_id);

-- 6. Allow lecturers to DELETE their own sessions
DROP POLICY IF EXISTS "sessions_delete_lecturer" ON public.sessions;
CREATE POLICY "sessions_delete_lecturer"
  ON public.sessions
  FOR DELETE
  USING (auth.uid() = lecturer_id);

-- ==============================================================================
-- Also fix attendances RLS (read for authenticated, write for students/lecturers)
-- ==============================================================================

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendances_read_authenticated" ON public.attendances;
CREATE POLICY "attendances_read_authenticated"
  ON public.attendances
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "attendances_insert_student" ON public.attendances;
CREATE POLICY "attendances_insert_student"
  ON public.attendances
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "attendances_update_self" ON public.attendances;
CREATE POLICY "attendances_update_self"
  ON public.attendances
  FOR UPDATE
  USING (auth.uid() = student_id);

-- ==============================================================================
-- Verify: check existing policies after running
-- ==============================================================================
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('sessions', 'attendances')
ORDER BY tablename, cmd;
