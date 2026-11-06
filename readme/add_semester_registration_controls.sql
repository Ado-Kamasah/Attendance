-- Run in Supabase SQL Editor
-- Adds registration_open and registration_deadline to public.semesters

ALTER TABLE public.semesters
  ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ DEFAULT NULL;

-- Optional index
CREATE INDEX IF NOT EXISTS idx_semesters_registration_open ON public.semesters (registration_open);

