import { supabase } from '@/lib/supabase'

// Listas de dados para simulação
const MOCK_NAMES = [
    'Ana', 'Carlos', 'Beatriz', 'João', 'Fernanda', 'Rafael', 'Mariana', 'Pedro', 'Lucas', 'Juliana',
    'Roberto', 'Camila', 'Bruno', 'Patricia', 'Gabriel', 'Larissa', 'Felipe', 'Vanessa', 'Thiago', 'Amanda',
    'Rodrigo', 'Carolina', 'Daniel', 'Letícia', 'Gustavo', 'Sofia', 'Eduardo', 'Isabela', 'Marcelo', 'Tatiana'
]

const MOCK_EXPECTATIONS = [
    'Motivação', 'Conhecimento', 'Inovação', 'Engajamento', 'Tecnologia', 'Aprendizado',
    'Futuro', 'Criatividade', 'Inspiracão', 'Prática', 'Transformação', 'Networking', 'IA'
]

export async function simulateEntry() {
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
    const expectation = MOCK_EXPECTATIONS[Math.floor(Math.random() * MOCK_EXPECTATIONS.length)]

    await supabase.from('professor_entries').insert({
        name: name,
        discipline: expectation
    })
}

export async function populate(count = 50) {
    console.log(`🚀 Iniciando inserção de ${count} participantes...`)
    for (let i = 0; i < count; i++) {
        simulateEntry()
        await new Promise(r => setTimeout(r, 150))
    }
    console.log('✅ Carga finalizada!')
}

export async function reset() {
    console.log('🗑️ Limpando banco de dados...')
    const { error } = await supabase
        .from('professor_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        console.error('Erro ao limpar:', error)
    } else {
        console.log('✨ Tela limpa!')
    }
}

if (typeof window !== 'undefined') {
    (window as any).simulate = simulateEntry;
    (window as any).populate = populate;
    (window as any).reset = reset;
}
