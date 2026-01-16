'use client'

import '@/utils/mockSimulator'
import { useRealtimeProfessors } from '@/hooks/useRealtimeProfessors'
import { CommunityCloud } from '@/components/CommunityCloud'
import { motion } from 'framer-motion'

export default function Home() {
  const professors = useRealtimeProfessors()

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col items-center">
      {/* Cabeçalho */}
      <header className="w-full p-8 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            IA & Sustentabilidade
          </h1>
          <p className="text-slate-400 text-sm">Evento SESI/SENAI</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{professors.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Participantes</p>
        </div>
      </header>

      {/* Nuvem Central */}
      <div className="flex-1 w-full max-w-7xl relative">
        <CommunityCloud professors={professors} />

        {/* Placeholder se vazio */}
        {professors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700 opacity-50">
            <p className="text-2xl animate-pulse">Aguardando leituras do QR Code...</p>
          </div>
        )}
      </div>

      {/* Rodapé QR Code Call to Action */}
      <footer className="w-full p-6 text-center text-slate-500 text-sm border-t border-slate-800 bg-slate-900/50">
        <p>Participe! Leia o QR Code e diga seu Nome e Disciplina.</p>
      </footer>
    </main>
  )
}
