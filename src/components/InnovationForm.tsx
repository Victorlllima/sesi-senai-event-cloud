'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { generateInnovationPlan, sendPlanEmail, FormData } from '@/app/actions/ai-engine'

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
    { id: 'High-Tech', label: 'High-Tech', emoji: '💻', description: 'Apps, realidade virtual, plataformas digitais' },
    { id: 'Mão na Massa', label: 'Mão na Massa', emoji: '🔧', description: 'Maker, construção, experimentos práticos' },
    { id: 'Social', label: 'Social', emoji: '🤝', description: 'Colaboração, debates, projetos comunitários' },
]

const SPACES = [
    { id: 'Sala de Aula', label: 'Sala de Aula', emoji: '🏫' },
    { id: 'Laboratório de Informática', label: 'Lab de Informática', emoji: '💻' },
    { id: 'Laboratório de Ciências', label: 'Lab de Ciências', emoji: '🔬' },
    { id: 'Quadra Esportiva', label: 'Quadra', emoji: '⚽' },
    { id: 'Biblioteca', label: 'Biblioteca', emoji: '📚' },
    { id: 'Pátio/Área Externa', label: 'Pátio', emoji: '🌳' },
    { id: 'Sala Multimídia', label: 'Multimídia', emoji: '🎬' },
    { id: 'Espaço Maker/FabLab', label: 'FabLab', emoji: '🛠️' },
]

const GROUPINGS = [
    'Individual',
    'Duplas',
    'Pequenos grupos (3-5 alunos)',
    'Grandes grupos (6+ alunos)',
    'Turma inteira',
    'Misto (varia durante a aula)',
]

// Animações do Framer Motion
const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
}

interface StepProps {
    formData: Partial<FormData>
    updateFormData: (data: Partial<FormData>) => void
    onNext: () => void
    onBack?: () => void
}

// Passo 1 - Identidade
function Step1Identity({ formData, updateFormData, onNext }: StepProps) {
    const isValid = formData.name && formData.name.length >= 2 &&
        formData.email && formData.email.includes('@') &&
        formData.expectation && formData.expectation.length >= 2

    return (
        <motion.div
            key="step1"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">👋</span>
                <h2 className="text-2xl font-bold text-white">Bem-vindo ao Agente de Inovação</h2>
                <p className="text-gray-400 mt-2">Vamos criar um plano de aula incrível para você!</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Seu Nome
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        placeholder="Digite seu nome completo"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Seu E-mail
                    </label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="seu.email@escola.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        O que você espera desta experiência?
                    </label>
                    <input
                        type="text"
                        value={formData.expectation || ''}
                        onChange={(e) => updateFormData({ expectation: e.target.value })}
                        placeholder="Uma palavra ou frase curta (ex: Inovação, Motivação)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-blue-400 mt-1">✨ Sua resposta aparecerá na Nuvem de Comunidade!</p>
                </div>
            </div>

            <motion.button
                onClick={onNext}
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300",
                    isValid
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                )}
            >
                Próximo →
            </motion.button>
        </motion.div>
    )
}

