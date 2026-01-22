export type ExpectationCategory = 'Motivação' | 'Conhecimento' | 'Inovação' | 'Engajamento' | 'Outros';

const categoryMap: Record<string, ExpectationCategory> = {
    // Motivação
    'motivacao': 'Motivação',
    'motivação': 'Motivação',
    'inspiracao': 'Motivação',
    'inspiração': 'Motivação',
    'animacao': 'Motivação',
    'empolgação': 'Motivação',
    'entusiasmo': 'Motivação',

    // Conhecimento
    'conhecimento': 'Conhecimento',
    'aprendizado': 'Conhecimento',
    'aprender': 'Conhecimento',
    'saber': 'Conhecimento',
    'estudo': 'Conhecimento',
    'tecnica': 'Conhecimento',
    'conteudo': 'Conhecimento',
    'conteúdo': 'Conhecimento',

    // Inovação
    'inovacao': 'Inovação',
    'inovação': 'Inovação',
    'tecnologia': 'Inovação',
    'futuro': 'Inovação',
    'criatividade': 'Inovação',
    'novo': 'Inovação',
    'novidade': 'Inovação',
    'ia': 'Inovação',

    // Engajamento
    'engajamento': 'Engajamento',
    'participacão': 'Engajamento',
    'interacão': 'Engajamento',
    'interação': 'Engajamento',
    'colaboração': 'Engajamento',
    'networking': 'Engajamento',
    'troca': 'Engajamento',
};

export function normalizeExpectation(word: string): ExpectationCategory {
    if (!word) return 'Outros';

    const normalized = word
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove accents

    // Check direct matches in map
    for (const [key, category] of Object.entries(categoryMap)) {
        const keyNormalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
            return category;
        }
    }

    return 'Outros';
}
