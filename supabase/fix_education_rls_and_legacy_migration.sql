-- ============================================================
-- Migration: Secure Education RLS Policy & Legacy Record Assignment
-- Run this script in the Supabase SQL Editor.
-- ============================================================

-- 1. Safely assign legacy education records where user_id IS NULL to the primary portfolio owner / admin user.
-- It attempts to find an admin profile first, then any existing profile, then the first auth user.
UPDATE public.education
SET user_id = COALESCE(
  (SELECT id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1),
  (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1),
  (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
)
WHERE user_id IS NULL;

-- 2. Ensure RLS is enabled on the education table
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing education RLS policies
DROP POLICY IF EXISTS "Public read education" ON public.education;
DROP POLICY IF EXISTS "Public can view education" ON public.education;
DROP POLICY IF EXISTS "Users can manage their own education" ON public.education;
DROP POLICY IF EXISTS "User insert education" ON public.education;
DROP POLICY IF EXISTS "User update education" ON public.education;
DROP POLICY IF EXISTS "User delete education" ON public.education;

-- 4. Re-create secure Education RLS policies

-- Public SELECT access for portfolio display
CREATE POLICY "Public read education"
  ON public.education FOR SELECT
  USING (true);

-- Authenticated user INSERT (own records only)
CREATE POLICY "User insert education"
  ON public.education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authenticated user UPDATE (own records only)
CREATE POLICY "User update education"
  ON public.education FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated user DELETE (own records only)
CREATE POLICY "User delete education"
  ON public.education FOR DELETE
  USING (auth.uid() = user_id);
