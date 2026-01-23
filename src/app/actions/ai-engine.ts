'use server'

import { createServerClient } from '@/lib/supabase-server'
import OpenAI from 'openai'
import { Resend } from 'resend'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const resend = new Resend(process.env.RESEND_API_KEY)

// Tipos para o formulário
export interface FormData {
    // Passo 1 - Identidade
    name: string
    expectation: string // discipline no banco

    // Passo 2 - Contexto
    discipline: string // Disciplina real (Matemática, Português, etc.)
    grade: string
    content: string

    // Passo 3 - Metodologia
    vibe: 'high-tech' | 'mao-na-massa' | 'social'
    grouping: string

    // Passo 4 - Logística
    space: string
    challenge: string
    email: string
}

// Prompt do sistema baseado na estrutura Nova Escola
const SYSTEM_PROMPT = `Você é um especialista em inovação pedagógica e criação de planos de aula inspirados nas melhores escolas inovadoras do mundo.

# Seu Objetivo
Criar um plano de aula personalizado, prático e inspirador que o professor possa aplicar imediatamente em sua sala de aula.

# Contexto das Escolas Inovadoras
Você tem acesso a um banco de conhecimento com práticas de escolas inovadoras ao redor do mundo. Use essas referências para enriquecer o plano.

# Estrutura do Conteúdo (Padrão Nova Escola)

## 1. SOBRE ESTA AULA
- Título criativo e engajador
- Objetivo de aprendizagem (verbo de ação + conteúdo + contexto)
- Habilidades BNCC contempladas
- Tempo estimado

## 2. MATERIAIS NECESSÁRIOS
- Lista objetiva de materiais
- Alternativas low-cost quando possível

## 3. DESENVOLVIMENTO
### Aquecimento (10-15 min)
- Atividade de engajamento inicial
- Perguntas disparadoras

### Desenvolvimento (30-40 min)
- Descrição detalhada da atividade principal
- Passo a passo claro
- Dicas de mediação para o professor

### Fechamento (10-15 min)
- Síntese do aprendizado
- Avaliação formativa

## 4. VARIAÇÕES E ADAPTAÇÕES
- Para turmas com mais/menos tempo
- Para diferentes níveis de engajamento
- Para inclusão de alunos com necessidades especiais

## 5. RESUMO DE IMPACTO
Um parágrafo motivacional explicando como esta aula pode transformar a experiência de aprendizagem dos alunos.

---

# Regras de Geração
1. Seja ESPECÍFICO e PRÁTICO - o professor deve poder aplicar amanhã
2. Use linguagem acessível e motivadora
3. Sempre conecte com a realidade brasileira
4. Cite a escola inovadora que inspirou a metodologia (quando aplicável)
5. Considere o desafio comportamental informado e ofereça estratégias
6. Adapte ao espaço físico disponível
7. O plano deve ter entre 800-1200 palavras`

// Busca vetorial no Supabase
async function searchInnovativeSchools(query: string): Promise<string> {
    const supabase = await createServerClient()

    try {
        // Gerar embedding da query
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
            encoding_format: 'float',
        })

        const queryEmbedding = embeddingResponse.data[0].embedding

        // Buscar documentos similares
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: 3,
        })

        if (error) {
            console.error('Erro na busca vetorial:', error)
            return ''
        }

        if (!documents || documents.length === 0) {
            return ''
        }

        // Formatar contexto das escolas
        const context = documents.map((doc: { content: string; metadata: { titulo?: string } }) => {
            const title = doc.metadata?.titulo || 'Escola Inovadora'
            return `### ${title}\n${doc.content}`
        }).join('\n\n---\n\n')

        return context
    } catch (err) {
        console.error('Erro ao buscar escolas:', err)
        return ''
    }
}

