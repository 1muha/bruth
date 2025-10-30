// @ts-nocheck
import { createClient } from '@supabase/supabase-js'

// Supabase configuration from project memories
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwmrarzkxsneexracwzt.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bXJhcnpreHNuZWV4cmFjd3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjMzODMsImV4cCI6MjA3NTQzOTM4M30.TRLbYuxfeldkDRTuy0wUQEdQvdCa4OvDrMm1b6HnmCw'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }