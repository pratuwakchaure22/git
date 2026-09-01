-- ============================================================
-- SERVER-SIDE / SUPABASE-SIDE AUTHORIZED EMAIL RESTRICTION
-- Run this script in the Supabase Dashboard -> SQL Editor.
-- Prevents unauthorized Google/OAuth accounts from creating user rows in auth.users
-- ============================================================

-- 1. Create or replace the validation function
CREATE OR REPLACE FUNCTION public.check_authorized_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  allowed_emails text[] := ARRAY[
    'pratikwakchaure22@gmail.com',
    'wakchaurepratik22@gmail.com',
    'pratik.wakchaure2008@gmail.com',
    'pratik@gmail.com'
  ];
BEGIN
  IF NEW.email IS NULL OR NOT (LOWER(NEW.email) = ANY(allowed_emails)) THEN
    RAISE EXCEPTION 'Access Denied: Email % is not authorized to sign in or create an account on this Personal Hub instance.', NEW.email;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Trigger firing BEFORE INSERT on auth.users (Database-level gatekeeper)
DROP TRIGGER IF EXISTS tr_enforce_authorized_email ON auth.users;
CREATE TRIGGER tr_enforce_authorized_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_authorized_email();

-- 3. Update handle_new_user trigger to also validate authorized email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_emails text[] := ARRAY[
    'pratikwakchaure22@gmail.com',
    'wakchaurepratik22@gmail.com',
    'pratik.wakchaure2008@gmail.com',
    'pratik@gmail.com'
  ];
BEGIN
  IF NEW.email IS NULL OR NOT (LOWER(NEW.email) = ANY(allowed_emails)) THEN
    RAISE EXCEPTION 'Access Denied: Email % is not authorized.', NEW.email;
  END IF;

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

-- ─── VERIFICATION QUERY ──────────────────────────────────────────
-- Confirms the trigger is active on auth.users in Supabase
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  n.nspname AS schema_name,
  'ACTIVE & ENFORCING' AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname = 'tr_enforce_authorized_email';
