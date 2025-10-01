-- Chat History Migration Script
-- This script safely adds chat functionality to existing database

-- AI Chat History Tables
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    summary TEXT,
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'suggestion', 'tip', 'encouragement')),
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_active ON chat_conversations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(conversation_id, created_at ASC);

-- Create updated_at trigger for conversations
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for chat tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Conversations Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON chat_conversations;
CREATE POLICY "Users can view own conversations" ON chat_conversations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON chat_conversations;
CREATE POLICY "Users can insert own conversations" ON chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON chat_conversations;
CREATE POLICY "Users can update own conversations" ON chat_conversations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON chat_conversations;
CREATE POLICY "Users can delete own conversations" ON chat_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
CREATE POLICY "Users can insert own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON chat_messages;
CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation metadata
    UPDATE chat_conversations 
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    -- Generate conversation title if it's the first user message and no title exists
    IF NEW.sender = 'user' THEN
        UPDATE chat_conversations 
        SET title = CASE 
            WHEN title IS NULL OR title = '' THEN 
                CASE 
                    WHEN LENGTH(NEW.content) > 50 THEN LEFT(NEW.content, 47) || '...'
                    ELSE NEW.content
                END
            ELSE title
        END
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation metadata
DROP TRIGGER IF EXISTS update_conversation_on_message_trigger ON chat_messages;
CREATE TRIGGER update_conversation_on_message_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Function to create a new conversation
CREATE OR REPLACE FUNCTION create_chat_conversation(p_user_id UUID, p_title TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO chat_conversations (user_id, title)
    VALUES (p_user_id, p_title)
    RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create active conversation
CREATE OR REPLACE FUNCTION get_or_create_active_conversation(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Try to get the most recent active conversation
    SELECT id INTO conversation_id
    FROM chat_conversations
    WHERE user_id = p_user_id AND is_active = true
    ORDER BY last_message_at DESC
    LIMIT 1;
    
    -- If no active conversation exists, create one
    IF conversation_id IS NULL THEN
        conversation_id := create_chat_conversation(p_user_id);
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;