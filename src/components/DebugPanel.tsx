'use client'

import { useState, useEffect } from 'react'
import { populate, reset } from '@/utils/mockSimulator'

export function DebugPanel() {
    const [isVisible, setIsVisible] = useState(false)
    const [count, setCount] = useState(50)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        // Lógica para mostrar apenas em Dev/Hml (localhost ou preview vercel)
        const isProduction = process.env.NODE_ENV === 'production' && window.location.hostname === 'sesi-senai-event.com'

        setIsVisible(!isProduction)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Botão de Toggle (Engrenagem) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg border border-slate-600 transition-all font-sans"
                title="Painel de Simulação"
            >
                ⚙️
            </button>

            {/* Painel Expansível */}
            {isExpanded && (
                <div className="mt-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-xl w-64 animate-in slide-in-from-bottom-2 font-sans">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">
                        Painel de Teste (DEV)
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-300 block mb-1">Qtd. Participantes</label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={() => { populate(count); setIsExpanded(false); }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded transition-colors"
                        >
                            🚀 Simular Entrada
                        </button>

                        <button
                            onClick={() => { reset(); setIsExpanded(false); }}
                            className="w-full bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 text-sm font-bold py-2 rounded transition-colors"
                        >
                            🗑️ Limpar Tela
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
