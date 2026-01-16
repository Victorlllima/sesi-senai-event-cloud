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
        // 1. Buscar dados iniciais
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('professor_entries')
                .select('*')
                .order('created_at', { ascending: true })

            if (data) setProfessors(data)
        }

        fetchInitial()

        // 2. Inscrever no Realtime (INSERT e DELETE)
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
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'professor_entries' },
                (payload) => {
                    // Remove o item da lista local quando ele é deletado no banco
                    setProfessors((prev) => prev.filter(item => item.id !== payload.old.id))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return professors
}
