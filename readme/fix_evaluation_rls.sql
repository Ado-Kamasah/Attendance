-- Run in Supabase SQL Editor to fix evaluation RLS policies

-- Drop the restrictive student-only policy that blocks admins from reading evaluations
drop policy if exists "students own evaluations" on evaluations;

-- Students: can INSERT their own evaluations and SELECT their own
create policy "students can insert own evaluations" on evaluations
  for insert with check (auth.uid() = student_id);

create policy "students can read own evaluations" on evaluations
  for select using (auth.uid() = student_id);

-- Admins (and anyone authenticated): can read ALL evaluations for the admin dashboard
-- Note: tighten this with a role check if you add row-level roles to auth metadata
create policy "authenticated users can read all evaluations" on evaluations
  for select using (auth.role() = 'authenticated');
