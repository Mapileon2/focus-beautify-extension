-- Enhanced User Profile System Schema
-- Following SaaS best practices for scalability and security

-- Extend users table with comprehensive profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('private', 'public', 'friends'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Focus Preferences
    preferred_session_length INTEGER DEFAULT 25,
    preferred_break_length INTEGER DEFAULT 5,
    preferred_long_break_length INTEGER DEFAULT 15,
    sessions_before_long_break INTEGER DEFAULT 4,
    auto_start_breaks BOOLEAN DEFAULT false,
    auto_start_sessions BOOLEAN DEFAULT false,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    session_reminders BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    weekly_reports BOOLEAN DEFAULT true,
    break_reminders BOOLEAN DEFAULT true,
    
    -- UI Preferences
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    dashboard_layout JSONB DEFAULT '{}',
    
    -- Privacy Preferences
    profile_public BOOLEAN DEFAULT false,
    show_activity BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    show_statistics BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    
    -- Goal Settings
    daily_focus_goal INTEGER DEFAULT 120, -- minutes
    weekly_focus_goal INTEGER DEFAULT 840, -- minutes
    monthly_focus_goal INTEGER DEFAULT 3600, -- minutes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon TEXT,
    achievement_category TEXT DEFAULT 'general',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    points_awarded INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'custom')),
    goal_name TEXT NOT NULL,
    goal_description TEXT,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'minutes',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Log Table (for analytics and audit)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics Table (for performance optimization)
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Session Statistics
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    total_focus_time INTEGER DEFAULT 0, -- minutes
    total_break_time INTEGER DEFAULT 0, -- minutes
    average_session_length DECIMAL(5,2) DEFAULT 0,
    
    -- Streak Statistics
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    
    -- Achievement Statistics
    total_achievements INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    
    -- Time-based Statistics
    today_focus_time INTEGER DEFAULT 0,
    week_focus_time INTEGER DEFAULT 0,
    month_focus_time INTEGER DEFAULT 0,
    
    -- Last updated timestamp for cache invalidation
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON user_achievements(achievement_category);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id_active ON user_goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id_created_at ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Create updated_at triggers (drop if exists first)
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON user_goals;
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_statistics_updated_at ON user_statistics;
CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- User Preferences Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- User Goals Policies
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- User Activity Log Policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON user_activity_log
    FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- User Statistics Policies
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own statistics" ON user_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics" ON user_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" ON user_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate user level based on experience points
CREATE OR REPLACE FUNCTION calculate_user_level(experience_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level calculation: Level = floor(sqrt(XP / 100)) + 1
    -- This creates a progressive leveling system
    RETURN FLOOR(SQRT(experience_points / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update user statistics (called by triggers)
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user statistics when sessions are completed
    IF TG_TABLE_NAME = 'focus_sessions' AND NEW.completed = true AND OLD.completed = false THEN
        INSERT INTO user_statistics (user_id, total_sessions, completed_sessions, total_focus_time)
        VALUES (NEW.user_id, 1, 1, NEW.duration_minutes)
        ON CONFLICT (user_id) DO UPDATE SET
            total_sessions = user_statistics.total_sessions + 1,
            completed_sessions = user_statistics.completed_sessions + 1,
            total_focus_time = user_statistics.total_focus_time + NEW.duration_minutes,
            last_session_date = CURRENT_DATE,
            last_calculated_at = NOW(),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update statistics
CREATE TRIGGER update_statistics_on_session_complete
    AFTER UPDATE ON focus_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_statistics();

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
CREATE POLICY "Users can view own conversations" ON chat_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON chat_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON chat_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

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

-- Insert default achievements
INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, achievement_category, max_progress, points_awarded)
SELECT 
    u.id,
    'first_session',
    'First Steps',
    'Complete your first focus session',
    '🎯',
    'milestone',
    1,
    10
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = u.id AND ua.achievement_id = 'first_session'
)
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Create function to initialize user profile data
CREATE OR REPLACE FUNCTION initialize_user_profile(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Insert default preferences
    INSERT INTO user_preferences (user_id)
    VALUES (user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert default statistics
    INSERT INTO user_statistics (user_id)
    VALUES (user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log the profile initialization
    INSERT INTO user_activity_log (user_id, activity_type, activity_description)
    VALUES (user_id, 'profile_initialized', 'User profile data initialized');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize profile data for new users
CREATE OR REPLACE FUNCTION initialize_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_user_profile(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_profile_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_new_user_profile();