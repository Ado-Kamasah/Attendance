-- Migration: Add mode column to sessions table
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Regular';

-- Optional: backfill existing sessions with 'Regular' (already handled by DEFAULT above)
-- UPDATE sessions SET mode = 'Regular' WHERE mode IS NULL;
