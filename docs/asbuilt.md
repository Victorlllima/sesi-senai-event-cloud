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

## Roadmap Completo

### FASE 1: Setup e Infraestrutura
**Status:** ⏳ Aguardando
**Subtasks:**
- [ ] Inicializar Next.js e GitFlow
- [ ] Configurar conexão Supabase (Client)
- [ ] Criar tabela `professor_entries` no Supabase

### FASE 2: Visualização em Tempo Real (O Telão)
**Status:** ⏳ Aguardando
**Subtasks:**
- [ ] Criar hook `useRealtimeSubscription` para ouvir novos inserts
- [ ] Criar componente `WordCloud` ou `LiveList`
- [ ] Estilizar interface com identidade visual do evento (Moderno/Tech)

### FASE 3: Teste de Carga e Ajustes
**Status:** ⏳ Aguardando
**Subtasks:**
- [ ] Simular inserções via script (mockando o n8n)
- [ ] Ajustar animações e performance

## Comandos Úteis
```bash
# Rodar desenvolvimento
npm run dev
```
Última Atualização: 2026-01-16 Atualizado por: J.A.R.V.I.S.
