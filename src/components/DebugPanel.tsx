'use client'

import { useState, useEffect } from 'react'
import { populate, reset } from '@/utils/mockSimulator'

export function DebugPanel() {
    const [isVisible, setIsVisible] = useState(false)
    const [count, setCount] = useState(10)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const isDev = process.env.NODE_ENV !== 'production'

        // Verifica se tem ?debug=true na URL
        const isDebugQuery = typeof window !== 'undefined' && window.location.search.includes('debug=true')

        // Verifica se é ambiente de Homologação (HML)
        // A Vercel gera URLs tipo: projeto-git-hml-usuario.vercel.app
        const isHml = typeof window !== 'undefined' && window.location.hostname.includes('-hml')

        // Mostra se for: Localhost OU Homologação OU tiver ?debug=true
        setIsVisible(isDev || isHml || isDebugQuery)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Botão de Toggle (Engrenagem) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-white hover:bg-gray-200 text-black p-3 rounded-full shadow-lg border border-slate-600 transition-all"
                title="Painel de Simulação"
            >
                ⚙️
            </button>

            {/* Painel Expansível */}
            {isExpanded && (
                <div className="mt-2 bg-icc-black/90 backdrop-blur-md border border-gray-700 p-4 rounded-lg shadow-xl w-64 animate-in slide-in-from-bottom-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                        Painel de Teste (HML/ADMIN)
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-300 block mb-1">Qtd. Participantes</label>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-white outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-300 block mb-1">Status da API</label>
                            <div className="text-[10px] text-gray-500 font-mono bg-black/50 p-1 rounded border border-gray-800">
                                {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('hfy') ? '✅ Conectado' : '⚠️ Erro de Config'}
                            </div>
                        </div>

                        <button
                            onClick={() => { populate(count); setIsExpanded(false); }}
                            className="w-full bg-white hover:bg-gray-200 text-black text-sm font-bold py-2 rounded transition-colors"
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
