-- Complete Database Schema & RLS Fix Script
-- Run this in Supabase Dashboard → SQL Editor

-- 1. EDUCATION TABLE
ALTER TABLE education ALTER COLUMN start_date TYPE TEXT USING start_date::text;
ALTER TABLE education ALTER COLUMN end_date TYPE TEXT USING end_date::text;

-- 2. EXPERIENCE TABLE
ALTER TABLE experience ALTER COLUMN start_date TYPE TEXT USING start_date::text;
ALTER TABLE experience ALTER COLUMN end_date TYPE TEXT USING end_date::text;

-- 3. ACHIEVEMENTS TABLE
ALTER TABLE achievements ALTER COLUMN date TYPE TEXT USING date::text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS position TEXT;

-- 4. PROJECTS TABLE
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 5. NOTES TABLE
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 6. REMINDERS TABLE
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE reminders ALTER COLUMN time TYPE TEXT USING time::text;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS repeat TEXT DEFAULT 'none';
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';

-- 7. PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable RLS
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Portfolio Display
DROP POLICY IF EXISTS "Public read education" ON education;
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read experience" ON experience;
CREATE POLICY "Public read experience" ON experience FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read skills" ON skills;
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read achievements" ON achievements;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

-- User CRUD Policies (INSERT, UPDATE, DELETE)
-- Education
DROP POLICY IF EXISTS "User insert education" ON education;
CREATE POLICY "User insert education" ON education FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User update education" ON education;
CREATE POLICY "User update education" ON education FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User delete education" ON education;
CREATE POLICY "User delete education" ON education FOR DELETE USING (auth.uid() = user_id);

-- Experience
DROP POLICY IF EXISTS "User insert experience" ON experience;
CREATE POLICY "User insert experience" ON experience FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User update experience" ON experience;
CREATE POLICY "User update experience" ON experience FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User delete experience" ON experience;
CREATE POLICY "User delete experience" ON experience FOR DELETE USING (auth.uid() = user_id);

-- Skills
DROP POLICY IF EXISTS "User insert skills" ON skills;
CREATE POLICY "User insert skills" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User update skills" ON skills;
CREATE POLICY "User update skills" ON skills FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User delete skills" ON skills;
CREATE POLICY "User delete skills" ON skills FOR DELETE USING (auth.uid() = user_id);

-- Projects
DROP POLICY IF EXISTS "User insert projects" ON projects;
CREATE POLICY "User insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User update projects" ON projects;
CREATE POLICY "User update projects" ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User delete projects" ON projects;
CREATE POLICY "User delete projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "User insert achievements" ON achievements;
CREATE POLICY "User insert achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User update achievements" ON achievements;
CREATE POLICY "User update achievements" ON achievements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User delete achievements" ON achievements;
CREATE POLICY "User delete achievements" ON achievements FOR DELETE USING (auth.uid() = user_id);

-- Notes
DROP POLICY IF EXISTS "User manage notes" ON notes;
CREATE POLICY "User manage notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reminders
DROP POLICY IF EXISTS "User manage reminders" ON reminders;
CREATE POLICY "User manage reminders" ON reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
