import { createServerClient } from "@/lib/supabase-server";
import { FlippingCard } from "@/components/ui/flipping-card";
import { Lightbulb, AlertCircle, MapPin } from "lucide-react";

// Tipagem baseada no Schema validado
interface DocumentMetadata {
    titulo: string;
    pilar_inovacao: string;
    gatilhos_comportamentais: string[];
    competencias_bncc: string[];
    // O campo 'pais' não existe no banco, será derivado
}

interface SchoolDoc {
    id: number;
    metadata: DocumentMetadata;
}

export default async function DashboardPage() {
    const supabase = await createServerClient();

    // Buscar todos os documentos
    const { data: documents, error } = await supabase
        .from("documents") // Tabela confirmada como 'documents'
        .select("id, metadata");

    if (error) {
        console.error("Erro ao buscar documentos:", error);
        return <div>Erro ao carregar dados. Verifique o console.</div>;
    }

    // Processamento e Mapeamento dos Dados
    const cardsData = (documents as SchoolDoc[] | null)?.map((doc, index) => {
        const meta = doc.metadata;

        // Lógica de Extração: "Escola - País"
        const titleParts = meta.titulo?.split("-") || [meta.titulo];
        const schoolName = titleParts[0]?.trim();
        // Pega o último elemento como país, ou define padrão
        const country = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : "Localização não inf.";

        return {
            id: doc.id,
            index,
            front: {
                title: schoolName,
                subtitle: country,
                tag: meta.pilar_inovacao || "Inovação",
                // Usando Unsplash Source com keywords relevantes
                imageSrc: `https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&q=80`,
            },
            back: {
                description: `Resolve: ${(meta.gatilhos_comportamentais || []).slice(0, 3).join(", ")}`,
                details: meta.competencias_bncc?.slice(0, 2).join(" • "),
                buttonText: "Ver Detalhes",
            },
        };
    }) || [];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Atlas de Inovação Educacional</h1>
                <p className="text-muted-foreground">
                    {cardsData.length} escolas mapeadas ao redor do mundo.
                </p>
            </div>

            <div className="flex gap-6 flex-wrap justify-center">
                {cardsData.map((card) => (
                    <FlippingCard
                        key={card.id}
                        width={320}
                        height={380}
                        frontContent={
                            <div className="flex flex-col h-full w-full p-4">
                                {/* Área da Imagem */}
                                <div className="h-44 w-full bg-neutral-100 rounded-lg mb-4 overflow-hidden relative group">
                                    <img
                                        // Alternar imagens para variedade visual usando index
                                        src={`https://images.unsplash.com/photo-${card.index % 2 === 0 ? '1544396821-4dd40b938ad3' : '1503676260728-1c00da094a0b'}?w=400&h=300&fit=crop`}
                                        alt={card.front.title}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <MapPin size={10} />
                                        {card.front.subtitle}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold leading-tight mb-2">{card.front.title}</h3>
                                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {card.front.tag}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 text-center">Passe o mouse para ver detalhes</p>
                                </div>
                            </div>
                        }
                        backContent={
                            <div className="flex flex-col h-full w-full p-6 justify-between bg-neutral-50 dark:bg-neutral-900 rounded-xl border-2 border-neutral-100 dark:border-neutral-800">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-lg flex items-center text-amber-600 dark:text-amber-500 mb-2">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Desafios
                                        </h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {card.back.description}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1">
                                            Foco BNCC
                                        </span>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {card.back.details}
                                        </p>
                                    </div>
                                </div>

                                <button className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-all text-sm font-medium shadow-lg shadow-slate-900/20 active:scale-95">
                                    {card.back.buttonText}
                                </button>
                            </div>
                        }
                    />
                ))}
            </div>
        </div>
    );
}
