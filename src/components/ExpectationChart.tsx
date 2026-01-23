'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Professor } from '@/hooks/useRealtimeProfessors';
import { useMemo } from 'react';

interface Props {
    professors: Professor[];
}

const COLORS = [
    '#F43F5E', // rose-500
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#A855F7', // purple-500
    '#F59E0B', // amber-500
    '#6B7280', // gray-500
];

export function ExpectationChart({ professors }: Props) {
    const data = useMemo(() => {
        const counts: Record<string, number> = {};

        professors.forEach((p) => {
            // Pegamos a palavra exata enviada (campo discipline no banco)
            const word = (p.discipline || 'Outros')
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Limpeza básica de acentos

            // Tratamento especial para siglas
            let displayWord: string;
            if (word === 'ia') {
                displayWord = 'IA';
            } else {
                // Capitalizamos a primeira letra para o gráfico
                displayWord = word.charAt(0).toUpperCase() + word.slice(1);
            }

            counts[displayWord] = (counts[displayWord] || 0) + 1;
        });

        // Ordenamos por frequência e pegamos as 5 principais
        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Se houver mais de 5, agrupamos o restante em "Outros"
        const top5 = sorted.map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }));

        const othersCount = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(5)
            .reduce((acc, [_, val]) => acc + val, 0);

        if (othersCount > 0) {
            top5.push({
                name: 'Outros',
                value: othersCount,
                color: COLORS[5]
            });
        }

        return top5;
    }, [professors]);

    if (professors.length === 0) return null;

    return (
        <div className="w-full h-[525px] bg-black/40 rounded-3xl p-8 shadow-2xl mt-20 mb-32 overflow-hidden border border-white/5">
            <div className="text-center mb-6">
                <h3 className="text-white text-xl font-bold uppercase tracking-widest">
                    Expectativa do Público
                </h3>
                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-tighter">
                    Baseado nas palavras enviadas pelos participantes
                </p>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                        label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', borderRadius: '12px', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
