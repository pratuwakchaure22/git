-- Phase 8: Security Audit — Documents Bucket Storage Policies
-- Run this in Supabase SQL Editor.
-- Documents are stored privately; users can only access their own files.

-- ─── Bucket ───────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents',
  'documents',
  false,          -- private: files require auth to access
  52428800        -- 50 MB limit
)
ON CONFLICT (id) DO UPDATE
  SET public          = false,
      file_size_limit = 52428800;

-- ─── Drop any existing loose policies ─────────────────────────────────────────

DROP POLICY IF EXISTS "Documents INSERT — own folder"  ON storage.objects;
DROP POLICY IF EXISTS "Documents SELECT — own folder"  ON storage.objects;
DROP POLICY IF EXISTS "Documents UPDATE — own objects" ON storage.objects;
DROP POLICY IF EXISTS "Documents DELETE — own objects" ON storage.objects;

-- ─── Per-user folder isolation ────────────────────────────────────────────────
-- Upload path MUST be: documents/{auth.uid()}/...  (enforced by Documents.tsx)

-- INSERT: authenticated users may upload only into their own UUID folder
CREATE POLICY "Documents INSERT — own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: authenticated users may view only their own files
CREATE POLICY "Documents SELECT — own folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: only own objects
CREATE POLICY "Documents UPDATE — own objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: only own objects
CREATE POLICY "Documents DELETE — own objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND owner = auth.uid()
  );
