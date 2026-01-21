"""
==============================================================================
INGESTÃO RAG - Pipeline de Vetorização para Supabase
==============================================================================

Etapa 3 do Pipeline de Ingestão:
- Input: Arquivos .json estruturados (./Videos/json_finais)
- Output: Dados vetorizados na tabela `documents` do Supabase

Utiliza:
- OpenAI (text-embedding-3-small) para gerar embeddings
- Supabase Client para inserção no banco vetorial

Autor: Pipeline de Dados SESI-SENAI
Data: 2026-01-21
==============================================================================
"""

import os
import json
import glob
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

# Carrega variáveis de ambiente
load_dotenv(".env.local")

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

# Diretório de entrada (JSONs estruturados)
INPUT_DIR = Path("./Videos/json_finais")

# Modelo de embedding da OpenAI
EMBEDDING_MODEL = "text-embedding-3-small"

# Dimensão do embedding (text-embedding-3-small = 1536)
EMBEDDING_DIMENSION = 1536

# ============================================================================
# FUNÇÕES DE CONEXÃO
# ============================================================================

def get_supabase_client() -> Client:
    """
    Inicializa e retorna o cliente Supabase.
    
    Returns:
        Cliente Supabase configurado
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError(
            "❌ SUPABASE_URL e/ou SUPABASE_KEY não encontradas!\n"
            "   Configure no arquivo .env.local"
        )
    
    return create_client(url, key)


def get_openai_client() -> OpenAI:
    """
    Inicializa e retorna o cliente OpenAI.
    
    Returns:
        Cliente OpenAI configurado
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise ValueError(
            "❌ OPENAI_API_KEY não encontrada!\n"
            "   Configure no arquivo .env.local"
        )
    
    return OpenAI(api_key=api_key)


# ============================================================================
# FUNÇÕES DE PROCESSAMENTO
# ============================================================================

def gerar_embedding(client: OpenAI, texto: str) -> list[float]:
    """
    Gera o embedding vetorial para um texto.
    
    Args:
        client: Cliente OpenAI
        texto: Texto para vetorizar
        
    Returns:
        Lista de floats representando o vetor
    """
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texto
    )
    
    return response.data[0].embedding


def carregar_json(caminho: Path) -> dict:
    """
    Carrega e retorna o conteúdo de um arquivo JSON.
    
    Args:
        caminho: Path para o arquivo JSON
        
    Returns:
        Dicionário com os dados do JSON
    """
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def inserir_documento(
    supabase: Client, 
    content: str, 
    metadata: dict, 
    embedding: list[float]
) -> dict:
    """
    Insere um documento na tabela `documents` do Supabase.
    
    Args:
        supabase: Cliente Supabase
        content: Texto do conteúdo
        metadata: Metadados do documento
        embedding: Vetor de embedding
        
    Returns:
        Resposta da inserção
    """
    data = {
        "content": content,
        "metadata": metadata,
        "embedding": embedding
    }
    
    response = supabase.table("documents").insert(data).execute()
    
    return response


def verificar_documento_existe(supabase: Client, titulo: str) -> bool:
    """
    Verifica se um documento com o mesmo título já existe no banco.
    
    Args:
        supabase: Cliente Supabase
        titulo: Título do documento
        
    Returns:
        True se existe, False caso contrário
    """
    response = supabase.table("documents")\
        .select("id")\
        .eq("metadata->>titulo", titulo)\
        .execute()
    
    return len(response.data) > 0


# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

