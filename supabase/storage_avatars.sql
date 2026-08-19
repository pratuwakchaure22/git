-- Phase 8: Security Audit — Avatar Bucket Hardened Policies
-- REPLACE the Phase 7 storage_avatars.sql with this version.
-- Drop old loose policies first, then recreate with owner-scoped rules.

-- ─── Bucket ───────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                         -- public: avatar URLs are intentionally shareable
  5242880,                      -- 5 MB hard limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ─── Drop old loose policies (safe to re-run) ─────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can upload avatars"         ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars"         ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars"                 ON storage.objects;

-- ─── Hardened policies: user can only write inside their own UUID folder ──────
-- Upload path MUST be: avatars/{auth.uid()}/...
-- This is enforced by checking the first path segment = user's UUID.

-- INSERT: only into own subfolder
CREATE POLICY "Avatar INSERT — own folder only"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: only own objects
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

-- DELETE: only own objects
CREATE POLICY "Avatar DELETE — own objects only"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

-- SELECT: public read (avatars are intentionally public for portfolio display)
CREATE POLICY "Avatar SELECT — public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
