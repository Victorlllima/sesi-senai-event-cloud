import { createServerClient } from "@/lib/supabase-server";
import { DashboardClient, SchoolEntry } from "@/components/dashboard/dashboard-client";

// Tipagem do Supabase (reforçando)
interface DocumentMetadata {
    titulo: string;
    pilar_inovacao: string;
    gatilhos_comportamentais: string[];
    competencias_bncc: string[];
}

export default async function DashboardPage() {
    const supabase = await createServerClient();

    const { data: documents, error } = await supabase
        .from("documents")
        .select("id, metadata")
        .limit(100);

    if (error) {
        console.error("Erro Supabase:", error);
        return <div>Erro ao carregar dados.</div>;
    }

    // Transformação de Dados no Servidor (Melhor Performance)
    const initialData: SchoolEntry[] = (documents as any[])?.map((doc, index) => {
        const meta = doc.metadata as DocumentMetadata;

        // Tratamento de String (País)
        const titleParts = meta.titulo?.split("-") || [meta.titulo];
        const schoolName = titleParts[0]?.trim();
        const country = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : "Outros";

        return {
            id: doc.id,
            // Metadados para o filtro funcionar
            filterMetadata: {
                country: country,
                methodology: meta.pilar_inovacao || "Geral",
                problems: meta.gatilhos_comportamentais || []
            },
            // Dados visuais pré-formatados
            cardProps: {
                frontData: {
                    title: schoolName,
                    subtitle: country,
                    tag: meta.pilar_inovacao || "Inovação",
                    imageSrc: `https://images.unsplash.com/photo-${index % 2 === 0 ? '1544396821-4dd40b938ad3' : '1503676260728-1c00da094a0b'}?w=400&h=300&fit=crop&q=80`,
                },
                backData: {
                    description: (meta.gatilhos_comportamentais || []).slice(0, 3).join(", "),
                    details: (meta.competencias_bncc || []).slice(0, 2).join(", "),
                    buttonText: "Ver Detalhes"
                }
            }
        };
    }) || [];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Atlas de Inovação</h1>
                <p className="text-muted-foreground">Explorer interativo das referências educacionais.</p>
            </div>

            {/* Passamos os dados tratados para o componente cliente interativo */}
            <DashboardClient initialData={initialData} />
        </div>
    );
}
