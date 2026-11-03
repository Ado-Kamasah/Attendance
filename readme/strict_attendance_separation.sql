-- ==============================================================================
-- Migration: Strictly Separate Regular and Weekend Attendance Sessions
-- ==============================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Navigate to: SQL Editor ➔ New Query ➔ Paste & Run
-- ==============================================================================

-- 1. Ensure 'mode' column exists on sessions table with validation
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Regular';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sessions_mode_check'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_mode_check CHECK (mode IN ('Regular', 'Weekend'));
  END IF;
END $$;

-- Backfill any sessions that have NULL mode
UPDATE public.sessions
SET mode = 'Regular'
WHERE mode IS NULL;

-- 2. Ensure unique constraint on attendances (session_id, student_id)
-- This strictly prevents duplicate attendance records for the same student in a session
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendances_session_student_unique'
  ) THEN
    ALTER TABLE public.attendances
      ADD CONSTRAINT attendances_session_student_unique UNIQUE (session_id, student_id);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- 3. Ensure 'mode' column exists on users table (Regular or Weekend)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Regular';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_mode_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_mode_check CHECK (mode IN ('Regular', 'Weekend'));
  END IF;
END $$;

-- Backfill any student users with NULL mode
UPDATE public.users
SET mode = 'Regular'
WHERE mode IS NULL;

-- 4. Enable Row Level Security and configure access policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Sessions SELECT: All authenticated users can read sessions
DROP POLICY IF EXISTS "sessions_read_authenticated" ON public.sessions;
CREATE POLICY "sessions_read_authenticated"
  ON public.sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sessions INSERT: Authenticated users (e.g. Lecturers / Admins) can create sessions
DROP POLICY IF EXISTS "sessions_insert_authenticated" ON public.sessions;
CREATE POLICY "sessions_insert_authenticated"
  ON public.sessions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Sessions UPDATE: Authenticated users can update sessions
DROP POLICY IF EXISTS "sessions_update_authenticated" ON public.sessions;
CREATE POLICY "sessions_update_authenticated"
  ON public.sessions
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Attendances SELECT: All authenticated users can read attendance records
DROP POLICY IF EXISTS "attendances_read_authenticated" ON public.attendances;
CREATE POLICY "attendances_read_authenticated"
  ON public.attendances
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Attendances INSERT/UPSERT: Authenticated users can record attendance
DROP POLICY IF EXISTS "attendances_insert_authenticated" ON public.attendances;
CREATE POLICY "attendances_insert_authenticated"
  ON public.attendances
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Attendances UPDATE: Authenticated users can update attendance records
DROP POLICY IF EXISTS "attendances_update_authenticated" ON public.attendances;
CREATE POLICY "attendances_update_authenticated"
  ON public.attendances
  FOR UPDATE
  USING (auth.role() = 'authenticated');

