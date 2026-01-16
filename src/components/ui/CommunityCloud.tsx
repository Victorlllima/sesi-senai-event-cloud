'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ProfessorEntry } from '@/types';
import { useEffect, useState } from 'react';

interface CommunityCloudProps {
    entries: ProfessorEntry[];
}

interface CloudItem extends ProfessorEntry {
    x: number;
    y: number;
    size: number;
    color: string;
}

const COLORS = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-indigo-500',
];

export const CommunityCloud = ({ entries }: CommunityCloudProps) => {
    const [cloudItems, setCloudItems] = useState<CloudItem[]>([]);

    useEffect(() => {
        // Take the last 20 unique disciplines or entries
        const latestEntries = entries.slice(0, 15);

        const newItems = latestEntries.map((entry) => ({
            ...entry,
            x: Math.random() * 80 + 10, // 10% to 90%
            y: Math.random() * 80 + 10, // 10% to 90%
            size: Math.max(100, Math.random() * 150),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));

        setCloudItems(newItems);
    }, [entries]);

    return (
        <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-white/5 bg-black/20">
            <AnimatePresence>
                {cloudItems.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 0.8,
                            x: `${item.x}%`,
                            y: `${item.y}%`,
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-4 rounded-full flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md border border-white/20 animate-float`}
                        style={{
                            width: item.size,
                            height: item.size,
                            left: 0,
                            top: 0
                        }}
                    >
                        <div className={`absolute inset-0 rounded-full opacity-20 ${item.color} blur-xl`} />
                        <span className="font-bold text-sm md:text-base leading-tight relative z-10 drop-shadow-md">
                            {item.discipline}
                        </span>
                        <span className="text-[10px] opacity-60 relative z-10">
                            {item.name}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {entries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 uppercase tracking-widest text-sm">
                    Nuvem de Comunidade
                </div>
            )}
        </div>
    );
};
