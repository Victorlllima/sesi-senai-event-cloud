import { supabase } from '@/lib/supabase'

// Lista expandida para dar variedade nos 50 nomes
const MOCK_NAMES = [
    'Ana', 'Carlos', 'Beatriz', 'João', 'Fernanda', 'Rafael', 'Mariana', 'Pedro', 'Lucas', 'Juliana',
    'Roberto', 'Camila', 'Bruno', 'Patricia', 'Gabriel', 'Larissa', 'Felipe', 'Vanessa', 'Thiago', 'Amanda',
    'Rodrigo', 'Carolina', 'Daniel', 'Letícia', 'Gustavo', 'Sofia', 'Eduardo', 'Isabela', 'Marcelo', 'Tatiana'
]

const MOCK_DISCIPLINES = [
    'Mecânica', 'Robótica', 'IA', 'Moda', 'Elétrica', 'Segurança', 'Gestão', 'TI', 'Logística',
    'Automação', 'Edificações', 'Química', 'Alimentos', 'Design', 'Mecatrônica'
]

export async function simulateEntry() {
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
    const discipline = MOCK_DISCIPLINES[Math.floor(Math.random() * MOCK_DISCIPLINES.length)]

    await supabase.from('professor_entries').insert({
        name: name,
        discipline: discipline
    })
}

// Função para inserir vários de uma vez (com delay visual)
export async function populate(count = 50) {
    console.log(`🚀 Iniciando inserção de ${count} professores...`)

    for (let i = 0; i < count; i++) {
        simulateEntry()
        // Delay de 100ms para criar um efeito "cascata" na animação
        await new Promise(r => setTimeout(r, 100))
    }

    console.log('✅ Carga finalizada!')
}

if (typeof window !== 'undefined') {
    (window as any).simulate = simulateEntry;
    (window as any).populate = populate;
}
