-- =====================================================
-- SUPABASE EMAIL SERVICES SETUP SCRIPT
-- Complete database setup for Focus Timer email services
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- EMAIL TRACKING TABLES
-- =====================================================

-- Email logs table to track all email activities
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL CHECK (email_type IN (
        'signup_confirmation',
        'password_reset', 
        'magic_link',
        'email_change',
        'user_invitation',
        'reauthentication'
    )),
    recipient_email TEXT NOT NULL,
    sender_email TEXT DEFAULT 'noreply@focustimer.app',
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invitee_email TEXT NOT NULL,
    invitation_token UUID DEFAULT uuid_generate_v4(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    team_id UUID, -- For future team functionality
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email preferences table
CREATE TABLE IF NOT EXISTS user_email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    signup_confirmations BOOLEAN DEFAULT true,
    password_resets BOOLEAN DEFAULT true,
    magic_links BOOLEAN DEFAULT true,
    email_changes BOOLEAN DEFAULT true,
    invitations BOOLEAN DEFAULT true,
    reauthentication BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    product_updates BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_invitations_inviter ON user_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires ON user_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON user_email_preferences(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- Email logs policies
CREATE POLICY "Users can view own email logs" ON email_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email logs" ON email_logs
    FOR ALL USING (auth.role() = 'service_role');

-- User invitations policies
CREATE POLICY "Users can view invitations they sent" ON user_invitations
    FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can view invitations sent to them" ON user_invitations
    FOR SELECT USING (auth.email() = invitee_email);

CREATE POLICY "Users can create invitations" ON user_invitations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations they sent" ON user_invitations
    FOR UPDATE USING (auth.uid() = inviter_id);

CREATE POLICY "Service role can manage invitations" ON user_invitations
    FOR ALL USING (auth.role() = 'service_role');

-- Email preferences policies
CREATE POLICY "Users can view own email preferences" ON user_email_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences" ON user_email_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences" ON user_email_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR EMAIL OPERATIONS
-- =====================================================

-- Function to log email activities
CREATE OR REPLACE FUNCTION log_email_activity(
    p_user_id UUID,
    p_email_type TEXT,
    p_recipient_email TEXT,
    p_subject TEXT,
    p_status TEXT DEFAULT 'sent',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO email_logs (
        user_id,
        email_type,
        recipient_email,
        subject,
        status,
        metadata
    ) VALUES (
        p_user_id,
        p_email_type,
        p_recipient_email,
        p_subject,
        p_status,
        p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function to create user invitation
CREATE OR REPLACE FUNCTION create_user_invitation(
    p_inviter_id UUID,
    p_invitee_email TEXT,
    p_role TEXT DEFAULT 'member',
    p_team_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_id UUID;
    invitation_token UUID;
BEGIN
    -- Generate unique invitation token
    invitation_token := uuid_generate_v4();
    
    -- Create invitation record
    INSERT INTO user_invitations (
        inviter_id,
        invitee_email,
        invitation_token,
        role,
        team_id
    ) VALUES (
        p_inviter_id,
        p_invitee_email,
        invitation_token,
        p_role,
        p_team_id
    ) RETURNING id INTO invitation_id;
    
    -- Log the invitation email
    PERFORM log_email_activity(
        p_inviter_id,
        'user_invitation',
        p_invitee_email,
        'You''re invited to join Focus Timer!',
        'sent',
        jsonb_build_object('invitation_id', invitation_id, 'token', invitation_token)
    );
    
    RETURN invitation_id;
END;
$$;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(
    p_invitation_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM user_invitations
    WHERE invitation_token = p_invitation_token
    AND status = 'pending'
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update invitation status
    UPDATE user_invitations
    SET 
        status = 'accepted',
        accepted_at = NOW(),
        accepted_by = p_user_id,
        updated_at = NOW()
    WHERE id = invitation_record.id;
    
    -- Log the acceptance
    PERFORM log_email_activity(
        p_user_id,
        'user_invitation',
        invitation_record.invitee_email,
        'Invitation accepted',
        'delivered',
        jsonb_build_object('invitation_id', invitation_record.id, 'action', 'accepted')
    );
    
    RETURN TRUE;
END;
$$;

-- Function to initialize user email preferences
CREATE OR REPLACE FUNCTION initialize_user_email_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_email_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to initialize email preferences for new users
CREATE OR REPLACE TRIGGER trigger_initialize_email_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_email_preferences();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_user_invitations_updated_at
    BEFORE UPDATE ON user_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_email_preferences_updated_at
    BEFORE UPDATE ON user_email_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR EMAIL ANALYTICS
-- =====================================================

-- Email statistics view
CREATE OR REPLACE VIEW email_statistics AS
SELECT 
    email_type,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    ROUND(
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as delivery_rate,
    ROUND(
        COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) * 100, 2
    ) as open_rate,
    ROUND(
        COUNT(CASE WHEN status = 'clicked' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN status = 'opened' THEN 1 END), 0) * 100, 2
    ) as click_rate
FROM email_logs
GROUP BY email_type;

-- User invitation statistics view
CREATE OR REPLACE VIEW invitation_statistics AS
SELECT 
    inviter_id,
    COUNT(*) as total_invitations,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
    COUNT(CASE WHEN status = 'pending' AND expires_at > NOW() THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'expired' OR expires_at <= NOW() THEN 1 END) as expired,
    ROUND(
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as acceptance_rate
FROM user_invitations
GROUP BY inviter_id;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample email preferences for existing users
-- INSERT INTO user_email_preferences (user_id)
-- SELECT id FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_email_preferences TO authenticated;

-- Grant permissions on views
GRANT SELECT ON email_statistics TO authenticated;
GRANT SELECT ON invitation_statistics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_email_activity TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION accept_invitation TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Supabase Email Services Setup Complete!';
    RAISE NOTICE 'Tables created: email_logs, user_invitations, user_email_preferences';
    RAISE NOTICE 'Functions created: log_email_activity, create_user_invitation, accept_invitation';
    RAISE NOTICE 'Views created: email_statistics, invitation_statistics';
    RAISE NOTICE 'RLS policies enabled for security';
    RAISE NOTICE 'Ready to configure email templates in Supabase Dashboard!';
END $$;