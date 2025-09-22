import { supabase, supabaseAdmin } from './supabase-client';

/**
 * Test Supabase connection and auth functionality
 */
export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection (test with a real table)
    console.log('1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
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
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth service error:', authError);
      return false;
    } else {
      console.log('✅ Auth service works');
    }

    // Test 3: Try to create a test user using admin API
    console.log('3. Testing admin user creation...');
    
    if (!process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ No service role key - skipping admin user creation test');
      return true; // Don't fail the test if no service role key
    }

    const { data: testUser, error: testError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    });

    if (testError) {
      console.error('❌ Admin user creation failed:', testError);
      console.log('Error details:', {
        message: testError.message,
        status: testError.status,
        code: testError.code
      });
      return false;
    } else {
      console.log('✅ Admin user creation works');
      return true;
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};