// Gerar plano de aula
export async function generateLessonPlan(formData: FormData): Promise<{
    success: boolean
    plan?: string
    error?: string
    entryId?: string
}> {
    try {
        const supabase = await createServerClient()

        // 1. Construir query para RAG
        const ragQuery = `${formData.vibe} ${formData.space} ${formData.challenge} ${formData.discipline} ${formData.content}`

        // 2. Buscar contexto das escolas inovadoras
        const schoolsContext = await searchInnovativeSchools(ragQuery)

        // 3. Construir prompt do usuário
        const userPrompt = `# Dados do Professor e Contexto

## Identificação
- **Nome do Professor:** ${formData.name}
- **Expectativa para a palestra:** ${formData.expectation}

## Contexto da Aula
- **Disciplina:** ${formData.discipline}
- **Ano/Série:** ${formData.grade}
- **Conteúdo/Tema BNCC:** ${formData.content}

## Metodologia Desejada
- **Estilo (Vibe):** ${formData.vibe === 'high-tech' ? 'High-Tech (uso de tecnologia)' : formData.vibe === 'mao-na-massa' ? 'Mão na Massa (maker/hands-on)' : 'Social (colaborativo/comunidade)'}
- **Agrupamento:** ${formData.grouping}

## Logística
- **Espaço da Aula:** ${formData.space}
- **Desafio Comportamental:** ${formData.challenge}

${schoolsContext ? `
## Referências de Escolas Inovadoras (RAG)
${schoolsContext}
` : ''}

---

Por favor, crie um plano de aula completo seguindo a estrutura definida.`

        // 4. Chamar GPT-4o
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        })

        const planMarkdown = completion.choices[0]?.message?.content || ''

        if (!planMarkdown) {
            return { success: false, error: 'Não foi possível gerar o plano de aula.' }
        }

        // 5. Inserir no banco de dados (dispara Realtime)
        const { data: entry, error: insertError } = await supabase
            .from('professor_entries')
            .insert({
                name: formData.name,
                discipline: formData.expectation, // Campo original usado para expectativa
                grade: formData.grade,
                content: formData.content,
                vibe: formData.vibe,
                space: formData.space,
                challenge: formData.challenge,
                email: formData.email,
                plan_markdown: planMarkdown,
                plan_sent: false,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('Erro ao inserir entrada:', insertError)
            return { success: false, error: 'Erro ao salvar os dados.' }
        }

        return {
            success: true,
            plan: planMarkdown,
            entryId: entry?.id,
        }
    } catch (err) {
        console.error('Erro ao gerar plano:', err)
        return { success: false, error: 'Erro interno ao gerar o plano de aula.' }
    }
}

// Enviar e-mail com o plano
export async function sendPlanEmail(entryId: string, email: string, planMarkdown: string, professorName: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createServerClient()

        // Converter Markdown para HTML básico
        const planHtml = planMarkdown
            .replace(/^### (.*$)/gim, '<h3 style="color: #ED1C24; margin-top: 24px;">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 style="color: #1a1a1a; margin-top: 32px; border-bottom: 2px solid #ED1C24; padding-bottom: 8px;">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 style="color: #ED1C24; font-size: 28px;">$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li style="margin: 8px 0;">$1</li>')
            .replace(/\n/gim, '<br>')

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Plano de Aula Personalizado</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎓 Seu Plano de Aula Personalizado</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Instituto.CC | SESI SENAI</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <p style="font-size: 16px; color: #333;">Olá, <strong>${professorName}</strong>!</p>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Preparamos um plano de aula exclusivo para você, baseado nas suas respostas e inspirado nas melhores práticas de escolas inovadoras ao redor do mundo.
            </p>
            
            <div style="background-color: #fafafa; border-left: 4px solid #ED1C24; padding: 24px; margin: 24px 0; border-radius: 8px;">
                ${planHtml}
            </div>
            
            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 32px;">
                Este plano foi gerado com IA e revisado com base em práticas pedagógicas inovadoras.<br>
                Adapte conforme a realidade da sua turma!
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                Agente de Inovação | Instituto.CC<br>
                © 2026 - Transformando a Educação
            </p>
        </div>
    </div>
</body>
</html>`

        // Enviar e-mail via Resend
        const { error: emailError } = await resend.emails.send({
            from: 'Agente de Inovação <meajuda@oinstituto.cc>',
            to: email,
            subject: `🎓 Seu Plano de Aula Personalizado - ${professorName}`,
            html: emailHtml,
        })

        if (emailError) {
            console.error('Erro ao enviar e-mail:', emailError)
            return { success: false, error: 'Erro ao enviar o e-mail.' }
        }

        // Atualizar flag no banco
        await supabase
            .from('professor_entries')
            .update({ plan_sent: true })
            .eq('id', entryId)

        return { success: true }
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err)
        return { success: false, error: 'Erro interno ao enviar o e-mail.' }
    }
}
