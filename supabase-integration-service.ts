import { supabase } from '@/lib/supabase'

/**
 * SUPABASE EMAIL INTEGRATION SERVICE
 * Complete service for managing all email operations with Supabase
 */

export interface EmailLog {
  id?: string
  user_id?: string
  email_type: 'signup_confirmation' | 'password_reset' | 'magic_link' | 'email_change' | 'user_invitation' | 'reauthentication'
  recipient_email: string
  sender_email?: string
  subject: string
  status?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  error_message?: string
  metadata?: any
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
}

export interface UserInvitation {
  id?: string
  inviter_id: string
  invitee_email: string
  invitation_token?: string
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
  role?: 'admin' | 'member' | 'viewer'
  team_id?: string
  expires_at?: string
  accepted_at?: string
  accepted_by?: string
  metadata?: any
}

export interface EmailPreferences {
  id?: string
  user_id: string
  signup_confirmations?: boolean
  password_resets?: boolean
  magic_links?: boolean
  email_changes?: boolean
  invitations?: boolean
  reauthentication?: boolean
  marketing_emails?: boolean
  product_updates?: boolean
  security_alerts?: boolean
  email_frequency?: 'immediate' | 'daily' | 'weekly' | 'never'
}

export class SupabaseEmailService {
  
  // ===== EMAIL LOGGING =====
  
  // Log email activity
  static async logEmailActivity(emailLog: EmailLog): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .insert({
          ...emailLog,
          sent_at: emailLog.sent_at || new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Failed to log email activity:', error)
      throw error
    }
  }

  // Get email logs for user
  static async getUserEmailLogs(userId: string, limit = 50): Promise<EmailLog[]> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get email logs:', error)
      return []
    }
  }

  // Update email status (for tracking opens, clicks, etc.)
  static async updateEmailStatus(
    logId: string, 
    status: 'delivered' | 'opened' | 'clicked' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = { status }
      
      switch (status) {
        case 'delivered':
          updateData.delivered_at = new Date().toISOString()
          break
        case 'opened':
          updateData.opened_at = new Date().toISOString()
          break
        case 'clicked':
          updateData.clicked_at = new Date().toISOString()
          break
        case 'failed':
          updateData.error_message = errorMessage
          break
      }

      const { error } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', logId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to update email status:', error)
    }
  }

  // ===== USER INVITATIONS =====
  
  // Create user invitation
  static async createInvitation(invitation: UserInvitation): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_user_invitation', {
        p_inviter_id: invitation.inviter_id,
        p_invitee_email: invitation.invitee_email,
        p_role: invitation.role || 'member',
        p_team_id: invitation.team_id || null
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to create invitation:', error)
      throw error
    }
  }

  // Get user invitations (sent by user)
  static async getUserInvitations(userId: string): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get invitations:', error)
      return []
    }
  }

  // Get invitations for email (received by user)
  static async getInvitationsForEmail(email: string): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('invitee_email', email.toLowerCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get invitations for email:', error)
      return []
    }
  }

  // Accept invitation
  static async acceptInvitation(invitationToken: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        p_invitation_token: invitationToken,
        p_user_id: userId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      return false
    }
  }

  // Cancel invitation
  static async cancelInvitation(invitationId: string, inviterId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('inviter_id', inviterId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      throw error
    }
  }

  // ===== EMAIL PREFERENCES =====
  
  // Get user email preferences
  static async getUserEmailPreferences(userId: string): Promise<EmailPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Failed to get email preferences:', error)
      return null
    }
  }

  // Update user email preferences
  static async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<EmailPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_email_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to update email preferences:', error)
      throw error
    }
  }

  // ===== EMAIL ANALYTICS =====
  
  // Get email statistics
  static async getEmailStatistics(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_statistics')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get email statistics:', error)
      return []
    }
  }

  // Get invitation statistics for user
  static async getInvitationStatistics(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('invitation_statistics')
        .select('*')
        .eq('inviter_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Failed to get invitation statistics:', error)
      return null
    }
  }

  // ===== EMAIL VALIDATION =====
  
  // Check if email preferences allow sending
  static async canSendEmail(userId: string, emailType: string): Promise<boolean> {
    try {
      const preferences = await this.getUserEmailPreferences(userId)
      
      if (!preferences) return true // Default to allowing emails
      
      switch (emailType) {
        case 'signup_confirmation':
          return preferences.signup_confirmations ?? true
        case 'password_reset':
          return preferences.password_resets ?? true
        case 'magic_link':
          return preferences.magic_links ?? true
        case 'email_change':
          return preferences.email_changes ?? true
        case 'user_invitation':
          return preferences.invitations ?? true
        case 'reauthentication':
          return preferences.reauthentication ?? true
        default:
          return true
      }
    } catch (error) {
      console.error('Failed to check email preferences:', error)
      return true // Default to allowing emails
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  // Get email template configuration
  static getEmailTemplateConfig() {
    return {
      confirm_signup: {
        subject: "Welcome to Focus Timer - Confirm Your Email 🎯",
        redirect_to: `${window.location.origin}/confirm-email`
      },
      reset_password: {
        subject: "Reset Your Focus Timer Password 🔒",
        redirect_to: `${window.location.origin}/reset-password`
      },
      magic_link: {
        subject: "Your Focus Timer Magic Link ✨",
        redirect_to: `${window.location.origin}/magic-link`
      },
      email_change: {
        subject: "Confirm Your New Email Address 📧",
        redirect_to: `${window.location.origin}/change-email`
      },
      invite: {
        subject: "You're Invited to Join Focus Timer! 🎯",
        redirect_to: `${window.location.origin}/invite-accept`
      },
      recovery: {
        subject: "Security Verification Required 🔐",
        redirect_to: `${window.location.origin}/dashboard`
      }
    }
  }

  // Validate email template setup
  static async validateEmailSetup(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []
    
    try {
      // Test basic connectivity
      const { error: connectionError } = await supabase.auth.getSession()
      if (connectionError) {
        issues.push('Supabase connection failed')
      }

      // Check if email tables exist
      const { error: tablesError } = await supabase
        .from('email_logs')
        .select('count')
        .limit(1)
      
      if (tablesError) {
        issues.push('Email tables not found - run supabase-email-setup.sql')
      }

      // Check if functions exist
      try {
        await supabase.rpc('log_email_activity', {
          p_user_id: null,
          p_email_type: 'test',
          p_recipient_email: 'test@example.com',
          p_subject: 'Test'
        })
      } catch (error) {
        issues.push('Email functions not found - run supabase-email-setup.sql')
      }

    } catch (error) {
      issues.push(`Setup validation failed: ${error.message}`)
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}

// Export the service
export default SupabaseEmailService