-- ============================================================
-- Notification System Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  entity_id TEXT,
  entity_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
CREATE POLICY "Users manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(user_id, entity_id, type, created_at);

-- 2. PUSH_SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role read push subscriptions" ON push_subscriptions;
CREATE POLICY "Service role read push subscriptions" ON push_subscriptions
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);

-- 3. NOTIFICATION_PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  in_app BOOLEAN DEFAULT TRUE,
  browser_push BOOLEAN DEFAULT FALSE,
  deadline_alerts BOOLEAN DEFAULT TRUE,
  reminder_alerts BOOLEAN DEFAULT TRUE,
  task_alerts BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notification prefs" ON notification_preferences;
CREATE POLICY "Users manage own notification prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role read notification prefs" ON notification_preferences;
CREATE POLICY "Service role read notification prefs" ON notification_preferences
  FOR SELECT USING (true);
