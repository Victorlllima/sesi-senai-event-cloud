'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ProfessorEntry } from '@/types';
import { User, BookOpen } from 'lucide-react';

interface LiveListProps {
    entries: ProfessorEntry[];
}

export const LiveList = ({ entries }: LiveListProps) => {
    return (
        <div className="flex flex-col gap-4 overflow-hidden h-full">
            <AnimatePresence initial={false}>
                {entries.slice(0, 10).map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        layout
                        className="glass p-4 rounded-xl flex items-center gap-4 group hover:bg-white/5 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <User size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg leading-tight">{entry.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <BookOpen size={14} />
                                <span>{entry.discipline}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <p>Aguardando mensagens...</p>
                </div>
            )}
        </div>
    );
};
