'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Professor } from '@/hooks/useRealtimeProfessors'
import { useEffect, useRef } from 'react'

interface Props {
    professors: Professor[]
}

// Cores vibrantes para o tema Dark Tech do SENAI
const COLORS = [
    'bg-blue-600', 'bg-cyan-500', 'bg-emerald-500',
    'bg-violet-600', 'bg-fuchsia-500', 'bg-rose-500'
]

export function CommunityCloud({ professors }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-scroll suave se a tela encher
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [professors])

    return (
        <div className="flex flex-wrap gap-4 justify-center content-start p-8 min-h-[60vh]">
            <AnimatePresence>
                {professors.map((prof, index) => (
                    <motion.div
                        key={prof.id}
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
                        <span className="text-xl font-bold">{prof.name}</span>
                        <span className="text-xs uppercase tracking-wider opacity-90">{prof.discipline}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={bottomRef} />
        </div>
    )
}
