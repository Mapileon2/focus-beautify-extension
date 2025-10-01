-- Focus Timer Extension Database Setup
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_until_long_break INTEGER DEFAULT 4,
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT CHECK (session_type IN ('focus', 'short_break', 'long_break')) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT,
    category TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_created_at ON public.focus_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON public.quotes(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can insert own custom quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update own custom quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete own custom quotes" ON public.quotes;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Focus sessions policies
CREATE POLICY "Users can view own sessions" ON public.focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.focus_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Quotes policies
CREATE POLICY "Users can view all quotes" ON public.quotes
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own custom quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update own custom quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can delete own custom quotes" ON public.quotes
    FOR DELETE USING (auth.uid() = user_id AND is_custom = true);

-- Insert some default motivational quotes
INSERT INTO public.quotes (content, author, category, is_custom) VALUES
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'motivation', false),
('The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.', 'Winston Churchill', 'motivation', false),
('Don''t let yesterday take up too much of today.', 'Will Rogers', 'productivity', false),
('You learn more from failure than from success. Don''t let it stop you. Failure builds character.', 'Unknown', 'motivation', false),
('It''s not whether you get knocked down, it''s whether you get up.', 'Vince Lombardi', 'motivation', false),
('If you are working on something that you really care about, you don''t have to be pushed. The vision pulls you.', 'Steve Jobs', 'productivity', false),
('People who are crazy enough to think they can change the world, are the ones who do.', 'Rob Siltanen', 'motivation', false),
('Failure will never overtake me if my determination to succeed is strong enough.', 'Og Mandino', 'motivation', false),
('We may encounter many defeats but we must not be defeated.', 'Maya Angelou', 'motivation', false),
('Knowing is not enough; we must apply. Wishing is not enough; we must do.', 'Johann Wolfgang Von Goethe', 'productivity', false),
('Imagine your life is perfect in every respect; what would it look like?', 'Brian Tracy', 'focus', false),
('We generate fears while we sit. We overcome them by action.', 'Dr. Henry Link', 'motivation', false),
('What you get by achieving your goals is not as important as what you become by achieving your goals.', 'Henry David Thoreau', 'focus', false),
('Whether you think you can or think you can''t, you''re right.', 'Henry Ford', 'motivation', false),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation', false),
('In the middle of difficulty lies opportunity.', 'Albert Einstein', 'motivation', false),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivation', false),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'motivation', false),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'focus', false),
('Focus on being productive instead of busy.', 'Tim Ferriss', 'productivity', false)
ON CONFLICT DO NOTHING;

-- Note: User profiles will be created automatically when users sign up through the app

-- Success message
SELECT 'Database setup completed successfully! All tables, policies, and sample data have been created.' as message;