import { InnovationForm } from '@/components/InnovationForm'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
    title: 'Gerar Plano de Aula | Instituto.CC',
    description: 'Crie um plano de aula personalizado inspirado nas melhores escolas inovadoras do mundo.',
}

export default function GerarPlanoPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/assets/ICC-Logo.png"
                            alt="Instituto.CC"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div className="hidden sm:block">
                            <p className="text-white font-bold text-sm">INSTITUTO.CC</p>
                            <p className="text-gray-500 text-xs">SESI | SENAI</p>
                        </div>
                    </Link>

                    <div className="text-right">
                        <p className="text-red-500 font-bold text-sm tracking-wide">AGENTE DE INOVAÇÃO</p>
                        <p className="text-gray-500 text-xs">Planos de Aula com IA</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                            Crie seu <span className="text-red-500">Plano de Aula</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Inspirado nas melhores escolas inovadoras do mundo 🌍
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <InnovationForm />
                    </div>

                    {/* Footer info */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-xs">
                            Desenvolvido com IA • Baseado em práticas de escolas inovadoras
                        </p>
                        <p className="text-gray-700 text-xs mt-1">
                            Seus dados são usados apenas para gerar o plano de aula
                        </p>
                    </div>
                </div>
            </div>

            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
        </main>
    )
}
