'use client'

import { useRealtimeParticipantes } from '@/hooks/useRealtimeParticipantes'
import { CommunityCloud } from '@/components/CommunityCloud'
import { DebugPanel } from '@/components/DebugPanel'
import Image from 'next/image'
import '@/utils/mockSimulator'

export default function Home() {
  const participantes = useRealtimeParticipantes()

  return (
    <main className="min-h-screen bg-icc-black text-white overflow-hidden flex flex-col items-center relative selection:bg-icc-red selection:text-white">

      {/* Background Grid Sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#212121_1px,transparent_1px),linear-gradient(to_bottom,#212121_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Cabeçalho */}
      <header className="w-full p-8 flex justify-between items-end border-b border-white/10 z-10 bg-gradient-to-b from-black to-transparent">
        <div className="flex flex-col gap-2">
          {/* Logo com Invert Filter para ficar branca */}
          <div className="relative w-48 h-14 filter invert opacity-90">
            <Image
              src="/assets/logo-icc.png"
              alt="Instituto.CC"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <p className="text-icc-light/50 text-xs font-heading tracking-widest uppercase pl-1 border-l-2 border-icc-red">
            SUSTENTABILIDADE NA PRÁTICA PEDAGÓGICA
          </p>
          <p className="text-gray-400 text-sm font-semibold tracking-tight pl-1 mt-1">
            SESI/SENAI
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-heading font-bold text-white">{participantes.length}</p>
          <p className="text-[10px] text-icc-red uppercase tracking-[0.3em] font-bold">Participantes</p>
        </div>
      </header>

      {/* Nuvem Central */}
      <div className="flex-1 w-full max-w-[90vw] relative flex items-center">
        <CommunityCloud participantes={participantes} />

        {/* Placeholder (AGORA MAIS VISÍVEL) */}
        {participantes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-80">
            <p className="text-4xl font-heading font-bold tracking-tighter animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              AGUARDANDO DADOS
            </p>
            <p className="text-sm font-bold uppercase tracking-[0.5em] mt-4 text-icc-red">
              Leia o QR Code
            </p>
          </div>
        )}
      </div>

      {/* Rodapé Minimalista */}
      <footer className="w-full p-6 flex justify-center items-center gap-4 text-center z-10">
        <div className="h-px w-12 bg-icc-red/50"></div>
        <p className="text-neutral-500 text-xs tracking-widest uppercase">Escaneie • Conecte • Transforme</p>
        <div className="h-px w-12 bg-icc-red/50"></div>
      </footer>

      <DebugPanel />
    </main>
  )
}