def main():
    """
    Função principal do pipeline de ingestão RAG.
    
    Itera sobre todos os arquivos JSON na pasta de entrada,
    gera embeddings e insere no Supabase.
    """
    print("=" * 60)
    print("🚀 INGESTÃO RAG - Pipeline de Vetorização")
    print("   Destino: Supabase (tabela: documents)")
    print("=" * 60)
    
    # -------------------------------------------------------------------------
    # 1. Inicializar clientes
    # -------------------------------------------------------------------------
    print("\n📡 Inicializando conexões...")
    
    try:
        supabase = get_supabase_client()
        print("   ✅ Supabase conectado")
    except ValueError as e:
        print(f"   {e}")
        return
    
    try:
        openai_client = get_openai_client()
        print(f"   ✅ OpenAI conectado (modelo: {EMBEDDING_MODEL})")
    except ValueError as e:
        print(f"   {e}")
        return
    
    # -------------------------------------------------------------------------
    # 2. Listar arquivos JSON
    # -------------------------------------------------------------------------
    if not INPUT_DIR.exists():
        print(f"\n❌ Diretório de entrada não encontrado: {INPUT_DIR}")
        return
    
    arquivos_json = list(INPUT_DIR.glob("*.json"))
    total_arquivos = len(arquivos_json)
    
    if total_arquivos == 0:
        print(f"\n⚠️ Nenhum arquivo JSON encontrado em: {INPUT_DIR}")
        return
    
    print(f"\n📄 Arquivos encontrados: {total_arquivos}")
    print("-" * 60)
    
    # -------------------------------------------------------------------------
    # 3. Processar cada arquivo
    # -------------------------------------------------------------------------
    inseridos = 0
    ignorados = 0
    erros = 0
    
    for idx, arquivo in enumerate(arquivos_json, 1):
        nome_arquivo = arquivo.name
        
        print(f"\n[{idx}/{total_arquivos}] 📝 Processando: {nome_arquivo}")
        
        try:
            # Carregar JSON
            dados = carregar_json(arquivo)
            
            # Extrair campos
            content = dados.get("pageContent", "")
            metadata = dados.get("metadata", {})
            titulo = metadata.get("titulo", "Sem título")
            
            if not content:
                print(f"   ⚠️ Campo 'pageContent' vazio, ignorando...")
                ignorados += 1
                continue
            
            # Verificar se já existe
            if verificar_documento_existe(supabase, titulo):
                print(f"   ⏭️ Documento já existe: {titulo}")
                ignorados += 1
                continue
            
            # Gerar embedding
            print(f"   🧠 Gerando embedding ({len(content)} chars)...")
            embedding = gerar_embedding(openai_client, content)
            print(f"   📊 Vetor gerado: {len(embedding)} dimensões")
            
            # Inserir no Supabase
            print(f"   💾 Inserindo no Supabase...")
            response = inserir_documento(supabase, content, metadata, embedding)
            
            print(f"   ✅ Inserido com sucesso!")
            print(f"   📊 Título: {titulo}")
            print(f"   📊 Temporada: {metadata.get('temporada', 'N/A')}, Episódio: {metadata.get('episodio', 'N/A')}")
            
            inseridos += 1
            
        except json.JSONDecodeError as e:
            print(f"   ❌ ERRO ao parsear JSON: {e}")
            erros += 1
            continue
            
        except Exception as e:
            print(f"   ❌ ERRO: {type(e).__name__}: {e}")
            erros += 1
            continue
    
    # -------------------------------------------------------------------------
    # 4. Resumo final
    # -------------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("📊 RESUMO DA INGESTÃO")
    print("=" * 60)
    print(f"   ✅ Inseridos: {inseridos}/{total_arquivos}")
    print(f"   ⏭️ Ignorados (já existem ou vazios): {ignorados}/{total_arquivos}")
    print(f"   ❌ Erros: {erros}/{total_arquivos}")
    print(f"   📁 Fonte: {INPUT_DIR}")
    print(f"   🎯 Destino: Supabase → tabela 'documents'")
    print("=" * 60)
    
    if inseridos > 0:
        print("\n🎉 Ingestão concluída com sucesso!")
        print("   Os documentos estão prontos para busca semântica (RAG).")


# ============================================================================
# EXECUÇÃO
# ============================================================================

if __name__ == "__main__":
    main()
