-- ─────────────────────────────────────────────────────────────────────────────
-- password_reset_otps
-- Stores one OTP row per email for the forgot-password flow.
-- Run this once in the Supabase SQL editor (or as a migration).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.password_reset_otps (
  email                    text        primary key,
  otp                      text        not null,
  attempts                 int         not null default 0,
  expires_at               timestamptz not null,
  verified_at              timestamptz,
  reset_token              text,
  reset_token_expires_at   timestamptz,
  created_at               timestamptz not null default now()
);

-- Only the service-role key (used by the OTP server) should write to this table.
-- The frontend anon key must not be able to read or write it.
alter table public.password_reset_otps enable row level security;

-- No RLS policies → anon / authenticated users cannot access it at all.
-- The server uses the service-role key which bypasses RLS.

-- Optional: auto-purge rows older than 24 h (keeps the table tiny).
-- Enable pg_cron in Supabase Dashboard → Extensions first, then run:
-- select cron.schedule(
--   'purge-password-reset-otps',
--   '0 * * * *',   -- every hour
--   $$delete from public.password_reset_otps where created_at < now() - interval '24 hours'$$
-- );
