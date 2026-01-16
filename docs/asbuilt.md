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
- Componente CommunityCloud implementado com Framer Motion.
- Confete configurado para disparar apenas em novos inserts, utilizando paleta de cores do tema.
- DebugPanel adicionado no canto inferior direito. Oculto em produção via verificação de hostname.
- Hook useRealtimeProfessors atualizado para escutar eventos de DELETE, permitindo limpeza automática da tela sem refresh.

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

### FASE 3: Teste de Carga e Ajustes
**Status:** ✅ Concluído
**Subtasks:**
- [x] Simular inserções via script (mockando o n8n)
- [x] Ajustar animações e performance
- [x] Implementar DebugPanel para simulação visual controlada pelo cliente

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
```
Última Atualização: 2026-01-16 Atualizado por: Antigravity (IA)
