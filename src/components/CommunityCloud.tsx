'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ParticipanteEntry } from '@/lib/supabase'
import { useEffect, useRef } from 'react'
import { triggerSparkle } from '@/utils/confetti'

interface Props {
    participantes: ParticipanteEntry[]
}

const COLORS = [
    'bg-blue-600', 'bg-cyan-500', 'bg-emerald-500',
    'bg-violet-600', 'bg-fuchsia-500', 'bg-rose-500'
]

export function CommunityCloud({ participantes }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const prevCount = useRef(participantes.length)

    useEffect(() => {
        // Scroll automático
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

        // Disparar Confete APENAS se entrou alguém novo (ignorando load inicial vazio)
        if (participantes.length > prevCount.current && participantes.length > 0) {
            triggerSparkle()
        }

        // Atualizar referência
        prevCount.current = participantes.length
    }, [participantes])

    return (
        <div className="flex flex-wrap gap-4 justify-center content-start p-8 min-h-[60vh]">
            <AnimatePresence>
                {participantes.map((participante, index) => (
                    <motion.div
                        key={participante.id}
                        layout
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }}
                        className={`${COLORS[index % COLORS.length]} backdrop-blur-md bg-opacity-90 
              text-white px-6 py-3 rounded-full shadow-lg border border-white/20
              flex flex-col items-center justify-center cursor-default hover:scale-110 transition-transform duration-200`}
                    >
                        <span className="text-xl font-bold">{participante.nome}</span>
                        <span className="text-xs uppercase tracking-wider opacity-90">{participante.expectativa}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={bottomRef} />
        </div>
    )
}
