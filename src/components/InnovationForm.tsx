'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { generateLessonPlan, sendPlanEmail, FormData } from '@/app/actions/ai-engine'

// Constantes para as opções do formulário
const DISCIPLINES = [
    'Língua Portuguesa',
    'Matemática',
    'Ciências',
    'Geografia',
    'História',
    'Arte',
    'Educação Física',
    'Língua Inglesa',
    'Ensino Religioso',
    'Informática/Tecnologia',
    'Projeto Interdisciplinar',
]

const GRADES = [
    '1º ano - Fundamental',
    '2º ano - Fundamental',
    '3º ano - Fundamental',
    '4º ano - Fundamental',
    '5º ano - Fundamental',
    '6º ano - Fundamental',
    '7º ano - Fundamental',
    '8º ano - Fundamental',
    '9º ano - Fundamental',
    '1º ano - Ensino Médio',
    '2º ano - Ensino Médio',
    '3º ano - Ensino Médio',
]

const VIBES = [
    { id: 'high-tech', label: 'High-Tech', emoji: '💻', description: 'Uso de tecnologia, apps, realidade virtual' },
    { id: 'mao-na-massa', label: 'Mão na Massa', emoji: '🔧', description: 'Metodologia maker, construção, experimentos' },
    { id: 'social', label: 'Social', emoji: '🤝', description: 'Colaboração, comunidade, projetos em grupo' },
]

const SPACES = [
    'Sala de aula tradicional',
    'Laboratório de informática',
    'Laboratório de ciências',
    'Quadra esportiva',
    'Biblioteca',
    'Pátio/Área externa',
    'Sala multimídia',
    'Espaço maker/FabLab',
]

const GROUPINGS = [
    'Individual',
    'Duplas',
    'Pequenos grupos (3-5 alunos)',
    'Grandes grupos (6+ alunos)',
    'Turma inteira',
    'Misto (varia durante a aula)',
]

const CHALLENGES = [
    'Falta de engajamento/atenção',
    'Dificuldade de concentração',
    'Conflitos entre alunos',
    'Níveis de aprendizagem muito diferentes',
    'Resistência a atividades em grupo',
    'Uso excessivo de celular',
    'Falta de material/recursos',
    'Turma muito grande',
    'Turma muito pequena',
    'Alunos com necessidades especiais',
    'Nenhum desafio específico',
]

interface StepProps {
    formData: Partial<FormData>
    updateFormData: (data: Partial<FormData>) => void
    onNext: () => void
    onBack?: () => void
}

// Componente do Passo 1 - Identidade
function Step1Identity({ formData, updateFormData, onNext }: StepProps) {
    const isValid = formData.name && formData.name.length >= 2 && formData.expectation && formData.expectation.length >= 2

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">👋</span>
                <h2 className="text-2xl font-bold text-white">Vamos começar!</h2>
                <p className="text-gray-400 mt-2">Nos conte um pouco sobre você</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Qual é o seu nome?
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        placeholder="Digite seu nome completo"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        O que você espera da palestra de hoje?
                    </label>
                    <input
                        type="text"
                        value={formData.expectation || ''}
                        onChange={(e) => updateFormData({ expectation: e.target.value })}
                        placeholder="Uma palavra ou frase curta"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sua resposta aparecerá na nuvem de comunidade!</p>
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!isValid}
                className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300",
                    isValid
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                )}
            >
                Continuar →
            </button>
        </div>
    )
}

