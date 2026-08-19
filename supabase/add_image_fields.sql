-- Add missing columns to achievements and projects tables.
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses ADD COLUMN IF NOT EXISTS).

-- Achievements: image_url, organization, position
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS position     TEXT;

-- Projects: image_url already exists in schema.sql.
-- Add start_date as TEXT so users can enter "2024", "Jan 2024", etc.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date TEXT;
