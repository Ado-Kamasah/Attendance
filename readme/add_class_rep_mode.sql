-- ==============================================================================
-- Migration: Add study_mode to class_reps table for Independent Regular & Weekend Class Reps
-- Run this in your Supabase SQL Editor: (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add study_mode column (and "mode" column for backwards compatibility)
ALTER TABLE public.class_reps
  ADD COLUMN IF NOT EXISTS study_mode TEXT CHECK (study_mode IN ('Regular', 'Weekend')) DEFAULT 'Regular';

-- Ensure existing rows have 'Regular'
UPDATE public.class_reps
  SET study_mode = 'Regular'
  WHERE study_mode IS NULL;

-- 2. Drop the old single unique constraint on course_id so Regular & Weekend reps can coexist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.class_reps'::regclass
          AND contype = 'u'
          AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.class_reps'::regclass AND attname = 'course_id')]
    ) LOOP
        EXECUTE 'ALTER TABLE public.class_reps DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Drop old index if it exists independently
DROP INDEX IF EXISTS class_reps_course_id_key;
DROP INDEX IF EXISTS class_reps_course_id_unique;

-- 3. Create new compound unique index on (course_id, study_mode)
-- This guarantees ONE Regular Class Rep and ONE Weekend Class Rep per course
CREATE UNIQUE INDEX IF NOT EXISTS class_reps_course_id_study_mode_key
  ON public.class_reps (course_id, study_mode);

-- 4. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_class_reps_student_mode
  ON public.class_reps (student_id, study_mode);

-- 5. Enable RLS and verify policies
ALTER TABLE public.class_reps ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view class reps
DROP POLICY IF EXISTS "Allow authenticated users to read class reps" ON public.class_reps;
CREATE POLICY "Allow authenticated users to read class reps"
  ON public.class_reps FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins and lecturers to insert/update/delete class reps
DROP POLICY IF EXISTS "Allow staff to insert class reps" ON public.class_reps;
CREATE POLICY "Allow staff to insert class reps"
  ON public.class_reps FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff to delete class reps" ON public.class_reps;
CREATE POLICY "Allow staff to delete class reps"
  ON public.class_reps FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow staff to update class reps" ON public.class_reps;
CREATE POLICY "Allow staff to update class reps"
  ON public.class_reps FOR UPDATE
  TO authenticated
  USING (true);

