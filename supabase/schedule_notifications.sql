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
      'Authorization', 'Bearer <YOUR_SUPABASE_SERVICE_ROLE_KEY>'
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
--     'Authorization', 'Bearer <YOUR_SUPABASE_SERVICE_ROLE_KEY>'
--   ),
--   body := '{}'::jsonb
-- );
