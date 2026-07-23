-- Run in Supabase SQL Editor
-- Adds the "mode" column (Regular / Weekend) to the users table

alter table public.users
  add column if not exists mode text check (mode in ('Regular', 'Weekend')) default null;

-- Optional: index if you plan to filter by mode
create index if not exists idx_users_mode on public.users (mode);
