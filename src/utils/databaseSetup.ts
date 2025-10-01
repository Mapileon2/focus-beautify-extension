import { supabase } from '@/lib/supabase'

export interface SetupResult {
  step: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class DatabaseSetup {
  private results: SetupResult[] = []

  private addResult(step: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ step, status, message, details })
    console.log(`${status.toUpperCase()}: ${step} - ${message}`, details || '')
  }

  async verifyDatabaseSetup(): Promise<SetupResult[]> {
    this.results = []
    console.log('🔍 Verifying database setup...')

    await this.checkTablesExist()
    await this.checkRLSPolicies()
    await this.checkSampleData()
    await this.checkUserProfile()

    console.log('✅ Database verification completed!')
    return this.results
  }

  private async checkTablesExist() {
    const tables = ['users', 'user_settings', 'focus_sessions', 'tasks', 'quotes']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            this.addResult(`Table: ${table}`, 'error', `Table does not exist - needs to be created`, error)
          } else {
            this.addResult(`Table: ${table}`, 'warning', `Table exists but has access issues: ${error.message}`, error)
          }
        } else {
          this.addResult(`Table: ${table}`, 'success', 'Table exists and accessible')
        }
      } catch (error: any) {
        this.addResult(`Table: ${table}`, 'error', `Table check failed: ${error.message}`, error)
      }
    }
  }

  private async checkRLSPolicies() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        this.addResult('RLS Policies', 'warning', 'Cannot test RLS policies - no authenticated user')
        return
      }

      // Test if user can access their own data (should work)
      const { data: userTasks, error: userError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (userError) {
        if (userError.message.includes('schema cache')) {
          this.addResult('RLS Policies', 'error', 'Tables not created yet - RLS policies cannot be tested')
        } else {
          this.addResult('RLS Policies', 'warning', `RLS policy issue: ${userError.message}`)
        }
      } else {
        this.addResult('RLS Policies', 'success', 'RLS policies working - user can access own data')
      }

    } catch (error: any) {
      this.addResult('RLS Policies', 'error', `RLS test failed: ${error.message}`, error)
    }
  }

  private async checkSampleData() {
    try {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .is('user_id', null)
        .limit(5)

      if (error) {
        if (error.message.includes('schema cache')) {
          this.addResult('Sample Data', 'error', 'Tables not created - sample data not loaded')
        } else {
          this.addResult('Sample Data', 'warning', `Sample data check failed: ${error.message}`)
        }
      } else if (quotes && quotes.length > 0) {
        this.addResult('Sample Data', 'success', `Sample quotes loaded: ${quotes.length} quotes found`)
      } else {
        this.addResult('Sample Data', 'warning', 'No sample quotes found - may need to run setup script')
      }

    } catch (error: any) {
      this.addResult('Sample Data', 'error', `Sample data check failed: ${error.message}`, error)
    }
  }

  private async checkUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        this.addResult('User Profile', 'warning', 'No authenticated user to check profile')
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.message.includes('schema cache')) {
          this.addResult('User Profile', 'error', 'Users table not created - profile cannot be checked')
        } else if (error.code === 'PGRST116') {
          this.addResult('User Profile', 'warning', 'User profile not found - click "Create Profile & Settings" to set up')
        } else {
          this.addResult('User Profile', 'error', `Profile check failed: ${error.message}`)
        }
      } else {
        this.addResult('User Profile', 'success', `User profile exists for ${profile.email}`)
      }

    } catch (error: any) {
      this.addResult('User Profile', 'error', `User profile check failed: ${error.message}`, error)
    }
  }

  async createUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        this.addResult('Create Profile', 'error', 'No authenticated user to create profile for')
        return false
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single()

      if (error) {
        this.addResult('Create Profile', 'error', `Failed to create profile: ${error.message}`, error)
        return false
      } else {
        this.addResult('Create Profile', 'success', 'User profile created successfully')
        return true
      }

    } catch (error: any) {
      this.addResult('Create Profile', 'error', `Profile creation failed: ${error.message}`, error)
      return false
    }
  }

  getResults(): SetupResult[] {
    return this.results
  }

  getSummary() {
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const errors = this.results.filter(r => r.status === 'error').length
    const warnings = this.results.filter(r => r.status === 'warning').length

    const needsSetup = errors > 0 && this.results.some(r => 
      r.message.includes('schema cache') || 
      r.message.includes('does not exist') ||
      r.message.includes('not created')
    )

    return {
      total,
      success,
      errors,
      warnings,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      needsSetup,
      isReady: errors === 0 && success > 0
    }
  }
}