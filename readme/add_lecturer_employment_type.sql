-- Run in Supabase SQL Editor
-- Adds the "employment_type" column (Full-Time / Part-Time) to the users table
-- Enables Admin and Finance to designate lecturers as Part-Time or Full-Time

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('Full-Time', 'Part-Time')) DEFAULT 'Full-Time';

-- Optional: index for fast filtering and finance claims lookups
CREATE INDEX IF NOT EXISTS idx_users_employment_type ON public.users (employment_type);

-- Default all existing lecturers to Full-Time if null
UPDATE public.users
SET employment_type = 'Full-Time'
WHERE role = 'Lecturer' AND employment_type IS NULL;
