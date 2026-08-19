-- ============================================================
-- AI Tables Migration — Phase 6
-- Safe to re-run. Tears down old objects first, then rebuilds.
-- Relationship model:
--   auth.users
--       ↓  (user_id)
--   ai_conversations
--       ↓  (conversation_id)
--   ai_messages          ← NO user_id here; ownership is via conversation
-- ============================================================

-- 1. Drop dependent objects in reverse order
DROP TRIGGER  IF EXISTS on_message_insert       ON ai_messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

DROP POLICY IF EXISTS "Users manage own messages"      ON ai_messages;
DROP POLICY IF EXISTS "Users manage own conversations" ON ai_conversations;

DROP TABLE IF EXISTS ai_messages      CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;

-- ============================================================
-- 2. Create tables
-- ============================================================

-- ai_conversations: one row per conversation, owned by a user
CREATE TABLE ai_conversations (
  id         UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL    REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT         NOT NULL    DEFAULT 'New conversation',
  created_at TIMESTAMPTZ              DEFAULT NOW(),
  updated_at TIMESTAMPTZ              DEFAULT NOW()
);

-- ai_messages: messages belonging to a conversation.
-- Ownership is inferred via ai_conversations.user_id — no duplicate user_id here.
CREATE TABLE ai_messages (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 3. Row Level Security
-- ============================================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages      ENABLE ROW LEVEL SECURITY;

-- Conversations: direct user_id match
CREATE POLICY "Users manage own conversations"
  ON ai_conversations FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Messages: authorized through parent conversation ownership
-- (no user_id column on ai_messages — go through the JOIN)
CREATE POLICY "Users manage own messages"
  ON ai_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM   ai_conversations c
      WHERE  c.id      = ai_messages.conversation_id
        AND  c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM   ai_conversations c
      WHERE  c.id      = ai_messages.conversation_id
        AND  c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. Trigger — keep ai_conversations.updated_at current
-- ============================================================

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_conversations
  SET    updated_at = NOW()
  WHERE  id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
