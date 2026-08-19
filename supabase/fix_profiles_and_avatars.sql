-- ============================================================
-- Complete Fix Migration: Profiles Table & Avatar Storage RLS
-- Run this script in the Supabase SQL Editor to ensure all table
-- columns, RLS policies, and storage settings are configured.
-- ============================================================

-- 1. Ensure Profiles Table Columns Exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles RLS Policies (SELECT, INSERT, UPDATE)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public can read portfolio profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

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

-- Prevent regular users from promoting themselves to 'admin'
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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


-- 4. Create Public Avatars Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. Storage RLS Policies for Avatars Bucket
DROP POLICY IF EXISTS "Avatar INSERT — own folder only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar UPDATE — own objects only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar DELETE — own objects only" ON storage.objects;
DROP POLICY IF EXISTS "Avatar SELECT — public read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;

CREATE POLICY "Avatar INSERT — own folder only"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatar UPDATE — own objects only"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatar DELETE — own objects only"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

CREATE POLICY "Avatar SELECT — public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
