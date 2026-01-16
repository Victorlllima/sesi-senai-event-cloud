# Projeto: Nuvem de Comunidade SESI/SENAI

## Resumo
Aplicação de visualização em tempo real para evento SESI/SENAI using IA e Sustentabilidade. Exibe "Nuvem de Comunidade" alimentada via n8n (WhatsApp).

## Stack Técnica
- **Frontend:** Next.js 14 (App Router), TailwindCSS, Framer Motion
- **Backend:** Supabase (Database + Realtime)
- **Integração:** n8n (Insere dados no Supabase)

## Schema do Banco de Dados (Contrato com n8n)
Tabela: `professor_entries`
- `id` (uuid, primary key)
- `name` (text) - Nome do Professor
- `discipline` (text) - Disciplina
- `created_at` (timestamp)

## Notas Técnicas
- Setup do Banco realizado via MCP (Supabase Tool)


## Roadmap Completo

### FASE 1: Setup e Infraestrutura
**Status:** ✅ Completa
**Subtasks:**
- [x] Inicializar Next.js e GitFlow
- [x] Configurar conexão Supabase (Client)
- [x] Criar tabela `professor_entries` no Supabase

### FASE 2: Visualização em Tempo Real (O Telão)
**Status:** ✅ Concluído
**Subtasks:**
- [x] Criar hook `useRealtimeSubscription` para ouvir novos inserts
- [x] Criar componente `WordCloud` ou `LiveList`
- [x] Estilizar interface com identidade visual do evento (Moderno/Tech)

### FASE 3: Teste de Carga e Ajustes
**Status:** ✅ Concluído
**Subtasks:**
- [x] Simular inserções via script (mockando o n8n)
- [x] Ajustar animações e performance

## Comandos Úteis
```bash
# Rodar desenvolvimento
npm run dev

# Rodar simulação de entradas (Mock n8n)
node scripts/mock-inserts.js
```
Última Atualização: 2026-01-16 Atualizado por: Antigravity (IA)
