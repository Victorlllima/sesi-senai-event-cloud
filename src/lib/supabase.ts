import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Durante o build, isso pode ser nulo, então não explodimos o erro imediatamente
    // a menos que estejamos tentando usar o cliente.
    console.warn('⚠️ Supabase credentials missing! Check .env.local or Vercel Settings.')
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
