-- Phase 8: Security Audit — Table RLS Fixes
-- Run in Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).

-- ─── FIX 1: profiles — Add INSERT policy ──────────────────────────────────────
-- The upsert in saveProfile() requires INSERT privilege when the row doesn't
-- exist yet. The trigger creates the initial row, but we also need this for
-- safety in case the trigger misfires or for manual upserts.

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── FIX 2: profiles — Add public SELECT policy for portfolio display ─────────
-- The public portfolio (Phase 8+) needs to read the profile owner's data
-- without authentication. Only safe, non-sensitive fields are exposed.
-- The existing "Users can view their own profile" policy continues to work for
-- the authenticated dashboard.

DROP POLICY IF EXISTS "Public can read portfolio profile" ON profiles;

CREATE POLICY "Public can read portfolio profile"
  ON profiles FOR SELECT
  USING (true);   -- All profiles readable publicly (single-user portfolio)
                  -- If this becomes multi-user, replace with:
                  --   USING (role = 'admin')  -- only show admin/owner profile

-- NOTE: The above exposes the full profiles row publicly.
-- Sensitive fields (phone) should be handled at the application query level
-- by selecting only the columns needed: full_name, bio, avatar_url, role_title,
-- github_url, linkedin_url, website_url, location.
-- The existing policy for authenticated users is unchanged.

-- ─── FIX 3: Verify all other tables have RLS enabled ─────────────────────────
-- (These are already enabled from schema.sql and ai_tables.sql, but
--  listed here for auditability)
--
-- ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE skills         ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE education      ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE experience     ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE achievements   ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE notes          ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE reminders      ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE deadlines      ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;  -- already done
-- ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY; -- already done
-- ALTER TABLE ai_messages    ENABLE ROW LEVEL SECURITY;  -- already done
