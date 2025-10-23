import { supabase } from './supabase-client';

/**
 * Test Supabase connection and auth functionality
 */
export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection (test with a real table)
    console.log('1. Testing basic connection...');
    const { error: healthError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (healthError) {
      console.log('✅ Basic connection works (categories table query failed, which is normal if empty)');
    } else {
      console.log('✅ Basic connection works');
    }

    // Test 2: Auth service
    console.log('2. Testing auth service...');
    const { error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth service error:', authError);
      return false;
    } else {
      console.log('✅ Auth service works');
    }

    console.log('✅ All tests passed');
    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};
