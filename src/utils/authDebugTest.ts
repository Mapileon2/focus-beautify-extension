import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'

export class AuthDebugTest {
  // Test basic connectivity
  static async testConnectivity() {
    console.log('🔍 Testing Supabase connectivity...')
    
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('❌ Connectivity test failed:', error.message)
        return false
      }
      console.log('✅ Supabase connection successful')
      return true
    } catch (error) {
      console.error('❌ Connectivity test error:', error)
      return false
    }
  }

  // Test user creation flow
  static async testUserCreation() {
    console.log('🔍 Testing user creation flow...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPass123!'
    const testName = 'Test User'
    
    try {
      // Test signup
      console.log('📝 Testing signup...')
      const signupResult = await AuthService.signUp(testEmail, testPassword, testName)
      
      if (!signupResult || !signupResult.user) {
        console.error('❌ Signup failed: No user returned')
        return false
      }
      
      console.log('✅ Signup successful:', {
        userId: signupResult.user.id,
        email: signupResult.user.email,
        confirmed: !!signupResult.user.email_confirmed_at
      })
      
      // Clean up - delete the test user
      try {
        await supabase.auth.admin.deleteUser(signupResult.user.id)
        console.log('🧹 Test user cleaned up')
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup test user:', cleanupError)
      }
      
      return true
    } catch (error) {
      console.error('❌ User creation test failed:', error)
      return false
    }
  }

  // Test authentication state
  static async testAuthState() {
    console.log('🔍 Testing authentication state...')
    
    try {
      const session = await AuthService.getCurrentSession()
      const user = await AuthService.getCurrentUser()
      
      console.log('📊 Current auth state:', {
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        emailConfirmed: !!user?.email_confirmed_at
      })
      
      return true
    } catch (error) {
      console.error('❌ Auth state test failed:', error)
      return false
    }
  }

  // Test database schema
  static async testDatabaseSchema() {
    console.log('🔍 Testing database schema...')
    
    try {
      // Test users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (usersError) {
        console.error('❌ Users table test failed:', usersError.message)
        return false
      }
      
      console.log('✅ Users table accessible')
      
      // Test other key tables
      const tables = ['focus_sessions', 'tasks', 'quotes', 'user_settings']
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.error(`❌ ${table} table test failed:`, error.message)
          return false
        }
        
        console.log(`✅ ${table} table accessible`)
      }
      
      return true
    } catch (error) {
      console.error('❌ Database schema test failed:', error)
      return false
    }
  }

  // Run all debug tests
  static async runAllTests() {
    console.log('🚀 Starting Authentication Debug Tests...')
    
    const results = {
      connectivity: await this.testConnectivity(),
      userCreation: await this.testUserCreation(),
      authState: await this.testAuthState(),
      databaseSchema: await this.testDatabaseSchema()
    }
    
    const passed = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length
    
    console.log('\n📊 Debug Test Results:')
    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${total - passed}/${total}`)
    
    if (passed === total) {
      console.log('\n🎉 All debug tests passed! Authentication system is working correctly.')
    } else {
      console.log('\n⚠️ Some tests failed. Check the logs above for details.')
    }
    
    return results
  }
}

// Export for easy use
export const runAuthDebugTests = () => AuthDebugTest.runAllTests()