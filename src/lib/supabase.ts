import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Avisa no console do navegador se as variáveis foram carregadas
if (typeof window !== 'undefined') {
    console.log('🔌 Supabase Connection Status:', {
        hasUrl: !!rawUrl,
        hasKey: !!rawKey,
        env: process.env.NODE_ENV
    })
}

// Fallback de segurança (Build Safe)
const supabaseUrl = (rawUrl || 'https://placeholder.supabase.co').trim()
const supabaseAnonKey = (rawKey || 'placeholder-key').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
