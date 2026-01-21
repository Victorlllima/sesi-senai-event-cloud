"use server";

import { createServerClient } from "@/lib/supabase-server";
import OpenAI from "openai";
import { SchoolEntry } from "@/components/dashboard/dashboard-client";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function searchSchools(query: string): Promise<SchoolEntry[]> {
    if (!query.trim()) return [];

    const supabase = await createServerClient();

    try {
        // 1. Gerar Embedding da Query
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            encoding_format: "float",
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // 2. Chamar RPC no Supabase
        const { data: documents, error } = await supabase.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Ajuste conforme calibração necessária
            match_count: 10,
        });

        if (error) {
            console.error("Erro na busca vetorial:", error);
            throw new Error("Falha na busca");
        }

        // 3. Transformar dados para o formato visual (Mesma lógica do page.tsx)
        // Nota: Em refatoração futura, extrair isso para um helper compartilhado
        const results: SchoolEntry[] = documents.map((doc: any, index: number) => {
            const meta = doc.metadata;

            // Lógica de Extração: "Escola - País"
            const titleParts = meta.titulo?.split("-") || [meta.titulo];
            const schoolName = titleParts[0]?.trim();
            const country = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : "Localização não inf.";

            return {
                id: doc.id,
                filterMetadata: {
                    country: country,
                    methodology: meta.pilar_inovacao || "Geral",
                    problems: meta.gatilhos_comportamentais || []
                },
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
        });

        return results;

    } catch (err) {
        console.error("Erro no action searchSchools:", err);
        return [];
    }
}
