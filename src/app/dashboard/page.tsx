import { createServerClient } from "@/lib/supabase-server";
import { FlippingCard } from "@/components/ui/flipping-card";
import { Lightbulb, AlertCircle } from "lucide-react";

// Tipagem baseada na validação que fizemos do banco
interface DocumentMetadata {
    titulo: string;
    pilar_inovacao: string;
    gatilhos_comportamentais: string[];
    competencias_bncc: string[];
    pais?: string;
}

interface SchoolDoc {
    id: string;
    metadata: DocumentMetadata;
}

export default async function DashboardPage() {
    const supabase = await createServerClient();

    // Buscar documentos
    const { data: documents, error } = await supabase
        .from("documents")
        .select("id, metadata")
        .limit(50);

    if (error) {
        console.error("Erro ao buscar documentos:", error);
    }

    const cardsData = (documents as SchoolDoc[] | null)?.map((doc) => {
        const meta = doc.metadata;

        // Extração de País (Lógica on-the-fly)
        // Ex: "Projeto Âncora - Brasil" -> ["Projeto Âncora", "Brasil"]
        const titleParts = meta.titulo?.split("-") || [meta.titulo];
        const schoolName = titleParts[0]?.trim();
        const country = titleParts[1]?.trim() || "Local não informado";

        return {
            id: doc.id,
            front: {
                title: schoolName,
                subtitle: country,
                tag: meta.pilar_inovacao || "Inovação",
            },
            back: {
                description: `Resolve problemas como: ${(meta.gatilhos_comportamentais || []).slice(0, 3).join(", ")}`,
                details: meta.competencias_bncc?.slice(0, 2).join(" • "),
                buttonText: "Ver Análise Completa",
            },
        };
    }) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="container mx-auto py-10 px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Atlas de Inovação Educacional
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Explore metodologias inovadoras de escolas ao redor do mundo
                    </p>
                </div>

                {cardsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="w-16 h-16 text-slate-600 mb-4" />
                        <p className="text-slate-400 text-lg">
                            Nenhum episódio encontrado no banco de dados.
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                            Verifique se a tabela &quot;documents&quot; possui dados.
                        </p>
                    </div>
                ) : (
                    <div className="flex gap-6 flex-wrap justify-center">
                        {cardsData.map((card) => (
                            <FlippingCard
                                key={card.id}
                                width={320}
                                height={360}
                                frontContent={
                                    <div className="flex flex-col h-full w-full p-4">
                                        {/* Imagem Placeholder Inteligente */}
                                        <div className="h-40 w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-md mb-4 overflow-hidden relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop"
                                                alt={card.front.title}
                                                className="object-cover w-full h-full opacity-80 mix-blend-overlay"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <span className="absolute bottom-2 right-2 bg-white/90 text-slate-900 text-xs px-2 py-1 rounded-full font-medium">
                                                {card.front.subtitle}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
                                            {card.front.title}
                                        </h3>
                                        <div className="flex items-center mt-auto pt-2 text-sm text-blue-600 font-medium">
                                            <Lightbulb className="w-4 h-4 mr-2" />
                                            <span className="line-clamp-1">{card.front.tag}</span>
                                        </div>
                                    </div>
                                }
                                backContent={
                                    <div className="flex flex-col h-full w-full p-6 justify-between bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl">
                                        <div>
                                            <h4 className="font-semibold text-lg mb-4 flex items-center text-slate-900 dark:text-white">
                                                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                                                Dores Resolvidas
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                                                {card.back.description}
                                            </p>

                                            {card.back.details && (
                                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                        BNCC Focus
                                                    </span>
                                                    <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 line-clamp-2">
                                                        {card.back.details}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg shadow-blue-500/25">
                                            {card.back.buttonText}
                                        </button>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}

                {/* Contador de resultados */}
                {cardsData.length > 0 && (
                    <div className="mt-10 text-center">
                        <p className="text-slate-500 text-sm">
                            Exibindo {cardsData.length} episódio{cardsData.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
