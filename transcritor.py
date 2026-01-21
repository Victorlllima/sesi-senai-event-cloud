#!/usr/bin/env python3
"""
Transcritor de Áudio em Lote usando OpenAI Whisper API
Compatível com Python 3.13+ (sem dependência de audioop/pydub)

Autor: ATLAS (Método S.H.A.R.K.)
Data: 2026-01-20
"""

import os
import sys
import shutil
import tempfile
import subprocess
import math
from pathlib import Path
from typing import List, Optional, Tuple

# ============================================================
# 1. SETUP DO STATIC-FFMPEG
# ============================================================
def setup_ffmpeg() -> Optional[str]:
    """
    Configura o static-ffmpeg e retorna o caminho do executável.
    """
    try:
        import static_ffmpeg
        ffmpeg_path, ffprobe_path = static_ffmpeg.run.get_or_fetch_platform_executables_else_raise()
        print(f"✅ FFmpeg configurado: {ffmpeg_path}")
        return ffmpeg_path, ffprobe_path
    except ImportError:
        print("❌ Erro: static-ffmpeg não instalado. Execute: pip install static-ffmpeg")
        return None, None
    except Exception as e:
        print(f"❌ Erro ao configurar FFmpeg: {e}")
        return None, None

FFMPEG_PATH, FFPROBE_PATH = setup_ffmpeg()
if not FFMPEG_PATH:
    sys.exit(1)

# ============================================================
# 2. CONFIGURAÇÃO DA API OPENAI
# ============================================================
from openai import OpenAI

API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    print("=" * 60)
    print("⚠️  OPENAI_API_KEY não encontrada nas variáveis de ambiente.")
    print("=" * 60)
    print("\nCole sua chave abaixo:")
    API_KEY = input("API Key: ").strip()
    
    if not API_KEY:
        print("❌ Nenhuma chave fornecida. Encerrando.")
        sys.exit(1)

client = OpenAI(api_key=API_KEY)

# ============================================================
# 3. CONFIGURAÇÕES DO SCRIPT
# ============================================================
VIDEOS_FOLDER = Path("./Videos")
OUTPUT_FOLDER = Path("./Videos/transcricoes")
CHUNK_DURATION_SECONDS = 600  # 10 minutos
SUPPORTED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac"]

# ============================================================
# 4. FUNÇÕES DE ÁUDIO (SEM PYDUB)
# ============================================================

