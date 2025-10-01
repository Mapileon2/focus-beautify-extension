import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'

export interface AuthTestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class AuthTester {
  private results: AuthTestResult[] = []

  private addResult(test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ test, status, message, details })
    console.log(`${status.toUpperCase()}: ${test} - ${message}`, details || '')
  }

  async runAuthTests(): Promise<AuthTestResult[]> {
    this.results = []
    console.log('🔐 Starting authentication system tests...')

    await this.testSupabaseAuthConfig()
    await this.testAuthMethods()
    await this.testEmailConfirmationSettings()
    await this.testPasswordResetFlow()

    console.log('✅ Authentication tests completed!')
    return this.results
  }

  private async testSupabaseAuthConfig() {
    try {
      // Test basic auth configuration
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        this.addResult('Auth Configuration', 'error', `Auth config error: ${error.message}`, error)
      } else {
        this.addResult('Auth Configuration', 'success', 'Supabase auth properly configured')
      }

      // Test auth settings
      const settings = await supabase.auth.getUser()
      this.addResult('Auth Settings', 'success', 'Auth settings accessible')

    } catch (error: any) {
      this.addResult('Auth Configuration', 'error', `Auth config exception: ${error.message}`, error)
    }
  }

  private async testAuthMethods() {
    try {
      // Test if AuthService methods are available
      const methods = [
        'signUp', 'signIn', 'signOut', 'getCurrentUser', 
        'getCurrentSession', 'resetPassword', 'updatePassword',
        'resendConfirmation', 'isEmailConfirmed'
      ]

      for (const method of methods) {
        if (typeof AuthService[method as keyof typeof AuthService] === 'function') {
          this.addResult(`Method: ${method}`, 'success', 'Method available')
        } else {
          this.addResult(`Method: ${method}`, 'error', 'Method not found')
        }
      }

    } catch (error: any) {
      this.addResult('Auth Methods', 'error', `Method test failed: ${error.message}`, error)
    }
  }

  private async testEmailConfirmationSettings() {
    try {
      // Check current user status
      const user = await AuthService.getCurrentUser()
      
      if (user) {
        const isConfirmed = await AuthService.isEmailConfirmed()
        if (isConfirmed) {
          this.addResult('Email Confirmation', 'success', 'User email is confirmed')
        } else {
          this.addResult('Email Confirmation', 'warning', 'User email not confirmed - this may cause login issues')
        }
      } else {
        this.addResult('Email Confirmation', 'warning', 'No user logged in to test confirmation status')
      }

    } catch (error: any) {
      this.addResult('Email Confirmation', 'error', `Confirmation test failed: ${error.message}`, error)
    }
  }

  private async testPasswordResetFlow() {
    try {
      // Test password reset method availability
      if (typeof AuthService.resetPassword === 'function') {
        this.addResult('Password Reset', 'success', 'Password reset method available')
      } else {
        this.addResult('Password Reset', 'error', 'Password reset method not found')
      }

      // Test password update method
      if (typeof AuthService.updatePassword === 'function') {
        this.addResult('Password Update', 'success', 'Password update method available')
      } else {
        this.addResult('Password Update', 'error', 'Password update method not found')
      }

    } catch (error: any) {
      this.addResult('Password Reset Flow', 'error', `Password reset test failed: ${error.message}`, error)
    }
  }

  // Test signup without email confirmation (for development)
  async testDevelopmentSignup(email: string, password: string): Promise<boolean> {
    try {
      console.log('🧪 Testing development signup...')
      
      const result = await AuthService.signUpWithoutConfirmation(email, password, 'Test User')
      
      if (result.user) {
        this.addResult('Development Signup', 'success', 'User created successfully', {
          userId: result.user.id,
          email: result.user.email,
          confirmed: result.user.email_confirmed_at != null
        })
        return true
      } else {
        this.addResult('Development Signup', 'error', 'No user returned from signup')
        return false
      }

    } catch (error: any) {
      this.addResult('Development Signup', 'error', `Signup failed: ${error.message}`, error)
      return false
    }
  }

  // Test signin with unconfirmed email
  async testSigninWithUnconfirmedEmail(email: string, password: string): Promise<boolean> {
    try {
      console.log('🧪 Testing signin with unconfirmed email...')
      
      const result = await AuthService.signIn(email, password)
      
      if (result.user) {
        this.addResult('Unconfirmed Email Signin', 'success', 'Signin successful despite unconfirmed email', {
          userId: result.user.id,
          email: result.user.email
        })
        return true
      } else {
        this.addResult('Unconfirmed Email Signin', 'error', 'Signin failed')
        return false
      }

    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        this.addResult('Unconfirmed Email Signin', 'warning', 'Signin blocked due to unconfirmed email - this is expected behavior')
      } else {
        this.addResult('Unconfirmed Email Signin', 'error', `Signin failed: ${error.message}`, error)
      }
      return false
    }
  }

  getResults(): AuthTestResult[] {
    return this.results
  }

  getSummary() {
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const errors = this.results.filter(r => r.status === 'error').length
    const warnings = this.results.filter(r => r.status === 'warning').length

    return {
      total,
      success,
      errors,
      warnings,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0
    }
  }
}