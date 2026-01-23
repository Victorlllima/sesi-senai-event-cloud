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
    email: string
    expectation: string

    // Passo 2 - Contexto Pedagógico
    discipline: string
    grade: string
    content: string

    // Passo 3 - Vibe & Espaço
    vibe: 'High-Tech' | 'Mão na Massa' | 'Social'
    space: string

    // Passo 4 - Desafio
    grouping: string
    challenge: string
}

// Busca vetorial no Atlas de Inovação (Tabela documents)
async function searchInnovativeSchools(queryText: string): Promise<string> {
    const supabase = await createServerClient()

    try {
        // Gerar embedding para busca semântica
        const embeddingRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: queryText,
            encoding_format: 'float',
        })
        const [{ embedding }] = embeddingRes.data

        // Busca Vetorial no Atlas de Inovação
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 3,
        })

        if (error) {
            console.error('Erro na busca vetorial:', error)
            return ''
        }

        if (!documents || documents.length === 0) {
            return ''
        }

        // Formatar contexto das escolas com título
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

// Server Action principal - substitui o nó "AI Agent1" do n8n
export async function generateInnovationPlan(formData: FormData): Promise<{
    success: boolean
    plan?: string
    error?: string
    entryId?: string
}> {
    try {
        const supabase = await createServerClient()

        // 1. RAG: Busca Vetorial baseada na 'Vibe', Espaço e Desafio
        const queryText = `${formData.vibe} ${formData.space} ${formData.challenge}`
        const context = await searchInnovativeSchools(queryText)

        // 2. Prompt de Coordenador Pedagógico (Extraído do nó 'AI Agent1')
        const systemPrompt = `Você é um Coordenador Pedagógico Sênior especializado em T&D (Treinamento e Desenvolvimento).

Use este contexto de escolas inovadoras para enriquecer suas recomendações:
${context || 'Sem contexto específico disponível.'}

# Sua Missão
Gerar um Plano de Aula completo e inovador que o professor possa aplicar imediatamente.

# Estrutura Obrigatória (Padrão Nova Escola)

## 1. ACOLHIDA SCRIPTADA (5-10 min)
Script exato do que o professor deve dizer/fazer ao iniciar a aula.
Inclua uma dinâmica de aquecimento relacionada ao tema.

## 2. QUESTÃO DISPARADORA
Uma pergunta provocativa que engaje os alunos e conecte com suas vivências.
Deve gerar curiosidade e debate inicial.

## 3. MÃO NA MASSA (Mínimo 500 palavras)
Descrição detalhada da atividade principal:
- Passo a passo numerado
- Materiais necessários
- Como organizar os grupos/espaços
- Papel do professor durante a atividade
- Possíveis intervenções e mediações
- Variações para diferentes níveis

## 4. SISTEMATIZAÇÃO (10-15 min)
Como fechar a aula:
- Síntese coletiva do aprendizado
- Registro individual ou em grupo
- Conexão com próximas aulas

## 5. RESUMO DE IMPACTO
Um parágrafo final motivacional explicando como esta aula pode transformar a experiência de aprendizagem.

# Regras de Geração
1. Cite as escolas inovadoras que inspiraram as práticas (quando aplicável)
2. Considere o desafio comportamental informado e ofereça estratégias específicas
3. Adapte ao espaço físico disponível
4. Use linguagem acessível e motivadora
5. Seja ESPECÍFICO - o professor deve poder aplicar amanhã`

        const userPrompt = `Gere um Plano de Aula completo (em Markdown) para:

**Contexto**
- Disciplina: ${formData.discipline}
- Série/Ano: ${formData.grade}
- Tema/Conteúdo: ${formData.content}

**Metodologia**
- Estilo (Vibe): ${formData.vibe}
- Espaço físico: ${formData.space}
- Agrupamento: ${formData.grouping}

**Desafio da Turma**
${formData.challenge}

---

Por favor, siga rigorosamente a estrutura: Acolhida Scriptada, Questão Disparadora, Mão na Massa (mínimo 500 palavras) e Sistematização. Finalize com o Resumo de Impacto.`

        // 3. Geração com GPT-4o
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
        })

        const planMarkdown = completion.choices[0]?.message?.content || ''

        if (!planMarkdown) {
            return { success: false, error: 'Não foi possível gerar o plano de aula.' }
        }

        // 4. Inserção para Realtime e Registro (dispara confetes no Dashboard)
        const { data: entry, error: insertError } = await supabase
            .from('professor_entries')
            .insert({
                name: formData.name,
                discipline: formData.expectation, // Alimenta a Nuvem de Comunidade
                email: formData.email,
                grade: formData.grade,
                content: formData.content,
                vibe: formData.vibe,
                space: formData.space,
                grouping: formData.grouping,
                challenge: formData.challenge,
                lesson_plan_markdown: planMarkdown,
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

// Enviar e-mail com o plano (Template CSS Inline do n8n)
export async function sendPlanEmail(entryId: string, email: string, planMarkdown: string, professorName: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createServerClient()

        // Converter Markdown para HTML básico
        const planHtml = planMarkdown
            .replace(/^### (.*$)/gim, '<h3 style="color: #0056b3; margin-top: 20px; font-size: 16px;">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 style="color: #0056b3; margin-top: 28px; font-size: 20px; border-bottom: 2px solid #0056b3; padding-bottom: 8px;">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 style="color: #0056b3; font-size: 24px; margin-bottom: 15px;">$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li style="margin: 6px 0; margin-left: 20px;">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li style="margin: 8px 0; margin-left: 20px; list-style-type: decimal;">$1</li>')
            .replace(/\n\n/gim, '</p><p style="margin: 12px 0; line-height: 1.8;">')
            .replace(/\n/gim, '<br>')

        // Template de E-mail de Impacto (CSS Inline do n8n)
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Plano de Aula Inovador</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; padding: 40px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border-top: 8px solid #0056b3; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #0056b3; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚀 Seu Plano de Aula Chegou!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Inspirado no Atlas de Inovação Educacional</p>
        </div>
        
        <!-- Greeting -->
        <div style="padding: 30px 30px 0 30px;">
            <p style="color: #333; font-size: 16px; margin: 0;">
                Olá, <strong>${professorName}</strong>! 👋
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 15px 0;">
                Preparamos um plano de aula exclusivo para você, baseado nas suas respostas e inspirado nas práticas das melhores escolas inovadoras do mundo.
            </p>
        </div>
        
        <!-- Divider -->
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 30px;">
        
        <!-- Content -->
        <div style="padding: 0 30px 30px 30px; line-height: 1.8; color: #333;">
            <p style="margin: 12px 0; line-height: 1.8;">
                ${planHtml}
            </p>
        </div>
        
        <!-- CTA -->
        <div style="background: #eaf7ff; padding: 20px 30px; border-left: 4px solid #0056b3; margin: 0 30px 30px 30px;">
            <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>💡 Dica:</strong> Adapte este plano à realidade da sua turma! Você conhece seus alunos melhor do que ninguém.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #333; color: #888; padding: 20px 30px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Agente de Inovação Pedagógica | Instituto.CC</p>
            <p style="margin: 8px 0 0 0; color: #666;">SESI | SENAI - Transformando a Educação</p>
        </div>
    </div>
</body>
</html>`

        // Enviar e-mail via Resend
        const { error: emailError } = await resend.emails.send({
            from: 'Agente de Inovação <meajuda@oinstituto.cc>',
            to: email,
            subject: `🚀 Seu Plano de Aula Chegou, ${professorName}!`,
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
