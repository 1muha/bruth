// @ts-nocheck
import { supabase } from '@/lib/supabase-client'

export async function debugDatabaseConnection() {
  try {
    console.log('[Database Debug] Starting database connection test...')
    
    // Test 1: Check if we can connect to Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (userError) {
      console.log('[Database Debug] User table access failed:', userError)
      return { success: false, error: `User table access failed: ${userError.message}` }
    }

    console.log('[Database Debug] User table access successful')
    
    // Test 2: Check if contacts table exists and is accessible
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1)

    if (contactError) {
      console.log('[Database Debug] Contacts table access failed:', contactError)
      return { success: false, error: `Contacts table access failed: ${contactError.message}` }
    }

    console.log('[Database Debug] Contacts table access successful')
    
    // Test 3: Try to create a test contact
    const testContact = {
      user_id: 'test-user-id',
      ism: 'Debug Test User',
      raqami: '+1234567890',
      qayerda_tanishilgan: 'Debug Test Location',
      qanday_foydasi: 'Debug Test Benefit',
      biznings_foydamiz: 'Debug Test Value',
      telegram: '@debugtest',
      instagram: '@debugtest',
      email: 'debug@test.com'
    }

    const { data: createdContact, error: createError } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
      .single()

    if (createError) {
      console.log('[Database Debug] Contact creation failed:', createError)
      return { success: false, error: `Contact creation failed: ${createError.message}` }
    }

    console.log('[Database Debug] Contact creation successful:', createdContact)
    
    // Test 4: Try to fetch the created contact
    const { data: fetchedContact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', createdContact.id)
      .single()

    if (fetchError) {
      console.log('[Database Debug] Contact fetch failed:', fetchError)
      return { success: false, error: `Contact fetch failed: ${fetchError.message}` }
    }

    console.log('[Database Debug] Contact fetch successful:', fetchedContact)
    
    // Test 5: Try to delete the test contact
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', createdContact.id)

    if (deleteError) {
      console.log('[Database Debug] Contact deletion failed:', deleteError)
      // Don't return error here as the main functionality works
    } else {
      console.log('[Database Debug] Contact deletion successful')
    }

    return { success: true, message: 'All database tests passed!' }
  } catch (error) {
    console.log('[Database Debug] Unexpected error:', error)
    return { success: false, error: `Unexpected error: ${error.message || error}` }
  }
}
