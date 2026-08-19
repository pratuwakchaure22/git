-- Portfolio Images Storage Bucket + RLS Policies
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- Stores project images (userId/projects/) and achievement images (userId/achievements/).
-- Bucket is public: image URLs are intentionally shareable for portfolio display.
-- Safe to re-run (uses ON CONFLICT / DROP IF EXISTS).

-- ─── Bucket ───────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,   -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = true,
      file_size_limit    = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ─── Drop old policies (safe to re-run) ──────────────────────────────────────

DROP POLICY IF EXISTS "Portfolio Images INSERT - own folder"  ON storage.objects;
DROP POLICY IF EXISTS "Portfolio Images SELECT - public read" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio Images UPDATE - own objects" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio Images DELETE - own objects" ON storage.objects;

-- ─── Policies ─────────────────────────────────────────────────────────────────
-- Upload path MUST be: portfolio-images/{auth.uid()}/...

CREATE POLICY "Portfolio Images INSERT - own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Portfolio Images SELECT - public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Portfolio Images UPDATE - own objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Portfolio Images DELETE - own objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND owner = auth.uid()
  );
