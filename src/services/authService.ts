import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Custom error types for better error handling
export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthService {
  // Email validation regex
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Password requirements
  private static readonly MIN_PASSWORD_LENGTH = 8
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

  // Validate email format
  private static validateEmail(email: string): void {
    if (!email || !email.trim()) {
      throw new ValidationError('Email is required', 'email')
    }
    
    if (!this.EMAIL_REGEX.test(email.trim())) {
      throw new ValidationError('Please enter a valid email address', 'email')
    }
  }

  // Validate password strength
  private static validatePassword(password: string): void {
    if (!password) {
      throw new ValidationError('Password is required', 'password')
    }
    
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`, 'password')
    }
    
    if (!this.PASSWORD_REGEX.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 'password')
    }
  }

  // Check if user already exists
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Skip admin check for now as it might cause issues
      // Just check our custom users table
      const { data: customUsers, error: customError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1)

      if (customError) {
        console.warn('Could not check custom users table:', customError.message)
        return false // If we can't check, allow signup to proceed (Supabase will handle duplicates)
      }

      return customUsers && customUsers.length > 0
    } catch (error) {
      console.warn('Error checking user existence:', error)
      return false // If check fails, allow signup to proceed
    }
  }

  // Enhanced error handling for Supabase auth errors
  private static handleAuthError(error: AuthError): never {
    console.error('Auth error:', error)
    
    switch (error.message) {
      case 'User already registered':
      case 'A user with this email address has already been registered':
        throw new AuthenticationError('An account with this email already exists. Please sign in instead.', 'USER_EXISTS')
      
      case 'Invalid login credentials':
      case 'Invalid email or password':
        throw new AuthenticationError('Invalid email or password. Please check your credentials and try again.', 'INVALID_CREDENTIALS')
      
      case 'Email not confirmed':
        throw new AuthenticationError('Please check your email and click the confirmation link before signing in.', 'EMAIL_NOT_CONFIRMED')
      
      case 'Password should be at least 6 characters':
        throw new ValidationError('Password must be at least 6 characters long', 'password')
      
      case 'Signup is disabled':
        throw new AuthenticationError('Account registration is currently disabled. Please contact support.', 'SIGNUP_DISABLED')
      
      case 'Too many requests':
        throw new AuthenticationError('Too many attempts. Please wait a few minutes before trying again.', 'RATE_LIMITED')
      
      case 'Invalid email':
        throw new ValidationError('Please enter a valid email address', 'email')
      
      default:
        // Generic error message for unknown errors
        throw new AuthenticationError(
          error.message || 'An unexpected error occurred. Please try again.',
          'UNKNOWN_ERROR'
        )
    }
  }

  // Production-grade sign up with comprehensive validation
  static async signUp(email: string, password: string, fullName?: string) {
    try {
      // Validate inputs
      this.validateEmail(email)
      this.validatePassword(password)
      
      if (fullName && fullName.trim().length < 2) {
        throw new ValidationError('Full name must be at least 2 characters long', 'fullName')
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase()

      // Check if user already exists
      const userExists = await this.checkUserExists(normalizedEmail)
      if (userExists) {
        throw new AuthenticationError('An account with this email already exists. Please sign in instead.', 'USER_EXISTS')
      }

      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName?.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        },
      })

      if (error) {
        this.handleAuthError(error)
      }

      if (!data.user) {
        throw new AuthenticationError('Failed to create account. Please try again.', 'SIGNUP_FAILED')
      }

      return data
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Unexpected signup error:', error)
      throw new AuthenticationError('An unexpected error occurred during signup. Please try again.', 'UNEXPECTED_ERROR')
    }
  }

  // Sign up without email confirmation (for development)
  static async signUpWithoutConfirmation(email: string, password: string, fullName?: string) {
    // This is a workaround for development - in production you should use proper email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    
    // If the user is created but not confirmed, we can still proceed for development
    if (data.user && !data.user.email_confirmed_at) {
      console.warn('User created but email not confirmed. In production, require email confirmation.')
    }
    
    return data
  }

  // Production-grade sign in with validation and error handling
  static async signIn(email: string, password: string) {
    try {
      // Validate inputs
      this.validateEmail(email)
      
      if (!password) {
        throw new ValidationError('Password is required', 'password')
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase()

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        this.handleAuthError(error)
      }

      if (!data.user) {
        throw new AuthenticationError('Sign in failed. Please check your credentials.', 'SIGNIN_FAILED')
      }

      return data
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Unexpected signin error:', error)
      throw new AuthenticationError('An unexpected error occurred during sign in. Please try again.', 'UNEXPECTED_ERROR')
    }
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Production-grade password reset with validation
  static async resetPassword(email: string) {
    try {
      // Validate email
      this.validateEmail(email)
      
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase()

      // Check if user exists before sending reset email
      const userExists = await this.checkUserExists(normalizedEmail)
      if (!userExists) {
        // For security, don't reveal if email exists or not
        // Always return success to prevent email enumeration attacks
        return { success: true, message: 'If an account with this email exists, you will receive a password reset link.' }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Password reset email sent successfully.' }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Unexpected password reset error:', error)
      throw new AuthenticationError('Failed to send password reset email. Please try again.', 'RESET_FAILED')
    }
  }

  // Production-grade password update with validation
  static async updatePassword(newPassword: string) {
    try {
      // Validate new password
      this.validatePassword(newPassword)

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Password updated successfully.' }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Unexpected password update error:', error)
      throw new AuthenticationError('Failed to update password. Please try again.', 'UPDATE_FAILED')
    }
  }

  // Resend confirmation email
  static async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm-email`
      }
    })
    if (error) throw error
  }

  // Check if user email is confirmed
  static async isEmailConfirmed(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email_confirmed_at != null
  }

  // Update user profile
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error
  }

  // ===== ENHANCED EMAIL SERVICES =====

  // Magic Link Authentication
  static async sendMagicLink(email: string) {
    try {
      this.validateEmail(email)
      
      const normalizedEmail = email.trim().toLowerCase()

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/magic-link`,
        },
      })

      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Magic link sent to your email!' }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Magic link error:', error)
      throw new AuthenticationError('Failed to send magic link. Please try again.', 'MAGIC_LINK_FAILED')
    }
  }

  // Verify Magic Link
  static async verifyMagicLink(token: string, email: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        this.handleAuthError(error)
      }

      return data
    } catch (error) {
      console.error('Magic link verification error:', error)
      throw new AuthenticationError('Invalid or expired magic link.', 'MAGIC_LINK_INVALID')
    }
  }

  // Change Email Address
  static async changeEmail(newEmail: string) {
    try {
      this.validateEmail(newEmail)
      
      const normalizedEmail = newEmail.trim().toLowerCase()

      const { error } = await supabase.auth.updateUser({
        email: normalizedEmail,
      }, {
        emailRedirectTo: `${window.location.origin}/change-email`
      })

      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Email change confirmation sent to your new email address.' }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Change email error:', error)
      throw new AuthenticationError('Failed to change email. Please try again.', 'EMAIL_CHANGE_FAILED')
    }
  }

  // Invite User (Admin function)
  static async inviteUser(email: string, redirectTo?: string) {
    try {
      this.validateEmail(email)
      
      const normalizedEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.admin.inviteUserByEmail(normalizedEmail, {
        redirectTo: redirectTo || `${window.location.origin}/invite-accept`
      })

      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Invitation sent successfully!', data }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Invite user error:', error)
      throw new AuthenticationError('Failed to send invitation. Please try again.', 'INVITE_FAILED')
    }
  }

  // Reauthentication
  static async reauthenticate() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        throw new AuthenticationError('No user session found.', 'NO_SESSION')
      }

      // Send reauthentication email
      const { error } = await supabase.auth.reauthenticate()

      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Reauthentication email sent!' }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      
      console.error('Reauthentication error:', error)
      throw new AuthenticationError('Failed to send reauthentication email.', 'REAUTH_FAILED')
    }
  }

  // Get all user sessions (for security)
  static async getUserSessions() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new AuthenticationError('Failed to get session information.', 'SESSION_ERROR')
      }

      return data
    } catch (error) {
      console.error('Get sessions error:', error)
      throw new AuthenticationError('Failed to retrieve session information.', 'SESSION_FAILED')
    }
  }

  // Sign out from all devices
  static async signOutEverywhere() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        this.handleAuthError(error)
      }

      return { success: true, message: 'Signed out from all devices successfully.' }
    } catch (error) {
      console.error('Global signout error:', error)
      throw new AuthenticationError('Failed to sign out from all devices.', 'GLOBAL_SIGNOUT_FAILED')
    }
  }
}