-- ==============================================================================
-- DEFINITIVE FIX: Super Admin Full Control & Admin Read-Only on Users
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bugvcbkesxjnuunsdjds/sql
-- ==============================================================================

-- 1. Helper function: Check if user is ADMIN or SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
DECLARE
  v_role text;
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT role INTO v_role
  FROM public.users
  WHERE id = user_id
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN UPPER(REPLACE(REPLACE(v_role, ' ', '_'), '-', '_')) IN ('ADMIN', 'SUPER_ADMIN');
END;
$$;

-- Helper function: Check if user is STRICTLY SUPER_ADMIN (for user writes & deletes)
CREATE OR REPLACE FUNCTION public.is_superadmin_only(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
DECLARE
  v_role text;
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT role INTO v_role
  FROM public.users
  WHERE id = user_id
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN UPPER(REPLACE(REPLACE(v_role, ' ', '_'), '-', '_')) IN ('SUPER_ADMIN');
END;
$$;

-- 2. Performance Indexes (instant lookups and fast sorting)
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users (id, role);
CREATE INDEX IF NOT EXISTS idx_attendances_timestamp ON public.attendances (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendances_session_id ON public.attendances (session_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON public.attendances (student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_lecturer_id ON public.sessions (lecturer_id);

-- 3. Clean up and recreate USERS policies
-- Admins can ONLY READ users (administrators, lecturers, finance, students)
-- Only SUPER ADMIN can INSERT, UPDATE, DELETE user accounts
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users;', pol.policyname);
  END LOOP;
END $$;

-- Allow reading user profiles across the app (Admins, Lecturers, Students)
CREATE POLICY "users_read_authenticated"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ONLY Super Admin can manage all user accounts (Create, Edit, Delete)
CREATE POLICY "users_superadmin_all"
ON public.users
FOR ALL
TO authenticated
USING (public.is_superadmin_only(auth.uid()))
WITH CHECK (public.is_superadmin_only(auth.uid()));

-- 4. Clean up and recreate ATTENDANCES policies
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'attendances'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.attendances;', pol.policyname);
  END LOOP;
END $$;

-- Admin & Super Admin full access on attendances
CREATE POLICY "attendances_admin_superadmin_all"
ON public.attendances
FOR ALL
TO authenticated
USING (public.is_admin_or_superadmin(auth.uid()))
WITH CHECK (public.is_admin_or_superadmin(auth.uid()));

-- Students can read their own attendance records
CREATE POLICY "attendances_student_select"
ON public.attendances
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Students can insert their own attendance
CREATE POLICY "attendances_student_insert"
ON public.attendances
FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Lecturers can view attendances for sessions they conduct
CREATE POLICY "attendances_lecturer_select"
ON public.attendances
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = attendances.session_id
      AND s.lecturer_id = auth.uid()
  )
);

-- 5. SESSIONS: Full access for Admin & Super Admin
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'sessions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sessions;', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "sessions_admin_superadmin_all"
ON public.sessions
FOR ALL
TO authenticated
USING (public.is_admin_or_superadmin(auth.uid()))
WITH CHECK (public.is_admin_or_superadmin(auth.uid()));
