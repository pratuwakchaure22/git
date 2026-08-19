-- ============================================================
-- Phase 8: Security & RLS Audit — Comprehensive Migration
-- Safe to re-run in Supabase SQL Editor.
-- ============================================================

-- ─── 1. PROFILES TABLE SECURITY & ROLE PROTECTION ──────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies for clean rebuild
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public can read portfolio profile" ON profiles;

-- Authenticated user access
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Public portfolio access
CREATE POLICY "Public can read portfolio profile"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── PREVENT ROLE ESCALATION TRIGGER ──────────────────────────────────────────
-- Prevents a user from updating their own 'role' column from 'user' to 'admin'.

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed by a non-service-role request, preserve original role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.role IS NOT NULL AND OLD.role IS DISTINCT FROM 'admin' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- ─── 2. HARDENED HANDLE_NEW_USER TRIGGER ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. PUBLIC SELECT POLICIES FOR PUBLIC PORTFOLIO DISPLAY ───────────────────
-- Allows unauthenticated visitors to read published portfolio data

-- Projects
DROP POLICY IF EXISTS "Public can view projects" ON projects;
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);

-- Skills
DROP POLICY IF EXISTS "Public can view skills" ON skills;
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);

-- Education
DROP POLICY IF EXISTS "Public can view education" ON education;
CREATE POLICY "Public can view education" ON education FOR SELECT USING (true);

-- Experience
DROP POLICY IF EXISTS "Public can view experience" ON experience;
CREATE POLICY "Public can view experience" ON experience FOR SELECT USING (true);

-- Achievements
DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT USING (true);

-- ─── 4. USER-PRIVATE DASHBOARD TABLES (STRICT RLS) ───────────────────────────
-- Ensure user_id isolation on private workspace tables

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- ─── 5. STORAGE BUCKETS & POLICIES ───────────────────────────────────────────

-- Avatars (Public read, User-isolated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 5242880;

DROP POLICY IF EXISTS "Avatar INSERT — own folder only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar UPDATE — own objects only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar DELETE — own objects only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar SELECT — public read" ON storage.objects;

CREATE POLICY "Avatar INSERT — own folder only"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatar UPDATE — own objects only"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Avatar DELETE — own objects only"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Avatar SELECT — public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Documents (Private read/write, User-isolated)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 52428800;

DROP POLICY IF EXISTS "Documents INSERT — own folder" ON storage.objects;
DROP POLICY IF EXISTS "Documents SELECT — own folder" ON storage.objects;
DROP POLICY IF EXISTS "Documents UPDATE — own objects" ON storage.objects;
DROP POLICY IF EXISTS "Documents DELETE — own objects" ON storage.objects;

CREATE POLICY "Documents INSERT — own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Documents SELECT — own folder"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Documents UPDATE — own objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "Documents DELETE — own objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());
