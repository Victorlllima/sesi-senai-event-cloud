import { createClient } from '@supabase/supabase-js'

// Tenta pegar a variável real. Se não existir (durante o build), usa um placeholder seguro.
// Isso evita o erro "supabaseUrl is required" durante a pré-renderização estática.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
