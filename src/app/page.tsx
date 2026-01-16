'use client';

import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { LiveList } from '@/components/ui/LiveList';
import { CommunityCloud } from '@/components/ui/CommunityCloud';
import { motion } from 'framer-motion';

export default function Home() {
  const { entries, loading } = useRealtimeSubscription();

  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-20 flex flex-col gap-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-gradient uppercase tracking-tighter"
          >
            SESI SENAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-medium"
          >
            Nuvem de Comunidade em Tempo Real
          </motion.p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-green-500">Live Connect</span>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-sm font-medium text-gray-400">
            {entries.length} Interações
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1">
        {/* Left Column: Word Cloud */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold uppercase tracking-wide">Nuvem de Disciplinas</h2>
          </div>
          <CommunityCloud entries={entries} />
        </section>

        {/* Right Column: Feed */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold uppercase tracking-wide">Interações Recentes</h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            <LiveList entries={entries} />
          </div>
        </section>
      </div>

      {/* Footer / Info */}
      <footer className="mt-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-500">
        <p>© 2026 SESI/SENAI - Visualização de Comunidade</p>
        <div className="flex gap-6 font-mono uppercase tracking-widest">
          <span>Envie via WhatsApp</span>
          <span className="text-primary">Status: {loading ? 'Carregando...' : 'Operacional'}</span>
        </div>
      </footer>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 -z-50 w-full h-full opacity-30">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>
    </main>
  );
}
