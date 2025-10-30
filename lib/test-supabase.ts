// @ts-nocheck
import { supabase } from '@/lib/supabase-client'

export async function testSupabaseConnection() {
  try {
    // Test connection by trying to fetch the users table (read-only test)
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      console.log('[Supabase Test] Connection failed:', error.message)
      return false
    }

    console.log('[Supabase Test] Connection successful')
    return true
  } catch (error) {
    console.log('[Supabase Test] Connection failed:', error.message)
    return false
  }
}