// Passo 2 - Contexto Pedagógico
function Step2Pedagogical({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.discipline && formData.grade && formData.content && formData.content.length >= 5

    return (
        <motion.div
            key="step2"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">📚</span>
                <h2 className="text-2xl font-bold text-white">Contexto Pedagógico</h2>
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-gray-900">Selecione o ano/série</option>
                        {GRADES.map((g) => (
                            <option key={g} value={g} className="bg-gray-900">{g}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Conteúdo/Tema da Aula (Alinhamento BNCC)
                    </label>
                    <textarea
                        value={formData.content || ''}
                        onChange={(e) => updateFormData({ content: e.target.value })}
                        placeholder="Ex: Frações equivalentes, Verbos no passado, Sistema solar, Revolução Industrial..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </motion.button>
                <motion.button
                    onClick={onNext}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Próximo →
                </motion.button>
            </div>
        </motion.div>
    )
}

// Passo 3 - Vibe & Espaço
function Step3VibeSpace({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.vibe && formData.space

    return (
        <motion.div
            key="step3"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">🎯</span>
                <h2 className="text-2xl font-bold text-white">Vibe & Espaço</h2>
                <p className="text-gray-400 mt-2">Como você quer conduzir essa aula?</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Escolha a Vibe da Aula
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {VIBES.map((vibe) => (
                            <motion.button
                                key={vibe.id}
                                onClick={() => updateFormData({ vibe: vibe.id as FormData['vibe'] })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all duration-300",
                                    formData.vibe === vibe.id
                                        ? "border-blue-500 bg-blue-500/20"
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
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Espaço da Aula
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {SPACES.map((space) => (
                            <motion.button
                                key={space.id}
                                onClick={() => updateFormData({ space: space.id })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-center transition-all duration-300",
                                    formData.space === space.id
                                        ? "border-blue-500 bg-blue-500/20"
                                        : "border-white/10 bg-white/5 hover:border-white/30"
                                )}
                            >
                                <span className="text-2xl block mb-1">{space.emoji}</span>
                                <span className="text-xs text-white font-medium">{space.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </motion.button>
                <motion.button
                    onClick={onNext}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Próximo →
                </motion.button>
            </div>
        </motion.div>
    )
}

// Passo 4 - Desafio Humano
function Step4Challenge({ formData, updateFormData, onNext, onBack }: StepProps) {
    const isValid = formData.grouping && formData.challenge && formData.challenge.length >= 10

    return (
        <motion.div
            key="step4"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">🧠</span>
                <h2 className="text-2xl font-bold text-white">O Desafio Humano</h2>
                <p className="text-gray-400 mt-2">Nos conte sobre sua turma</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Como você prefere agrupar os alunos?
                    </label>
                    <select
                        value={formData.grouping || ''}
                        onChange={(e) => updateFormData({ grouping: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-gray-900">Selecione o agrupamento</option>
                        {GROUPINGS.map((g) => (
                            <option key={g} value={g} className="bg-gray-900">{g}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Qual o maior desafio comportamental dessa turma?
                    </label>
                    <textarea
                        value={formData.challenge || ''}
                        onChange={(e) => updateFormData({ challenge: e.target.value })}
                        placeholder="Ex: Alunos dispersos, falta de interesse, conflitos entre grupos, dificuldade de concentração..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Seja específico! Isso ajuda a personalizar as estratégias do plano.</p>
                </div>
            </div>

            <div className="flex gap-3">
                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
                >
                    ← Voltar
                </motion.button>
                <motion.button
                    onClick={onNext}
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    className={cn(
                        "flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300",
                        isValid
                            ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/25"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    🚀 Gerar Plano
                </motion.button>
            </div>
        </motion.div>
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
            const response = await generateInnovationPlan(formData as FormData)
            if (response.success && response.plan) {
                setResult({ plan: response.plan, entryId: response.entryId })
                setStep(5)
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

    // Tela de loading com animação
    if (isPending) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[500px] flex flex-col items-center justify-center text-center"
            >
                <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full"></div>
                </motion.div>
                <motion.p
                    className="mt-6 text-xl font-bold text-white"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Gerando seu plano de aula...
                </motion.p>
                <p className="mt-2 text-gray-400">Buscando inspiração nas melhores escolas do mundo 🌍</p>
            </motion.div>
        )
    }

    // Tela de resultado
    if (step === 5 && result?.plan) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center mb-8">
                    <motion.span
                        className="text-6xl block"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        🎉
                    </motion.span>
                    <h2 className="text-2xl font-bold text-white mt-4">Seu Plano está Pronto!</h2>
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
                    <motion.button
                        onClick={handleSendEmail}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                        📧 Enviar para {formData.email}
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                    >
                        <p className="text-green-400 font-bold">✅ E-mail enviado com sucesso!</p>
                        <p className="text-gray-400 text-sm mt-1">Verifique sua caixa de entrada</p>
                    </motion.div>
                )}

                <button
                    onClick={() => { setStep(1); setFormData({}); setResult(null); setEmailSent(false) }}
                    className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white transition-all"
                >
                    Criar outro plano
                </button>
            </motion.div>
        )
    }

    // Erro
    if (result?.error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
            >
                <span className="text-5xl mb-4 block">😔</span>
                <h2 className="text-2xl font-bold text-white">Ops! Algo deu errado</h2>
                <p className="text-gray-400 mt-2">{result.error}</p>
                <button
                    onClick={() => { setResult(null); setStep(4) }}
                    className="mt-6 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                    Tentar novamente
                </button>
            </motion.div>
        )
    }

    // Indicador de progresso
    const Progress = () => (
        <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <motion.div
                    key={s}
                    initial={false}
                    animate={{
                        scale: s === step ? 1.25 : 1,
                        backgroundColor: s === step ? '#3b82f6' : s < step ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    className="w-3 h-3 rounded-full"
                />
            ))}
        </div>
    )

    return (
        <div className="max-w-md mx-auto">
            <Progress />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <Step1Identity
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <Step2Pedagogical
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <Step3VibeSpace
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={() => setStep(4)}
                        onBack={() => setStep(2)}
                    />
                )}

                {step === 4 && (
                    <Step4Challenge
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleSubmit}
                        onBack={() => setStep(3)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
