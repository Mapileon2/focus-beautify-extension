import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // For development, you can disable email confirmation
        // In production, you should enable email confirmation for security
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) throw error
    return data
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

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
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

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  // Update password (for password reset flow)
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  // Resend confirmation email
  static async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin
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
}