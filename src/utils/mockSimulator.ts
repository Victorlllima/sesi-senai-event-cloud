import { supabase } from '@/lib/supabase'

// Listas de dados para simulação
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

export async function populate(count = 50) {
    console.log(`🚀 Iniciando inserção de ${count} professores...`)
    for (let i = 0; i < count; i++) {
        simulateEntry()
        await new Promise(r => setTimeout(r, 100))
    }
    console.log('✅ Carga finalizada!')
}

// 🔥 NOVA FUNÇÃO: Limpar tudo
export async function reset() {
    console.log('🗑️ Limpando banco de dados...')

    const { error } = await supabase
        .from('professor_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta tudo que não tem ID zero (todos)

    if (error) {
        console.error('Erro ao limpar:', error)
    } else {
        console.log('✨ Tela limpa com sucesso!')
    }
}

if (typeof window !== 'undefined') {
    (window as any).simulate = simulateEntry;
    (window as any).populate = populate;
    (window as any).reset = reset; // Expondo para o console
}
