-- Run in Supabase SQL Editor

-- Stores per-student evaluation submissions
create table if not exists evaluations (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references users(id) on delete cascade,
  lecturer_id   uuid not null references users(id) on delete cascade,
  course_id     uuid not null references courses(id) on delete cascade,
  semester      text not null default '',
  responses     jsonb not null default '{}',   -- { q1: 'Excellent', q2: 'Always', ... }
  comments      text default '',               -- Q17 open text
  submitted_at  timestamptz not null default now(),
  unique (student_id, lecturer_id, course_id, semester)
);

-- Stores admin-controlled open/closed toggle per semester
create table if not exists evaluation_settings (
  id          uuid primary key default gen_random_uuid(),
  semester    text not null unique,
  is_open     boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references users(id)
);

-- Insert a default row so settings always exist
insert into evaluation_settings (semester, is_open)
values ('Current', false)
on conflict (semester) do nothing;

-- RLS: students can only see/insert their own evaluations
alter table evaluations enable row level security;
create policy "students own evaluations" on evaluations
  for all using (auth.uid() = student_id);

alter table evaluation_settings enable row level security;
create policy "anyone can read settings" on evaluation_settings
  for select using (true);
create policy "admins can update settings" on evaluation_settings
  for update using (true);   -- tighten with role check if needed
