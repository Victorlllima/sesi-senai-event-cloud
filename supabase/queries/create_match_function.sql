-- ============================================================================
-- Função de Busca Vetorial: match_documents
-- ============================================================================
-- Descrição: Busca documentos por similaridade de cosseno usando embeddings
-- Modelo: text-embedding-3-small (1536 dimensões)
-- Uso: SELECT * FROM match_documents(query_embedding, 0.7, 10);
-- ============================================================================

create or replace function match_documents (
  query_embedding vector(1536), -- Assumindo modelo text-embedding-3-small ou ada-002
  match_threshold float,
  match_count int,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  -- Lógica simples para aplicar filtros se existirem (opcional por enquanto)
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
