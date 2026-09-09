-- ==============================================================================
-- Supabase Migration: Class Representatives & Lecturer Attendance
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bugvcbkesxjnuunsdjds/sql
-- ==============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.class_reps (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  -- Only one class rep per course
  CONSTRAINT class_reps_course_id_key UNIQUE (course_id)
);

CREATE TABLE IF NOT EXISTS public.lecturer_attendances (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  marked_by_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date         text        NOT NULL,
  time         text        NOT NULL,
  status       text        NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- ── Performance Indexes ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_class_reps_student_id
  ON public.class_reps (student_id);

CREATE INDEX IF NOT EXISTS idx_class_reps_course_id
  ON public.class_reps (course_id);

CREATE INDEX IF NOT EXISTS idx_lecturer_attendances_course_id
  ON public.lecturer_attendances (course_id);

CREATE INDEX IF NOT EXISTS idx_lecturer_attendances_marked_by_id
  ON public.lecturer_attendances (marked_by_id);

CREATE INDEX IF NOT EXISTS idx_lecturer_attendances_created_at
  ON public.lecturer_attendances (created_at DESC);

-- ── Row Level Security ───────────────────────────────────────────────────────────

ALTER TABLE public.class_reps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_attendances ENABLE ROW LEVEL SECURITY;

-- class_reps: all authenticated users can read; admins/super admins can write
DROP POLICY IF EXISTS "class_reps_select" ON public.class_reps;
CREATE POLICY "class_reps_select" ON public.class_reps
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "class_reps_all" ON public.class_reps;
CREATE POLICY "class_reps_all" ON public.class_reps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- lecturer_attendances: all authenticated users can read; class reps can insert
DROP POLICY IF EXISTS "lecturer_attendances_select" ON public.lecturer_attendances;
CREATE POLICY "lecturer_attendances_select" ON public.lecturer_attendances
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lecturer_attendances_insert" ON public.lecturer_attendances;
CREATE POLICY "lecturer_attendances_insert" ON public.lecturer_attendances
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "lecturer_attendances_all_admin" ON public.lecturer_attendances;
CREATE POLICY "lecturer_attendances_all_admin" ON public.lecturer_attendances
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );
