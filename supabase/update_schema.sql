-- Update Tasks Table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Fix constraints on tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in-progress', 'completed'));
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('critical', 'high', 'medium', 'low'));

-- Update Notes Table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Update Reminders Table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS repeat TEXT DEFAULT 'none' CHECK (repeat IN ('none', 'daily', 'weekly', 'monthly'));
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'today', 'completed', 'missed'));

-- Update Deadlines Table
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low'));
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS related_project TEXT;
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE deadlines DROP CONSTRAINT IF EXISTS deadlines_status_check;
ALTER TABLE deadlines ADD CONSTRAINT deadlines_status_check CHECK (status IN ('upcoming', 'overdue', 'completed'));

-- Update Documents Table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_access BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
-- We will store size as text (e.g., '2.3 MB') to match frontend, or we can just change type
ALTER TABLE documents ALTER COLUMN size TYPE TEXT USING size::text;