// Componente do Passo 2 - Contexto
function Step2Context({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.discipline && formData.grade && formData.content && formData.content.length >= 5

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">📚</span>
                <h2 className="text-2xl font-bold text-white">Contexto da Aula</h2>
                <p className="text-gray-400 mt-2">Para qual turma e conteúdo você quer planejar?</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Disciplina
                    </label>
                    <select
                        value={formData.discipline || ''}
                        onChange={(e) => updateFormData({ discipline: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                        <option value="" className="bg-gray-900">Selecione a disciplina</option>
                        {DISCIPLINES.map((d) => (
                            <option key={d} value={d} className="bg-gray-900">{d}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ano/Série
                    </label>
                    <select
                        value={formData.grade || ''}
                        onChange={(e) => updateFormData({ grade: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                        <option value="" className="bg-gray-900">Selecione o ano/série</option>
                        {GRADES.map((g) => (
                            <option key={g} value={g} className="bg-gray-900">{g}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Conteúdo/Tema da Aula
                    </label>
                    <textarea
                        value={formData.content || ''}
                        onChange={(e) => updateFormData({ content: e.target.value })}
                        placeholder="Ex: Frações equivalentes, Verbos no passado, Sistema solar..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Continuar →
                </button>
            </div>
        </div>
    )
}

// Componente do Passo 3 - Metodologia
function Step3Methodology({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.vibe && formData.grouping

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">🎯</span>
                <h2 className="text-2xl font-bold text-white">Metodologia</h2>
                <p className="text-gray-400 mt-2">Qual estilo de aula combina mais com você?</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Escolha a &quot;Vibe&quot; da aula
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {VIBES.map((vibe) => (
                            <button
                                key={vibe.id}
                                onClick={() => updateFormData({ vibe: vibe.id as FormData['vibe'] })}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all duration-300",
                                    formData.vibe === vibe.id
                                        ? "border-red-500 bg-red-500/10"
                                        : "border-white/10 bg-white/5 hover:border-white/30"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{vibe.emoji}</span>
                                    <div>
                                        <p className="font-bold text-white">{vibe.label}</p>
                                        <p className="text-sm text-gray-400">{vibe.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Agrupamento dos alunos
                    </label>
                    <select
                        value={formData.grouping || ''}
                        onChange={(e) => updateFormData({ grouping: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                        <option value="" className="bg-gray-900">Selecione o agrupamento</option>
                        {GROUPINGS.map((g) => (
                            <option key={g} value={g} className="bg-gray-900">{g}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Continuar →
                </button>
            </div>
        </div>
    )
}

// Componente do Passo 4 - Logística
function Step4Logistics({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.space && formData.challenge && formData.email && formData.email.includes('@')

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">📍</span>
                <h2 className="text-2xl font-bold text-white">Logística</h2>
                <p className="text-gray-400 mt-2">Onde e como será a aula?</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Espaço da aula
                    </label>
                    <select
                        value={formData.space || ''}
                        onChange={(e) => updateFormData({ space: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                        <option value="" className="bg-gray-900">Selecione o espaço</option>
                        {SPACES.map((s) => (
                            <option key={s} value={s} className="bg-gray-900">{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Principal desafio da turma
                    </label>
                    <select
                        value={formData.challenge || ''}
                        onChange={(e) => updateFormData({ challenge: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                        <option value="" className="bg-gray-900">Selecione o desafio</option>
                        {CHALLENGES.map((c) => (
                            <option key={c} value={c} className="bg-gray-900">{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Seu e-mail (para receber o plano)
                    </label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="seu.email@escola.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    🚀 Gerar Plano
                </button>
            </div>
        </div>
    )
}

// Componente principal do formulário
export function InnovationForm() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<Partial<FormData>>({})
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ plan?: string; error?: string; entryId?: string } | null>(null)
    const [emailSent, setEmailSent] = useState(false)

    const updateFormData = (data: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }

    const handleSubmit = () => {
        startTransition(async () => {
            const response = await generateLessonPlan(formData as FormData)
            if (response.success && response.plan) {
                setResult({ plan: response.plan, entryId: response.entryId })
                setStep(5) // Vai para tela de resultado
            } else {
                setResult({ error: response.error })
            }
        })
    }

    const handleSendEmail = () => {
        if (!result?.entryId || !formData.email || !result.plan || !formData.name) return

        startTransition(async () => {
            const response = await sendPlanEmail(result.entryId!, formData.email!, result.plan!, formData.name!)
            if (response.success) {
                setEmailSent(true)
            }
        })
    }

    // Tela de loading
    if (isPending) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-red-500/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                </div>
                <p className="mt-6 text-xl font-bold text-white">Gerando seu plano de aula...</p>
                <p className="mt-2 text-gray-400">Buscando inspiração nas melhores escolas do mundo 🌍</p>
            </div>
        )
    }

    // Tela de resultado
    if (step === 5 && result?.plan) {
        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🎉</span>
                    <h2 className="text-2xl font-bold text-white">Seu Plano está Pronto!</h2>
                    <p className="text-gray-400 mt-2">Confira abaixo e envie para seu e-mail</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-[400px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                            {result.plan}
                        </pre>
                    </div>
                </div>

                {!emailSent ? (
                    <button
                        onClick={handleSendEmail}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                        📧 Enviar para {formData.email}
                    </button>
                ) : (
                    <div className="text-center py-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-green-400 font-bold">✅ E-mail enviado com sucesso!</p>
                        <p className="text-gray-400 text-sm mt-1">Verifique sua caixa de entrada</p>
                    </div>
                )}

                <button
                    onClick={() => { setStep(1); setFormData({}); setResult(null); setEmailSent(false) }}
                    className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white transition-all"
                >
                    Criar outro plano
                </button>
            </div>
        )
    }

    // Erro
    if (result?.error) {
        return (
            <div className="text-center py-12">
                <span className="text-5xl mb-4 block">😔</span>
                <h2 className="text-2xl font-bold text-white">Ops! Algo deu errado</h2>
                <p className="text-gray-400 mt-2">{result.error}</p>
                <button
                    onClick={() => { setResult(null); setStep(4) }}
                    className="mt-6 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                    Tentar novamente
                </button>
            </div>
        )
    }

    // Indicador de progresso
    const Progress = () => (
        <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        s === step ? "bg-red-500 scale-125" : s < step ? "bg-red-500/50" : "bg-white/20"
                    )}
                />
            ))}
        </div>
    )

    return (
        <div className="max-w-md mx-auto">
            <Progress />

            {step === 1 && (
                <Step1Identity
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => setStep(2)}
                />
            )}

            {step === 2 && (
                <Step2Context
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <Step3Methodology
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                />
            )}

            {step === 4 && (
                <Step4Logistics
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleSubmit}
                    onBack={() => setStep(3)}
                />
            )}
        </div>
    )
}