def get_audio_duration(audio_path: Path) -> float:
    """
    Obtém a duração do áudio em segundos usando ffprobe.
    """
    cmd = [
        FFPROBE_PATH,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(audio_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return float(result.stdout.strip())


def split_audio_ffmpeg(audio_path: Path, chunk_duration_sec: int, temp_dir: Path) -> List[Path]:
    """
    Divide um arquivo de áudio em chunks usando FFmpeg diretamente.
    """
    print(f"  📂 Analisando áudio: {audio_path.name}")
    
    try:
        total_duration = get_audio_duration(audio_path)
    except Exception as e:
        print(f"  ❌ Erro ao obter duração: {e}")
        return []
    
    duration_min = total_duration / 60
    print(f"  ⏱️  Duração total: {duration_min:.1f} minutos")
    
    num_chunks = math.ceil(total_duration / chunk_duration_sec)
    chunks = []
    
    for i in range(num_chunks):
        start_time = i * chunk_duration_sec
        chunk_filename = temp_dir / f"chunk_{i:03d}.mp3"
        
        cmd = [
            FFMPEG_PATH,
            "-y",  # Sobrescrever sem perguntar
            "-i", str(audio_path),
            "-ss", str(start_time),
            "-t", str(chunk_duration_sec),
            "-acodec", "libmp3lame",
            "-ab", "128k",
            "-ar", "16000",  # 16kHz é ideal para Whisper
            "-ac", "1",  # Mono
            str(chunk_filename)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and chunk_filename.exists():
            chunks.append(chunk_filename)
        else:
            print(f"  ⚠️ Erro no chunk {i}: {result.stderr[:200] if result.stderr else 'desconhecido'}")
    
    print(f"  ✂️  Dividido em {len(chunks)} chunk(s)")
    return chunks


def get_audio_files(folder: Path) -> List[Path]:
    """
    Retorna lista de arquivos de áudio suportados na pasta especificada.
    """
    if not folder.exists():
        print(f"❌ Pasta '{folder}' não encontrada!")
        return []
    
    files = []
    for ext in SUPPORTED_EXTENSIONS:
        files.extend(folder.glob(f"*{ext}"))
    
    return sorted(files)


def transcribe_chunk(chunk_path: Path) -> Optional[str]:
    """
    Envia um chunk para a API Whisper e retorna a transcrição.
    """
    try:
        with open(chunk_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
                language="pt"
            )
        return response
    except Exception as e:
        print(f"    ❌ Erro ao transcrever {chunk_path.name}: {e}")
        return None


def transcribe_audio_file(audio_path: Path, output_folder: Path) -> bool:
    """
    Processa um arquivo de áudio completo.
    """
    print(f"\n{'='*60}")
    print(f"🎧 Processando: {audio_path.name}")
    print(f"{'='*60}")
    
    temp_dir = Path(tempfile.mkdtemp(prefix="transcricao_"))
    
    try:
        # 1. Dividir o áudio em chunks
        chunks = split_audio_ffmpeg(audio_path, CHUNK_DURATION_SECONDS, temp_dir)
        
        if not chunks:
            print("  ❌ Nenhum chunk criado!")
            return False
        
        # 2. Transcrever cada chunk
        transcriptions = []
        for i, chunk_path in enumerate(chunks, 1):
            print(f"  🎤 Transcrevendo chunk {i}/{len(chunks)}...", end=" ", flush=True)
            
            text = transcribe_chunk(chunk_path)
            if text:
                transcriptions.append(text.strip())
                print("✅")
            else:
                transcriptions.append("[ERRO NA TRANSCRIÇÃO DESTE TRECHO]")
                print("⚠️")
        
        # 3. Concatenar transcrições
        full_transcription = "\n\n".join(transcriptions)
        
        # 4. Salvar resultado
        output_folder.mkdir(parents=True, exist_ok=True)
        output_file = output_folder / f"{audio_path.stem}.txt"
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# Transcrição: {audio_path.name}\n")
            f.write(f"# Chunks processados: {len(chunks)}\n")
            f.write("=" * 60 + "\n\n")
            f.write(full_transcription)
        
        print(f"\n  💾 Salvo em: {output_file}")
        return True
        
    except Exception as e:
        print(f"\n  ❌ Erro fatal ao processar {audio_path.name}: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # 5. Limpeza
        try:
            shutil.rmtree(temp_dir)
            print(f"  🧹 Chunks temporários removidos")
        except Exception as e:
            print(f"  ⚠️ Aviso: Não foi possível limpar temp: {e}")


def main():
    """
    Função principal.
    """
    print("\n" + "=" * 60)
    print("🎙️  TRANSCRITOR DE ÁUDIO EM LOTE - OpenAI Whisper")
    print("    (Compatível com Python 3.13+)")
    print("=" * 60)
    
    audio_files = get_audio_files(VIDEOS_FOLDER)
    
    if not audio_files:
        print(f"\n❌ Nenhum arquivo de áudio encontrado em '{VIDEOS_FOLDER}'")
        print(f"   Extensões suportadas: {', '.join(SUPPORTED_EXTENSIONS)}")
        return
    
    print(f"\n📁 Pasta de entrada: {VIDEOS_FOLDER.absolute()}")
    print(f"📁 Pasta de saída: {OUTPUT_FOLDER.absolute()}")
    print(f"\n🔍 Encontrados {len(audio_files)} arquivo(s):")
    for f in audio_files:
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"   • {f.name} ({size_mb:.1f} MB)")
    
    success_count = 0
    fail_count = 0
    
    for audio_file in audio_files:
        try:
            if transcribe_audio_file(audio_file, OUTPUT_FOLDER):
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"\n❌ Erro inesperado em {audio_file.name}: {e}")
            fail_count += 1
    
    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL")
    print("=" * 60)
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ❌ Falhas:  {fail_count}")
    print(f"   📁 Transcrições salvas em: {OUTPUT_FOLDER.absolute()}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
