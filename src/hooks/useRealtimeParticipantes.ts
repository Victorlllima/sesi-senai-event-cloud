import { useEffect, useState } from 'react'
import { supabase, ParticipanteEntry } from '@/lib/supabase'

export function useRealtimeParticipantes() {
    const [participantes, setParticipantes] = useState<ParticipanteEntry[]>([])

    useEffect(() => {
        // 1. Buscar dados iniciais
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('participantes_palestra')
                .select('*')
                .order('created_at', { ascending: true })

            if (data) setParticipantes(data)
        }

        fetchInitial()

        // 2. Inscrever no Realtime (INSERT e DELETE)
        const channel = supabase
            .channel('public:participantes_palestra')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'participantes_palestra' },
                (payload) => {
                    const newParticipante = payload.new as ParticipanteEntry
                    setParticipantes((prev) => [...prev, newParticipante])
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'participantes_palestra' },
                (payload) => {
                    // Remove o item da lista local quando ele é deletado no banco
                    setParticipantes((prev) => prev.filter(item => item.id !== payload.old.id))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return participantes
}
