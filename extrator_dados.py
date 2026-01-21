"""
==============================================================================
EXTRATOR DE DADOS - Pipeline ETL para Série "Destino: Educação"
==============================================================================

Etapa 2 do Pipeline de Ingestão:
- Input: Arquivos .txt de transcrições (./Videos/transcricoes)
- Output: Arquivos .json estruturados (./Videos/json_finais)

Utiliza a API da OpenAI (gpt-4o ou gpt-4o-mini) para extrair "Cédulas de Inovação"
estruturadas seguindo o padrão de metadados para Supabase.

Autor: Pipeline de Dados SESI-SENAI
Data: 2026-01-21
==============================================================================
"""

import os
import json
import re
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

# Diretórios de entrada e saída
INPUT_DIR = Path("./Videos/transcricoes")
OUTPUT_DIR = Path("./Videos/json_finais")

# Modelo da OpenAI
MODEL = "gpt-4o-mini"  # Pode usar "gpt-4o" para maior qualidade

# ============================================================================
# SYSTEM PROMPT - Design Instrucional e BNCC
# ============================================================================

SYSTEM_PROMPT = """Você é um Especialista em Design Instrucional e BNCC.
Sua tarefa é analisar a transcrição de uma aula/episódio da série "Destino: Educação" e extrair uma "Cédula de Inovação" estruturada.

SAÍDA OBRIGATÓRIA (JSON):
Você deve retornar um JSON com apenas dois campos principais raiz:
1. "pageContent": Um texto rico e bem escrito (em markdown) resumindo a metodologia da escola, como ela funciona na prática e qual problema resolve. Este texto será usado para vetorização (busca semântica).
2. "metadata": Um objeto JSON contendo os metadados para filtros.

ESTRUTURA DO JSON:
{
  "pageContent": "Texto corrido descrevendo a escola, a metodologia (ex: gamificação, pbl), o ritual da aula e como isso impacta os alunos...",
  "metadata": {
    "titulo": "String (Nome da Escola - Cidade/País)",
    "temporada": Int (Inferir do contexto ou nome do arquivo, padrão 1),
    "episodio": Int (Inferir do contexto ou nome do arquivo),
    "pilar_inovacao": "String (Ex: Gestão Democrática, Cultura Digital)",
    "gatilhos_comportamentais": ["String", "String"], (Ex: 'bullying', 'apatia', 'falta de engajamento'),
    "gatilhos_conteudo": ["String", "String"], (Ex: 'Física', 'História', 'Projetos de Vida'),
    "competencias_bncc": ["String", "String"] (Ex: 'Competência 5 - Cultura Digital')
  }
}

INSTRUÇÕES IMPORTANTES:
1. O "pageContent" deve ser um texto em markdown de 3-5 parágrafos, rico em detalhes sobre a metodologia.
2. Identifique o pilar de inovação principal (ex: Autonomia do Aluno, Aprendizagem por Projetos, Gestão Democrática, etc.)
3. Liste gatilhos comportamentais que a escola resolve (problemas que educadores enfrentam).
4. Liste gatilhos de conteúdo (áreas do conhecimento trabalhadas de forma inovadora).
5. Relacione competências da BNCC que a metodologia desenvolve.
6. Infira temporada e episódio do nome do arquivo (T1E1 = Temporada 1, Episódio 1).
7. Retorne SOMENTE o JSON válido, sem texto adicional."""


# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def extrair_temporada_episodio(nome_arquivo: str) -> tuple[int, int]:
    """
    Extrai temporada e episódio do nome do arquivo.
    Formato esperado: T1E1 - Nome da Escola...
    
    Args:
        nome_arquivo: Nome do arquivo de transcrição
        
    Returns:
        Tupla (temporada, episodio)
    """
    # Regex para capturar T{num}E{num}
    match = re.match(r'T(\d+)E(\d+)', nome_arquivo)
    if match:
        return int(match.group(1)), int(match.group(2))
    return 1, 1  # Padrão se não encontrar


def ler_transcricao(caminho_arquivo: Path) -> str:
    """
    Lê o conteúdo de um arquivo de transcrição.
    
    Args:
        caminho_arquivo: Path para o arquivo .txt
        
    Returns:
        Conteúdo do arquivo como string
    """
    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
        return f.read()


