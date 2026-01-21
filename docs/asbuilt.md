# Projeto: Nuvem de Comunidade SESI/SENAI

## Resumo
Aplicação de visualização em tempo real para evento SESI/SENAI using IA e Sustentabilidade. Exibe "Nuvem de Comunidade" alimentada via n8n (WhatsApp).
**Status:** 🚀 Em Produção / Publicado
**Repositório:** [https://github.com/Victorlllima/sesi-senai-event-cloud](https://github.com/Victorlllima/sesi-senai-event-cloud)
**URL de Produção:** [https://sesi-senai.vercel.app](https://sesi-senai.vercel.app)
**Ambiente de Homologação (Cliente):** [https://sesi-senai-git-hml-redpros-projects.vercel.app](https://sesi-senai-git-hml-redpros-projects.vercel.app)



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
- DebugPanel visível automaticamente em URLs contendo -hml (Homologação) e localhost.
- Componente CommunityCloud implementado com Framer Motion.
- Confete configurado para disparar apenas em novos inserts, utilizando paleta de cores do tema.
- DebugPanel adicionado no canto inferior direito. Oculto em produção via verificação de hostname.
- Hook useRealtimeProfessors atualizado para escutar eventos de DELETE, permitindo limpeza automática da tela sem refresh.
- Identidade da marca ICC e do Instituto.CC implementada.
- Deploy automatizado na Vercel com correção de variáveis de ambiente.
- Componente FlippingCard adicionado em `src/components/ui/flipping-card.tsx`.
- Extração de país implementada on-the-fly no frontend via string parsing do campo `titulo`.
- Utilitário `cn` (clsx + tailwind-merge) criado em `src/lib/utils.ts`.
- Supabase Server Client criado em `src/lib/supabase-server.ts` para Server Components.
- Padrão Smart-Client/Dumb-Server implementado no Dashboard para filtros instantâneos.
- Componente `DashboardClient` gerencia estado de filtros (País, Metodologia) no cliente.
- Função RPC `match_documents` criada no Supabase para busca vetorial por similaridade de cosseno.
- Busca híbrida implementada: Vetorial (Semantic Search via OpenAI) + Filtros Locais.
- Server Action `searchSchools` gera embeddings e consulta Supabase RPC.

## Histórico de Correções
- **Build Safe Supabase:** `supabase.ts` atualizado com valores de fallback para evitar falha crítica de build (`supabaseUrl is required`) durante a pré-renderização na Vercel.
- **Ambiente HML:** DebugPanel configurado para aparecer automaticamente em URLs de homologação (`-hml`).



## Roadmap Completo

### FASE 1: Setup e Infraestrutura
**Status:** ✅ Completa
**Subtasks:**
- [x] Inicializar Next.js e GitFlow
- [x] Configurar conexão Supabase (Client)
- [x] Criar tabela `professor_entries` no Supabase

### FASE 2: Visualização em Tempo Real (O Telão)
**Status:** ✅ Completa
**Subtasks:**
- [x] Criar hook `useRealtimeProfessors` para ouvir novos inserts
- [x] Criar componente `CommunityCloud`
- [x] Estilizar interface com identidade visual do evento (Moderno/Tech)
- [x] Implementar animação de confete (canvas-confetti)
- [x] Fix: Ajuste de path da Logo e brilho do placeholder.

### FASE 3: Teste de Carga e Ajustes
**Status:** ✅ Concluído
**Subtasks:**
- [x] Simular inserções via script (mockando o n8n)
- [x] Ajustar animações e performance
- [x] Implementar DebugPanel para simulação visual controlada pelo cliente

---

## 🆕 NOVO ROADMAP: Atlas de Inovação Educacional

### 📦 FASE 01: Ingestão RAG
**Status:** ✅ Completa
**Subtasks:**
- [x] Criar tabela `documents` com embedding vector(1536)
- [x] Desenvolver script `ingestao_rag.py` para popular banco
- [x] Validar estrutura de metadados no Supabase

### 📦 FASE 02: Interface do Dashboard
**Status:** `✅ Completa`
**Subtasks:**
- [x] Criar componente FlippingCard
- [x] Implementar grid inicial com dados do Supabase
- [x] Implementar página Dashboard com fetch no Supabase
- [x] Criar componente Client Side para Filtros
- [x] Refatorar Page para Server-Client Pattern
- [x] Adicionar filtros por pilar de inovação
- [x] Implementar busca semântica com RAG (Ver FASE 03)
- [x] Criar página de detalhes do episódio

**Decisão de Arquitetura:** Extração do campo 'País' feita no frontend via parsing do título ('Escola - País'). Padrão Smart-Client/Dumb-Server para filtros instantâneos.

### 📦 FASE 03: Sistema de Busca RAG
**Status:** `✅ Completa`
**Subtasks:**
- [x] Criar SQL `match_documents` para busca vetorial
- [x] Adicionar Input de Busca na UI
- [x] Integrar API OpenAI/Supabase para gerar embeddings de busca
- [x] Conectar busca semântica aos cards

**Arquitetura:** Server Action (`src/app/actions/search.ts`) + useTransition para UX suave.

### 📦 FASE 04: Detalhes e Navegação
**Status:** `✅ Completa`
**Subtasks:**
- [x] Criar rota dinâmica `/dashboard/episodio/[id]`
- [x] Conectar link "Ver Detalhes" no Dashboard
- [x] Buscar dados completos do Supabase (Content, BNCC, Metadados)
- [x] UX: Header Hero com imagem determinística e botões de navegação

---

## Como Testar
Para simular inserts:
1. Abra o projeto no navegador (`npm run dev`).
2. Abra o console do navegador (F12).
3. Digite `window.simulate()` para uma entrada única.
4. Digite `window.populate(50)` - Simula a entrada de 50 pessoas em sequência.
5. Digite `window.reset()` - Apaga todos os dados do banco e limpa a tela instantaneamente.

## Comandos Úteis
```bash
# Rodar desenvolvimento
npm run dev

# Rodar simulação de entradas (Mock n8n - Script Externo)
node scripts/mock-inserts.js

# Acessar Dashboard de Inovação
http://localhost:3000/dashboard
```

## Histórico de Sessões

| Data | Descrição | Status |
|------|-----------|--------|
| 2026-01-21 | Merge da feature de detalhes. Sistema funcional completo em `dev`. | ✅ Completa |
| 2026-01-21 | Página de Detalhes do Episódio (`/dashboard/episodio/[id]`) | ✅ Completa |
| 2026-01-21 | FASE 03 Completa: Server Action + OpenAI Embeddings + Busca Híbrida | ✅ Completa |
| 2026-01-21 | FASE 03: Função RPC match_documents + Input de Busca na UI | ✅ Completa |
| 2026-01-21 | Implementação Sidebar de Filtros (País, Metodologia) + Refatoração Server-Client | ✅ Completa |
| 2026-01-21 | Implementação UI Dashboard: FlippingCard + Grid + Conexão Supabase | ✅ Completa |
| 2026-01-21 | Ingestão RAG: 25 episódios indexados com embeddings | ✅ Completa |
| 2026-01-20 | Pivot para modelo RAG e planejamento Atlas Educacional | ✅ Completa |

---

Última Atualização: [2026-01-21 09:49] Atualizado por: ATLAS ⚙️
