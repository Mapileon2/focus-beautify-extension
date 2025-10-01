import { QuoteService } from '@/services/quoteService'
import { supabase } from '@/lib/supabase'

export async function debugQuoteCreation() {
  console.log('🧪 Starting Quote Creation Debug Test...')
  
  try {
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('1. Authentication Check:', {
      user: user ? { id: user.id, email: user.email } : null,
      error: authError
    })
    
    if (!user) {
      console.error('❌ User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }

    // 2. Test direct QuoteService call
    console.log('2. Testing direct QuoteService.createQuote...')
    const testQuote = {
      user_id: user.id,
      content: 'Test quote for debugging - ' + new Date().toISOString(),
      author: 'Debug Tester',
      category: 'Debug',
      is_custom: true
    }
    
    const createdQuote = await QuoteService.createQuote(testQuote)
    console.log('✅ Quote created successfully:', createdQuote)

    // 3. Test fetching quotes
    console.log('3. Testing QuoteService.getQuotes...')
    const userQuotes = await QuoteService.getQuotes(user.id)
    console.log('✅ User quotes fetched:', userQuotes.length, 'quotes')

    // 4. Test database connection directly
    console.log('4. Testing direct Supabase query...')
    const { data: directQuotes, error: directError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    console.log('Direct Supabase query result:', {
      quotes: directQuotes,
      error: directError
    })

    // 5. Check RLS policies
    console.log('5. Testing RLS policies...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        content: 'RLS test quote - ' + new Date().toISOString(),
        author: 'RLS Tester',
        category: 'RLS Test',
        is_custom: true
      })
      .select()
    
    console.log('RLS test result:', {
      data: rlsTest,
      error: rlsError
    })

    return { 
      success: true, 
      results: {
        user,
        createdQuote,
        userQuotes: userQuotes.length,
        directQuotes: directQuotes?.length,
        rlsTest: rlsTest?.length
      }
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error)
    return { success: false, error }
  }
}

// Helper function to run from browser console
(window as any).debugQuoteCreation = debugQuoteCreation