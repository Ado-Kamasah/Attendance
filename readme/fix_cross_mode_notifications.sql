-- ==============================================================================
-- Migration: Strictly Separate Regular and Weekend Attendance Notifications
-- ==============================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Navigate to: SQL Editor ➔ New Query ➔ Paste & Run
-- ==============================================================================

-- 1. Ensure 'student_notifications' table exists with all required fields
CREATE TABLE IF NOT EXISTS public.student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  mode TEXT DEFAULT 'Regular',
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure 'session_id' column exists if table was already created
ALTER TABLE public.student_notifications
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE;

-- Ensure 'mode' column exists with validation
ALTER TABLE public.student_notifications
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Regular';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_notifications_mode_check'
  ) THEN
    ALTER TABLE public.student_notifications
      ADD CONSTRAINT student_notifications_mode_check CHECK (mode IN ('Regular', 'Weekend'));
  END IF;
END $$;

-- 2. Backfill existing notifications with accurate study mode
UPDATE public.student_notifications sn
SET mode = s.mode
FROM public.sessions s
WHERE sn.session_id = s.id AND (sn.mode IS NULL OR sn.mode = '');

UPDATE public.student_notifications sn
SET mode = u.mode
FROM public.users u
WHERE sn.student_id = u.id AND (sn.mode IS NULL OR sn.mode = '');

-- 3. Create high-performance indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_student_notifications_student ON public.student_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_session ON public.student_notifications(session_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_mode ON public.student_notifications(mode);
CREATE INDEX IF NOT EXISTS idx_student_notifications_course ON public.student_notifications(course_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_created ON public.student_notifications(created_at DESC);

-- 4. Enable Row Level Security and configure access policies
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Students can only read notifications intended for their account
DROP POLICY IF EXISTS "student_notifications_select" ON public.student_notifications;
CREATE POLICY "student_notifications_select"
  ON public.student_notifications
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'LECTURER')
    )
  );

-- INSERT: Authenticated users and automated system can insert notifications
DROP POLICY IF EXISTS "student_notifications_insert" ON public.student_notifications;
CREATE POLICY "student_notifications_insert"
  ON public.student_notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Students can mark their own notifications as read
DROP POLICY IF EXISTS "student_notifications_update" ON public.student_notifications;
CREATE POLICY "student_notifications_update"
  ON public.student_notifications
  FOR UPDATE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- DELETE: Students and Administrators can delete notifications
DROP POLICY IF EXISTS "student_notifications_delete" ON public.student_notifications;
CREATE POLICY "student_notifications_delete"
  ON public.student_notifications
  FOR DELETE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 5. Database Trigger: Enforce study-mode validation on notifications
CREATE OR REPLACE FUNCTION public.check_notification_mode_match()
RETURNS TRIGGER AS $$
DECLARE
  v_student_mode TEXT;
  v_session_mode TEXT;
BEGIN
  -- Lookup student's current study mode
  SELECT mode INTO v_student_mode FROM public.users WHERE id = NEW.student_id;
  
  -- If session_id is provided, lookup session's study mode
  IF NEW.session_id IS NOT NULL THEN
    SELECT mode INTO v_session_mode FROM public.sessions WHERE id = NEW.session_id;
    
    IF v_session_mode IS NOT NULL AND v_student_mode IS NOT NULL THEN
      -- Strictly block cross-mode notification creation
      IF LOWER(TRIM(v_session_mode)) <> LOWER(TRIM(v_student_mode)) THEN
        RAISE WARNING 'Cross-mode notification blocked: student % (%) cannot receive notification for % session %',
          NEW.student_id, v_student_mode, v_session_mode, NEW.session_id;
        RETURN NULL; -- Cancel insertion cleanly
      END IF;
    END IF;

    IF NEW.mode IS NULL AND v_session_mode IS NOT NULL THEN
      NEW.mode := v_session_mode;
    END IF;
  END IF;

  IF NEW.mode IS NULL AND v_student_mode IS NOT NULL THEN
    NEW.mode := v_student_mode;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_notification_mode_match ON public.student_notifications;
CREATE TRIGGER trg_check_notification_mode_match
  BEFORE INSERT ON public.student_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_notification_mode_match();

-- 6. Database Trigger: Prevent cross-mode attendance insertions
CREATE OR REPLACE FUNCTION public.check_attendance_mode_match()
RETURNS TRIGGER AS $$
DECLARE
  v_student_mode TEXT;
  v_session_mode TEXT;
BEGIN
  SELECT mode INTO v_student_mode FROM public.users WHERE id = NEW.student_id;
  SELECT mode INTO v_session_mode FROM public.sessions WHERE id = NEW.session_id;

  IF v_session_mode IS NOT NULL AND v_student_mode IS NOT NULL THEN
    IF LOWER(TRIM(v_session_mode)) <> LOWER(TRIM(v_student_mode)) THEN
      RAISE EXCEPTION 'Cross-mode attendance violation: Student % (study mode: %) cannot be marked in % session %',
        NEW.student_id, v_student_mode, v_session_mode, NEW.session_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_attendance_mode_match ON public.attendances;
CREATE TRIGGER trg_check_attendance_mode_match
  BEFORE INSERT OR UPDATE ON public.attendances
  FOR EACH ROW
  EXECUTE FUNCTION public.check_attendance_mode_match();

