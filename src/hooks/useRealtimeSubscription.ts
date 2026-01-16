import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfessorEntry } from '@/types';

export const useRealtimeSubscription = () => {
    const [entries, setEntries] = useState<ProfessorEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        const fetchEntries = async () => {
            const { data, error } = await supabase
                .from('professor_entries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching entries:', error);
            } else {
                setEntries(data || []);
            }
            setLoading(false);
        };

        fetchEntries();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:professor_entries')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'professor_entries',
                },
                (payload) => {
                    const newEntry = payload.new as ProfessorEntry;
                    setEntries((prev) => [newEntry, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { entries, loading };
};
