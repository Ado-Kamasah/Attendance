-- ==============================================================================
-- Supabase Migration: Suggestion Box
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bugvcbkesxjnuunsdjds/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.suggestions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  category     text        NOT NULL CHECK (category IN ('complaint', 'suggestion', 'feedback', 'other')),
  subject      text        NOT NULL,
  message      text        NOT NULL,
  is_anonymous boolean     NOT NULL DEFAULT false,
  status       text        NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'reviewed', 'resolved')),
  admin_note   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Index for fast queries per user and by status
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id    ON public.suggestions (user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status     ON public.suggestions (status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.suggestions (created_at DESC);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS suggestions_set_updated_at ON public.suggestions;
CREATE TRIGGER suggestions_set_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Students/users: can INSERT their own submissions
DROP POLICY IF EXISTS "suggestions_insert" ON public.suggestions;
CREATE POLICY "suggestions_insert" ON public.suggestions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Students/users: can SELECT their own submissions (by user_id)
DROP POLICY IF EXISTS "suggestions_select_own" ON public.suggestions;
CREATE POLICY "suggestions_select_own" ON public.suggestions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin/Super Admin: full access to all submissions
DROP POLICY IF EXISTS "suggestions_admin_all" ON public.suggestions;
CREATE POLICY "suggestions_admin_all" ON public.suggestions
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );
