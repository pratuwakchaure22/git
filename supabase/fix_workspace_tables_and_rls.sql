-- Comprehensive Workspace Database Schema & RLS Migration Script
-- Run this in Supabase Dashboard → SQL Editor

-- 1. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    due_date TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE tasks ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE tasks ALTER COLUMN priority TYPE TEXT USING priority::text;

-- 2. DEADLINES TABLE
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'upcoming',
    related_project TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE deadlines ALTER COLUMN date TYPE TEXT USING date::text;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE deadlines ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS related_project TEXT;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 3. DEDICATED IMPORTANT TABLE
CREATE TABLE IF NOT EXISTS important (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'information',
    value TEXT,
    tags TEXT[] DEFAULT '{}',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE important ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE important ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'information';
ALTER TABLE important ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE important ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE important ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- 4. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    size INTEGER,
    type TEXT,
    category TEXT DEFAULT 'other',
    tags TEXT[] DEFAULT '{}',
    ai_access BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_access BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE important ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- User Isolation Policies
-- Tasks
DROP POLICY IF EXISTS "User manage tasks" ON tasks;
CREATE POLICY "User manage tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Deadlines
DROP POLICY IF EXISTS "User manage deadlines" ON deadlines;
CREATE POLICY "User manage deadlines" ON deadlines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Important
DROP POLICY IF EXISTS "User manage important" ON important;
CREATE POLICY "User manage important" ON important FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Documents DB Table
DROP POLICY IF EXISTS "User manage documents" ON documents;
CREATE POLICY "User manage documents" ON documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
