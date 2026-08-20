-- ============================================================
-- pg_cron Scheduled Job Setup
-- Run this in Supabase Dashboard → SQL Editor
-- 
-- PREREQUISITES:
--   1. Go to: Supabase Dashboard → Database → Extensions
--   2. Enable: pg_cron
--   3. Enable: pg_net
-- Then run this script.
-- ============================================================

-- Schedule process-notifications to run every 5 minutes
SELECT cron.schedule(
  'process-notifications-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kxmxhexnekyxvkxibvma.supabase.co/functions/v1/process-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bXhoZXhuZWt5eHZreGlidm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5NTMxMiwiZXhwIjoyMTAyNDcxMzEyfQ.ym-qM5WrriyXPKO5c09A8rAHuuN_V1trXgOnBaq8-po'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- To view the schedule:
-- SELECT * FROM cron.job;

-- To remove the schedule (if needed):
-- SELECT cron.unschedule('process-notifications-every-5min');

-- To manually trigger right now (for testing):
-- SELECT net.http_post(
--   url := 'https://kxmxhexnekyxvkxibvma.supabase.co/functions/v1/process-notifications',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bXhoZXhuZWt5eHZreGlidm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5NTMxMiwiZXhwIjoyMTAyNDcxMzEyfQ.ym-qM5WrriyXPKO5c09A8rAHuuN_V1trXgOnBaq8-po'
--   ),
--   body := '{}'::jsonb
-- );
