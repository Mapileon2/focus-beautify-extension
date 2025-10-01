import { supabase } from '@/lib/supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('quotes')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Database accessible:', !!data)
    
    // Test authentication
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Current session:', session ? 'Authenticated' : 'Not authenticated')
    
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

export const testDatabaseTables = async () => {
  const tables = ['users', 'user_settings', 'focus_sessions', 'tasks', 'quotes']
  const results: Record<string, boolean> = {}
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      results[table] = !error
      console.log(`Table ${table}:`, error ? '❌ Error' : '✅ Accessible')
      
      if (error) {
        console.error(`Error accessing ${table}:`, error.message)
      }
    } catch (error) {
      results[table] = false
      console.error(`Exception testing ${table}:`, error)
    }
  }
  
  return results
}