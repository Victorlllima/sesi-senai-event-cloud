import { createClient } from '@supabase/supabase-js'

// Supabase client para Server Components (não singleton)
export async function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

    return createClient(supabaseUrl, supabaseAnonKey)
}
