-- Idempotent Migration: Expand education table with detailed academic fields
ALTER TABLE education ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS board_university TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;
ALTER TABLE education ADD COLUMN IF NOT EXISTS result_type TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS result_value TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS max_marks TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS marks_obtained TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS percentage TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS cgpa_gpa TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS rank_distinction TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS relevant_subjects TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS achievements TEXT;
