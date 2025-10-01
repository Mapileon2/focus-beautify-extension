import { supabase } from '@/lib/supabase'
import { AuthService } from '@/services/authService'
import { UserService } from '@/services/userService'
import { SessionService } from '@/services/sessionService'
import { TaskService } from '@/services/taskService'
import { QuoteService } from '@/services/quoteService'

export interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class IntegrationTester {
  private results: TestResult[] = []

  private addResult(name: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ name, status, message, details })
    console.log(`${status.toUpperCase()}: ${name} - ${message}`, details || '')
  }

  async runAllTests(): Promise<TestResult[]> {
    this.results = []
    console.log('🚀 Starting comprehensive backend integration tests...')

    await this.testSupabaseConnection()
    await this.testDatabaseTables()
    await this.testAuthentication()
    await this.testServices()
    await this.testDataOperations()

    console.log('✅ Integration tests completed!')
    return this.results
  }

  private async testSupabaseConnection() {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('count')
        .limit(1)

      if (error) {
        this.addResult('Supabase Connection', 'error', `Connection failed: ${error.message}`, error)
      } else {
        this.addResult('Supabase Connection', 'success', 'Successfully connected to Supabase')
      }
    } catch (error: any) {
      this.addResult('Supabase Connection', 'error', `Connection exception: ${error.message}`, error)
    }
  }

  private async testDatabaseTables() {
    const tables = ['users', 'user_settings', 'focus_sessions', 'tasks', 'quotes']
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (error) {
          this.addResult(`Table: ${table}`, 'error', `Table access failed: ${error.message}`, error)
        } else {
          this.addResult(`Table: ${table}`, 'success', 'Table accessible')
        }
      } catch (error: any) {
        this.addResult(`Table: ${table}`, 'error', `Table exception: ${error.message}`, error)
      }
    }
  }

  private async testAuthentication() {
    try {
      // Test getting current session
      const session = await AuthService.getCurrentSession()
      if (session) {
        this.addResult('Authentication', 'success', `User authenticated: ${session.user.email}`, {
          userId: session.user.id,
          email: session.user.email
        })
      } else {
        this.addResult('Authentication', 'warning', 'No active session (user not logged in)')
      }

      // Test auth state change listener
      const { data } = AuthService.onAuthStateChange(() => {})
      if (data.subscription) {
        this.addResult('Auth Listener', 'success', 'Auth state change listener working')
        data.subscription.unsubscribe()
      }
    } catch (error: any) {
      this.addResult('Authentication', 'error', `Auth test failed: ${error.message}`, error)
    }
  }

  private async testServices() {
    // Test each service class
    const services = [
      { name: 'AuthService', service: AuthService },
      { name: 'UserService', service: UserService },
      { name: 'SessionService', service: SessionService },
      { name: 'TaskService', service: TaskService },
      { name: 'QuoteService', service: QuoteService }
    ]

    for (const { name, service } of services) {
      try {
        // Check if service has expected methods
        const methods = Object.getOwnPropertyNames(service).filter(
          prop => typeof service[prop as keyof typeof service] === 'function'
        )
        
        if (methods.length > 0) {
          this.addResult(`Service: ${name}`, 'success', `Service loaded with ${methods.length} methods`, methods)
        } else {
          this.addResult(`Service: ${name}`, 'warning', 'Service loaded but no methods found')
        }
      } catch (error: any) {
        this.addResult(`Service: ${name}`, 'error', `Service test failed: ${error.message}`, error)
      }
    }
  }

  private async testDataOperations() {
    try {
      // Test quotes (public data)
      const quotes = await QuoteService.getQuotes()
      if (quotes && quotes.length > 0) {
        this.addResult('Data: Quotes', 'success', `Retrieved ${quotes.length} quotes`, {
          sampleQuote: quotes[0]?.content?.substring(0, 50) + '...'
        })
      } else {
        this.addResult('Data: Quotes', 'warning', 'No quotes found in database')
      }

      // Test random quote
      const randomQuote = await QuoteService.getRandomQuote()
      if (randomQuote) {
        this.addResult('Data: Random Quote', 'success', 'Random quote retrieval working', {
          quote: randomQuote.content?.substring(0, 50) + '...'
        })
      } else {
        this.addResult('Data: Random Quote', 'warning', 'No random quote returned')
      }

      // Test categories
      const categories = await QuoteService.getCategories()
      if (categories && categories.length > 0) {
        this.addResult('Data: Categories', 'success', `Found ${categories.length} categories`, categories)
      } else {
        this.addResult('Data: Categories', 'warning', 'No categories found')
      }

    } catch (error: any) {
      this.addResult('Data Operations', 'error', `Data test failed: ${error.message}`, error)
    }
  }

  // Test user-specific operations (requires authentication)
  async testUserOperations(userId: string) {
    try {
      // Test user profile
      const profile = await UserService.getUserProfile(userId)
      if (profile) {
        this.addResult('User: Profile', 'success', 'User profile retrieved', {
          email: profile.email,
          fullName: profile.full_name
        })
      } else {
        this.addResult('User: Profile', 'warning', 'No user profile found')
      }

      // Test user settings
      const settings = await UserService.getUserSettings(userId)
      if (settings) {
        this.addResult('User: Settings', 'success', 'User settings retrieved', {
          focusDuration: settings.focus_duration,
          theme: settings.theme
        })
      } else {
        this.addResult('User: Settings', 'warning', 'No user settings found')
      }

      // Test user sessions
      const sessions = await SessionService.getUserSessions(userId, 10)
      this.addResult('User: Sessions', 'success', `Retrieved ${sessions.length} sessions`)

      // Test user tasks
      const tasks = await TaskService.getUserTasks(userId)
      this.addResult('User: Tasks', 'success', `Retrieved ${tasks.length} tasks`)

      // Test session stats
      const stats = await SessionService.getSessionStats(userId)
      if (stats) {
        this.addResult('User: Stats', 'success', 'Session statistics calculated', {
          totalSessions: stats.totalSessions,
          totalFocusTime: stats.totalFocusTime
        })
      }

    } catch (error: any) {
      this.addResult('User Operations', 'error', `User test failed: ${error.message}`, error)
    }
  }

  getResults(): TestResult[] {
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