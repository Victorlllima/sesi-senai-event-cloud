const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const professors = [
    'Prof. Ricardo', 'Dra. Ana Paula', 'Mestre Silva', 'Prof. Fernanda',
    'Dr. Marcos', 'Profa. Juliana', 'Eng. Carlos', 'Dra. Beatriz'
];

const disciplines = [
    'Energias Renováveis', 'Inteligência Artificial', 'Automação Industrial',
    'Sustentabilidade', 'Economia Circular', 'Robótica Avançada',
    'Impressão 3D', 'IoT Aplicada', 'Cyber Segurança', 'Biotecnologia'
];

async function insertMock() {
    const name = professors[Math.floor(Math.random() * professors.length)];
    const discipline = disciplines[Math.floor(Math.random() * disciplines.length)];

    console.log(`Inserindo: ${name} - ${discipline}`);

    const { error } = await supabase
        .from('professor_entries')
        .insert([{ name, discipline }]);

    if (error) {
        console.error('Erro ao inserir:', error.message);
    } else {
        console.log('Inserido com sucesso!');
    }
}

// Inserir a cada 3 segundos
setInterval(insertMock, 3000);
console.log('Script de Mock iniciado. Pressione Ctrl+C para parar.');
