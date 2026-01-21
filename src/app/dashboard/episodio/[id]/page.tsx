import { createServerClient } from "@/lib/supabase-server";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Tipagem dos Metadados
interface DocumentMetadata {
    titulo: string;
    pilar_inovacao?: string;
    gatilhos_comportamentais?: string[];
    gatilhos_conteudo?: string[];
    competencias_bncc?: string[];
    temporada?: number;
    episodio?: number;
}

export default async function EpisodeDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createServerClient();

    // Buscar documento pelo ID
    const { data: doc, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !doc) {
        console.error("Erro ao buscar episódio:", error);
        return notFound();
    }

    const meta = doc.metadata as DocumentMetadata;

    // Processamento de Dados
    const titleParts = meta.titulo?.split("-") || [meta.titulo];
    const schoolName = titleParts[0]?.trim();
    const country = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : "Localização não informada";

    // Imagem determinística baseada no ID
    const imageId = parseInt(doc.id as string) % 2 === 0 ? '1544396821-4dd40b938ad3' : '1503676260728-1c00da094a0b';
    const bgImage = `https://images.unsplash.com/photo-${imageId}?w=1200&h=600&fit=crop&q=80`;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
            {/* Header Hero */}
            <div className="relative h-[40vh] w-full bg-neutral-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-10 relative z-10">
                    <Link
                        href="/dashboard"
                        className="absolute top-8 left-4 inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar ao Atlas
                    </Link>

                    <div className="flex items-center gap-3 text-amber-400 font-semibold mb-2">
                        <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-sm">
                            {meta.pilar_inovacao || "Inovação"}
                        </span>
                        {meta.temporada && (
                            <span className="text-white/60 text-sm flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                T{meta.temporada} : E{meta.episodio}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                        {schoolName}
                    </h1>

                    <div className="flex items-center text-lg text-neutral-300">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        {country}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Coluna Principal - Conteúdo IA */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card: Resumo / Análise */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <PlayCircle className="w-6 h-6 text-primary" />
                                Sobre a Metodologia
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-4">
                                {/* Exibimos o content (resumo) que veio do banco */}
                                <p className="whitespace-pre-line">
                                    {doc.content}
                                </p>
                            </div>
                        </div>

                        {/* Seção BNCC */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <BookOpen className="w-6 h-6" />
                                Alinhamento BNCC
                            </h2>
                            <div className="grid gap-3">
                                {meta.competencias_bncc?.map((comp, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{comp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar de Informações */}
                    <div className="space-y-6">
                        {/* Card: Dores Resolvidas */}
                        <div className="bg-rose-50 dark:bg-rose-950/10 rounded-xl p-6 border border-rose-100 dark:border-rose-900/20">
                            <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-4 flex items-center">
                                🔥 Problemas Enfrentados
                            </h3>
                            <ul className="space-y-3">
                                {meta.gatilhos_comportamentais?.map((gatilho, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-rose-800 dark:text-rose-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        {gatilho}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Card: Áreas do Conhecimento */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/10 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900/20">
                            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center">
                                🧠 Áreas do Conhecimento
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {meta.gatilhos_conteudo?.map((area, i) => (
                                    <span key={i} className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-md font-medium shadow-sm">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
