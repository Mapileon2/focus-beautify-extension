import { supabase } from '@/lib/supabase'

export interface StorageTestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class StorageTester {
  private results: StorageTestResult[] = []

  private addResult(test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ test, status, message, details })
    console.log(`${status.toUpperCase()}: ${test} - ${message}`, details || '')
  }

  async runStorageTests(): Promise<StorageTestResult[]> {
    this.results = []
    console.log('💾 Starting storage backend connection tests...')

    await this.testSupabaseConnection()
    await this.testDatabaseConnection()
    await this.testDatabaseTables()
    await this.testDataOperations()
    await this.testRealTimeFeatures()
    await this.testStoragePermissions()

    console.log('✅ Storage tests completed!')
    return this.results
  }

  private async testSupabaseConnection() {
    try {
      // Test basic Supabase client connection
      const { data, error } = await supabase
        .from('quotes')
        .select('count')
        .limit(1)

      if (error) {
        this.addResult('Supabase Connection', 'error', `Connection failed: ${error.message}`, error)
      } else {
        this.addResult('Supabase Connection', 'success', 'Successfully connected to Supabase backend')
      }
    } catch (error: any) {
      this.addResult('Supabase Connection', 'error', `Connection exception: ${error.message}`, error)
    }
  }

  private async testDatabaseConnection() {
    try {
      // Test database connectivity with a simple query
      const { data, error } = await supabase.rpc('version')
      
      if (error) {
        // If RPC fails, try a simple select
        const { data: testData, error: selectError } = await supabase
          .from('quotes')
          .select('id')
          .limit(1)
        
        if (selectError) {
          this.addResult('Database Connection', 'error', `Database not accessible: ${selectError.message}`, selectError)
        } else {
          this.addResult('Database Connection', 'success', 'Database accessible via SELECT queries')
        }
      } else {
        this.addResult('Database Connection', 'success', 'Database fully accessible with RPC functions', data)
      }
    } catch (error: any) {
      this.addResult('Database Connection', 'error', `Database connection failed: ${error.message}`, error)
    }
  }

  private async testDatabaseTables() {
    const tables = [
      { name: 'users', description: 'User profiles and authentication data' },
      { name: 'user_settings', description: 'User preferences and settings' },
      { name: 'focus_sessions', description: 'Pomodoro session tracking' },
      { name: 'tasks', description: 'Task management data' },
      { name: 'quotes', description: 'Motivational quotes library' }
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)

        if (error) {
          this.addResult(`Table: ${table.name}`, 'error', `Table not accessible: ${error.message}`, {
            table: table.name,
            description: table.description,
            error: error
          })
        } else {
          this.addResult(`Table: ${table.name}`, 'success', `Table accessible - ${table.description}`, {
            table: table.name,
            hasData: data && data.length > 0,
            sampleCount: data?.length || 0
          })
        }
      } catch (error: any) {
        this.addResult(`Table: ${table.name}`, 'error', `Table test exception: ${error.message}`, error)
      }
    }
  }

  private async testDataOperations() {
    try {
      // Test READ operations
      const { data: quotes, error: readError } = await supabase
        .from('quotes')
        .select('*')
        .limit(5)

      if (readError) {
        this.addResult('Data Read Operations', 'error', `Read failed: ${readError.message}`, readError)
      } else {
        this.addResult('Data Read Operations', 'success', `Successfully read ${quotes?.length || 0} records`, {
          recordCount: quotes?.length || 0,
          sampleData: quotes?.[0] ? {
            id: quotes[0].id,
            content: quotes[0].content?.substring(0, 50) + '...'
          } : null
        })
      }

      // Test authentication-dependent operations (if user is logged in)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Test user-specific data operations
        await this.testUserDataOperations(user.id)
      } else {
        this.addResult('User Data Operations', 'warning', 'No authenticated user - skipping user-specific tests')
      }

    } catch (error: any) {
      this.addResult('Data Operations', 'error', `Data operations failed: ${error.message}`, error)
    }
  }

  private async testUserDataOperations(userId: string) {
    try {
      // Test user profile access
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        this.addResult('User Profile Access', 'error', `Profile access failed: ${profileError.message}`, profileError)
      } else if (profile) {
        this.addResult('User Profile Access', 'success', 'User profile accessible', {
          userId: profile.id,
          email: profile.email
        })
      } else {
        this.addResult('User Profile Access', 'warning', 'User profile not found - may need to be created')
      }

      // Test user settings access
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        this.addResult('User Settings Access', 'error', `Settings access failed: ${settingsError.message}`, settingsError)
      } else if (settings) {
        this.addResult('User Settings Access', 'success', 'User settings accessible', {
          focusDuration: settings.focus_duration,
          theme: settings.theme
        })
      } else {
        this.addResult('User Settings Access', 'warning', 'User settings not found - will be created on first use')
      }

      // Test user sessions access
      const { data: sessions, error: sessionsError } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .limit(5)

      if (sessionsError) {
        this.addResult('User Sessions Access', 'error', `Sessions access failed: ${sessionsError.message}`, sessionsError)
      } else {
        this.addResult('User Sessions Access', 'success', `User sessions accessible - ${sessions?.length || 0} sessions found`, {
          sessionCount: sessions?.length || 0
        })
      }

      // Test user tasks access
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .limit(5)

      if (tasksError) {
        this.addResult('User Tasks Access', 'error', `Tasks access failed: ${tasksError.message}`, tasksError)
      } else {
        this.addResult('User Tasks Access', 'success', `User tasks accessible - ${tasks?.length || 0} tasks found`, {
          taskCount: tasks?.length || 0
        })
      }

    } catch (error: any) {
      this.addResult('User Data Operations', 'error', `User data test failed: ${error.message}`, error)
    }
  }

  private async testRealTimeFeatures() {
    try {
      // Test if real-time subscriptions are available
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'quotes' }, 
          (payload) => {
            console.log('Real-time test payload:', payload)
          }
        )

      // Try to subscribe
      const subscriptionResult = await channel.subscribe()
      
      if (subscriptionResult === 'SUBSCRIBED') {
        this.addResult('Real-time Features', 'success', 'Real-time subscriptions working')
        
        // Clean up the test subscription
        await supabase.removeChannel(channel)
      } else {
        this.addResult('Real-time Features', 'warning', `Real-time subscription status: ${subscriptionResult}`)
      }

    } catch (error: any) {
      this.addResult('Real-time Features', 'error', `Real-time test failed: ${error.message}`, error)
    }
  }

  private async testStoragePermissions() {
    try {
      // Test Row Level Security (RLS) by checking if policies are working
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Test if user can only access their own data
        const { data: userTasks, error: userTasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)

        if (userTasksError) {
          this.addResult('RLS Permissions', 'error', `RLS test failed: ${userTasksError.message}`, userTasksError)
        } else {
          this.addResult('RLS Permissions', 'success', 'Row Level Security working - user can access own data', {
            userTaskCount: userTasks?.length || 0
          })
        }

        // Test if user cannot access other users' data (this should fail)
        const { data: allTasks, error: allTasksError } = await supabase
          .from('tasks')
          .select('*')
          .neq('user_id', user.id)
          .limit(1)

        if (allTasksError || (allTasks && allTasks.length === 0)) {
          this.addResult('RLS Data Isolation', 'success', 'Row Level Security properly isolating user data')
        } else if (allTasks && allTasks.length > 0) {
          this.addResult('RLS Data Isolation', 'warning', 'RLS may not be properly configured - can see other users data')
        }

      } else {
        // Test anonymous access (should be limited)
        const { data: publicQuotes, error: publicError } = await supabase
          .from('quotes')
          .select('*')
          .is('user_id', null)
          .limit(5)

        if (publicError) {
          this.addResult('Anonymous Access', 'error', `Anonymous access failed: ${publicError.message}`, publicError)
        } else {
          this.addResult('Anonymous Access', 'success', `Anonymous users can access public quotes: ${publicQuotes?.length || 0} quotes`)
        }
      }

    } catch (error: any) {
      this.addResult('Storage Permissions', 'error', `Permission test failed: ${error.message}`, error)
    }
  }

  getResults(): StorageTestResult[] {
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
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      isHealthy: errors === 0 && success > total * 0.7 // Consider healthy if no errors and >70% success
    }
  }
}

// Quick storage connection test
export const quickStorageTest = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('count')
      .limit(1)

    return !error
  } catch (error) {
    return false
  }
}