def salvar_json(dados: dict, caminho_saida: Path) -> None:
    """
    Salva dados estruturados em arquivo JSON.
    
    Args:
        dados: Dicionário com os dados extraídos
        caminho_saida: Path para o arquivo .json de saída
    """
    with open(caminho_saida, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


def processar_com_openai(client: OpenAI, transcricao: str, nome_arquivo: str) -> dict:
    """
    Processa a transcrição usando a API da OpenAI.
    
    Args:
        client: Cliente OpenAI configurado
        transcricao: Texto da transcrição
        nome_arquivo: Nome do arquivo para contexto
        
    Returns:
        Dicionário com pageContent e metadata
    """
    # Extrair informações do nome do arquivo para contexto adicional
    temporada, episodio = extrair_temporada_episodio(nome_arquivo)
    
    # Construir mensagem do usuário com contexto
    user_message = f"""Analise a seguinte transcrição do episódio da série "Destino: Educação":

ARQUIVO: {nome_arquivo}
TEMPORADA: {temporada}
EPISÓDIO: {episodio}

=== TRANSCRIÇÃO ===
{transcricao}
=== FIM DA TRANSCRIÇÃO ===

Extraia a Cédula de Inovação conforme o formato JSON especificado."""

    # Chamar API com response_format JSON
    response = client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3,  # Baixa temperatura para respostas mais consistentes
        max_tokens=4000
    )
    
    # Parsear resposta JSON
    json_response = json.loads(response.choices[0].message.content)
    
    return json_response


# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

def main():
    """
    Função principal do pipeline ETL.
    
    Itera sobre todos os arquivos .txt na pasta de transcrições,
    processa cada um com a API da OpenAI e salva o resultado como JSON.
    """
    print("=" * 60)
    print("🚀 EXTRATOR DE DADOS - Pipeline ETL")
    print("   Série: Destino Educação - Escolas Inovadoras")
    print("=" * 60)
    
    # Verificar se a chave da API está configurada
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n❌ ERRO: OPENAI_API_KEY não encontrada!")
        print("   Configure a variável de ambiente ou adicione ao .env.local")
        return
    
    # Inicializar cliente OpenAI
    client = OpenAI(api_key=api_key)
    print(f"\n✅ Cliente OpenAI inicializado (modelo: {MODEL})")
    
    # Verificar/criar diretório de saída
    if not OUTPUT_DIR.exists():
        OUTPUT_DIR.mkdir(parents=True)
        print(f"📁 Diretório de saída criado: {OUTPUT_DIR}")
    else:
        print(f"📁 Diretório de saída: {OUTPUT_DIR}")
    
    # Verificar diretório de entrada
    if not INPUT_DIR.exists():
        print(f"\n❌ ERRO: Diretório de entrada não encontrado: {INPUT_DIR}")
        return
    
    # Listar arquivos .txt
    arquivos_txt = list(INPUT_DIR.glob("*.txt"))
    total_arquivos = len(arquivos_txt)
    
    if total_arquivos == 0:
        print(f"\n⚠️ Nenhum arquivo .txt encontrado em: {INPUT_DIR}")
        return
    
    print(f"\n📄 Arquivos encontrados: {total_arquivos}")
    print("-" * 60)
    
    # Contadores de sucesso/erro
    processados = 0
    erros = 0
    
    # Processar cada arquivo
    for idx, arquivo in enumerate(arquivos_txt, 1):
        nome_arquivo = arquivo.stem  # Nome sem extensão
        arquivo_saida = OUTPUT_DIR / f"{nome_arquivo}.json"
        
        print(f"\n[{idx}/{total_arquivos}] 📝 Processando: {arquivo.name}")
        
        try:
            # Ler transcrição
            transcricao = ler_transcricao(arquivo)
            print(f"   📖 Transcrição lida ({len(transcricao):,} caracteres)")
            
            # Processar com OpenAI
            print(f"   🤖 Enviando para OpenAI ({MODEL})...")
            resultado = processar_com_openai(client, transcricao, nome_arquivo)
            
            # Salvar JSON
            salvar_json(resultado, arquivo_saida)
            print(f"   ✅ Salvo: {arquivo_saida.name}")
            
            # Log de metadados extraídos
            if "metadata" in resultado:
                meta = resultado["metadata"]
                print(f"   📊 Título: {meta.get('titulo', 'N/A')}")
                print(f"   📊 Pilar: {meta.get('pilar_inovacao', 'N/A')}")
            
            processados += 1
            
        except json.JSONDecodeError as e:
            print(f"   ❌ ERRO ao parsear JSON: {e}")
            erros += 1
            continue
            
        except Exception as e:
            print(f"   ❌ ERRO: {type(e).__name__}: {e}")
            erros += 1
            continue
    
    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO DO PROCESSAMENTO")
    print("=" * 60)
    print(f"   ✅ Processados com sucesso: {processados}/{total_arquivos}")
    print(f"   ❌ Erros: {erros}/{total_arquivos}")
    print(f"   📁 Arquivos JSON em: {OUTPUT_DIR}")
    print("=" * 60)


# ============================================================================
# EXECUÇÃO
# ============================================================================

if __name__ == "__main__":
    main()
