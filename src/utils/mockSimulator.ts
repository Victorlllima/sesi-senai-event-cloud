import { supabase } from '@/lib/supabase'

const MOCK_NAMES = ['Ana', 'Carlos', 'Beatriz', 'João', 'Fernanda', 'Rafael', 'Mariana', 'Pedro']
const MOCK_DISCIPLINES = ['Mecânica', 'Robótica', 'IA', 'Moda', 'Elétrica', 'Segurança', 'Gestão']

export async function simulateEntry() {
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
    const discipline = MOCK_DISCIPLINES[Math.floor(Math.random() * MOCK_DISCIPLINES.length)]

    await supabase.from('professor_entries').insert({
        name: `${name} ${Math.floor(Math.random() * 100)}`,
        discipline: discipline
    })
}

// Para usar no console do navegador: window.simulate()
if (typeof window !== 'undefined') {
    (window as any).simulate = simulateEntry
}
