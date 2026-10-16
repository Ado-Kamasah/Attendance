-- Migration: Add delivery_mode and online_link columns to schedules table
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'Face-to-Face',
  ADD COLUMN IF NOT EXISTS online_link   TEXT DEFAULT '';

-- Backfill existing rows so they show as Face-to-Face (DEFAULT above handles new rows)
UPDATE schedules
  SET delivery_mode = 'Face-to-Face'
WHERE delivery_mode IS NULL;
