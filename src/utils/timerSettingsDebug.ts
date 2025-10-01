import { supabase } from '@/lib/supabase';

export async function debugTimerSettings() {
  console.log('🔍 Timer Settings Debug Test Starting...');
  
  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return { success: false, error: 'Connection failed', details: connectionError };
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Check if user_settings table exists
    console.log('2. Testing user_settings table...');
    const { data: tableTest, error: tableError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ user_settings table error:', tableError);
      if (tableError.message.includes('relation "user_settings" does not exist')) {
        return { 
          success: false, 
          error: 'Database schema not set up', 
          details: 'The user_settings table does not exist. Please run the database setup SQL.',
          solution: 'Execute supabase-schema.sql in your Supabase dashboard'
        };
      }
      return { success: false, error: 'Table access failed', details: tableError };
    }
    console.log('✅ user_settings table accessible');

    // Test 3: Check authentication
    console.log('3. Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: 'Authentication failed', details: authError };
    }
    
    if (!user) {
      console.log('ℹ️ No user logged in - this is OK for testing');
      return { 
        success: true, 
        message: 'Database ready, but no user logged in. Settings will save to localStorage.',
        user: null
      };
    }
    
    console.log('✅ User authenticated:', user.email);

    // Test 4: Try to read user settings
    console.log('4. Testing user settings read...');
    const { data: userSettings, error: readError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (readError && readError.code !== 'PGRST116') {
      console.error('❌ Settings read error:', readError);
      return { success: false, error: 'Settings read failed', details: readError };
    }
    
    if (readError?.code === 'PGRST116') {
      console.log('ℹ️ No existing settings found - this is OK for new users');
    } else {
      console.log('✅ User settings found:', userSettings);
    }

    // Test 5: Try to create/update settings
    console.log('5. Testing settings upsert...');
    const testSettings = {
      user_id: user.id,
      focus_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      sessions_until_long_break: 4,
      updated_at: new Date().toISOString(),
    };
    
    const { data: upsertResult, error: upsertError } = await supabase
      .from('user_settings')
      .upsert(testSettings)
      .select()
      .single();
    
    if (upsertError) {
      console.error('❌ Settings upsert error:', upsertError);
      return { success: false, error: 'Settings save failed', details: upsertError };
    }
    
    console.log('✅ Settings upsert successful:', upsertResult);

    return { 
      success: true, 
      message: 'All tests passed! Timer settings should work correctly.',
      user: user.email,
      settings: upsertResult
    };

  } catch (error) {
    console.error('❌ Debug test failed:', error);
    return { success: false, error: 'Unexpected error', details: error };
  }
}

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).debugTimerSettings = debugTimerSettings;
}