'use client'

import { useRealtimeProfessors } from '@/hooks/useRealtimeProfessors'
import { CommunityCloud } from '@/components/CommunityCloud'
import { ExpectationChart } from '@/components/ExpectationChart'
import { DebugPanel } from '@/components/DebugPanel'
import Image from 'next/image'
import '@/utils/mockSimulator'

export default function Home() {
  const professors = useRealtimeProfessors()

  return (
    <main className="h-screen bg-icc-black text-white flex flex-col relative selection:bg-icc-red selection:text-white overflow-hidden">

      {/* Background Grid Sutil (Fixo ao fundo) */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#212121_1px,transparent_1px),linear-gradient(to_bottom,#212121_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* SEÇÃO FIXA SUPERIOR (Cabeçalho + QR Code) */}
      <div className="w-full bg-icc-black/80 backdrop-blur-md z-50 border-b border-white/10 flex flex-col pt-6 pb-6 shadow-2xl shrink-0 min-h-[350px] relative">

        <header className="w-full px-12 flex justify-between items-start max-w-full">
          {/* BLOCO ORIGINAL (Canto Superior Esquerdo) - Itens centralizados entre si */}
          <div className="flex flex-col gap-2 items-center">
            <div className="relative w-48 h-14 filter invert opacity-90">
              <Image src="/assets/logo-icc.png" alt="Instituto.CC" fill className="object-contain object-center" priority />
            </div>
            <p className="text-icc-light/50 text-xs font-heading tracking-widest uppercase pl-3 border-l-4 border-red-500 text-center">
              SUSTENTABILIDADE NA PRÁTICA PEDAGÓGICA
            </p>
            <p className="text-gray-400 text-sm font-semibold tracking-tight text-center">
              SESI/SENAI
            </p>
          </div>

          {/* QR Code Quadrado - Centralizado de forma absoluta para alinhar perfeitamente com o centro da tela (e o gráfico abaixo) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
            <div className="relative w-64 h-64 bg-white p-3 rounded-2xl shadow-[0_0_60px_rgba(237,28,36,0.3)] border-4 border-icc-red transition-all duration-500 hover:scale-105">
              <Image src="/assets/qrcode.png" alt="QR Code" fill className="object-contain" priority />
            </div>
            <div className="mt-3 px-6 py-1.5 bg-icc-red/20 backdrop-blur-md rounded-full border border-icc-red/30">
              <p className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">
                Escaneie para participar
              </p>
            </div>
          </div>

          {/* Contador (Canto Superior Direito) */}
          <div className="text-right flex flex-col items-end">
            <div>
              <p className="text-5xl font-heading font-bold text-white leading-none">{professors.length}</p>
              <p className="text-[10px] text-icc-red uppercase tracking-[0.3em] font-black mt-1">Participantes</p>
            </div>
          </div>
        </header>
      </div>

      {/* ÁREA DE CONTEÚDO ROLÁVEL - Independente */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center scroll-smooth custom-scrollbar z-10">

        {/* Nuvem de Participantes (Nomes flutuam aqui, abaixo do QR Code) */}
        <div className="w-full max-w-[98vw] py-12 relative min-h-[50vh]">
          <CommunityCloud professors={professors} />
        </div>

        {/* Mensagem Aguardando - Centralizada na tela, some com o primeiro participante */}
        {professors.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <p className="text-3xl font-heading font-bold text-white/30 animate-pulse tracking-widest">
              AGUARDANDO DADOS...
            </p>
          </div>
        )}

        {/* Seção do Gráfico (Aumentado em 50% no componente) */}
        <div className="w-full max-w-6xl px-12 mb-40">
          <ExpectationChart professors={professors} />
        </div>

        {/* Rodapé Interno ao Scroll */}
        <footer className="w-full p-12 flex flex-col justify-center items-center gap-6 text-center border-t border-white/5 bg-black/40">
          <div className="flex items-center gap-6">
            <div className="h-px w-32 bg-icc-red/30"></div>
            <p className="text-neutral-500 text-xs tracking-[0.8em] uppercase font-bold">Inovação • Conexão • Transformação</p>
            <div className="h-px w-32 bg-icc-red/30"></div>
          </div>
          <p className="text-[11px] text-zinc-600">© 2026 Instituto.CC | SESI SENAI Atlas Educacional</p>
        </footer>
      </div>

      <DebugPanel />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(237, 28, 36, 0.4);
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(237, 28, 36, 0.6);
        }
      `}</style>
    </main>
  )
}
