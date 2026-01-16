import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Professor {
    id: string
    name: string
    discipline: string
    created_at: string
}

export function useRealtimeProfessors() {
    const [professors, setProfessors] = useState<Professor[]>([])

    useEffect(() => {
        // 1. Buscar dados iniciais (histórico)
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('professor_entries')
                .select('*')
                .order('created_at', { ascending: true }) // Mais antigos primeiro para encher a nuvem

            if (data) setProfessors(data)
        }

        fetchInitial()

        // 2. Inscrever no Realtime (novos inserts)
        const channel = supabase
            .channel('public:professor_entries')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'professor_entries' },
                (payload) => {
                    const newProfessor = payload.new as Professor
                    setProfessors((prev) => [...prev, newProfessor])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return professors
}
