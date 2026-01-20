# Workflows do Projeto

Este diretório contém os workflows de automação utilizados no projeto.

## n8n Workflows

### `agente-facilitador.json`

**Descrição:** Workflow do n8n que implementa o Agente Facilitador para a dinâmica pedagógica.

**Funcionalidades:**
- Recebe mensagens via WhatsApp (Evolution API)
- Captura expectativas dos participantes
- Insere dados em tempo real na tabela `participantes_palestra` do Supabase
- Gerencia o fluxo de Credenciamento e Mentoria BNCC
- Fase 2: Dinâmica pedagógica com tema escolhido coletivamente

**Integração:**
- **WhatsApp:** Evolution API
- **Database:** Supabase (`participantes_palestra`)
- **IA:** OpenAI GPT
- **Memory:** Postgres Chat Memory
- **Cache:** Redis

**Como Usar:**
1. Importe o arquivo `agente-facilitador.json` no n8n
2. Configure as credenciais:
   - Evolution API (WhatsApp)
   - Supabase
   - OpenAI
   - PostgreSQL (para memória de conversação)
   - Redis (para cache)
3. Ative o workflow
4. Configure o webhook na Evolution API para apontar para o endpoint do n8n

**Estrutura do Fluxo:**
1. Webhook recebe mensagem do WhatsApp
2. Verifica se é mensagem do cliente (não do bot)
3. Busca ou cria cliente no Supabase
4. Processa mensagem com AI Agent
5. Salva expectativa do participante
6. Retorna resposta via WhatsApp

**Notas:**
- Originalmente baseado no template "Agente vendedor Arcogeek"
- Adaptado para o contexto de palestra pedagógica SESI/SENAI
- Utiliza buffer de mensagens para evitar duplicatas
- Memória de conversação por cliente

**Última Atualização:** 2026-01-20
