"use client";

import { useState, useMemo, useTransition } from "react";
import { FlippingCard } from "@/components/ui/flipping-card";
import { Filter, X, Search, Loader2 } from "lucide-react";
import { searchSchools } from "@/app/actions/search";

// Definição do formato de dados que virá do Server Component
export interface SchoolEntry {
    id: string;
    filterMetadata: {
        country: string;
        methodology: string;
        problems: string[];
    };
    cardProps: {
        frontData: { title: string; subtitle: string; tag: string; imageSrc: string };
        backData: { description: string; details: string; buttonText: string };
    };
}

interface DashboardClientProps {
    initialData: SchoolEntry[];
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    // Estados de Filtro Local
    const [selectedCountry, setSelectedCountry] = useState<string>("Todos");
    const [selectedMethodology, setSelectedMethodology] = useState<string>("Todas");

    // Estados de Busca Semântica
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SchoolEntry[] | null>(null);
    const [isPending, startTransition] = useTransition();

    // Executar busca ao pressionar Enter
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (!searchQuery.trim()) {
                setSearchResults(null);
                return;
            }

            startTransition(async () => {
                const results = await searchSchools(searchQuery);
                setSearchResults(results);
            });
        }
    };

    // Limpar busca
    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
    };

    // Lógica Unificada: Se houver busca, usa searchResults. Se não, usa initialData.
    const sourceData = searchResults || initialData;

    // Extrair opções únicas para os selects (sempre do dataset completo)
    const countries = useMemo(() =>
        ["Todos", ...Array.from(new Set(initialData.map(d => d.filterMetadata.country))).sort()],
        [initialData]);

    const methodologies = useMemo(() =>
        ["Todas", ...Array.from(new Set(initialData.map(d => d.filterMetadata.methodology))).sort()],
        [initialData]);

    // Aplica filtros locais (País/Metodologia) SOBRE o resultado da busca (ou dados iniciais)
    const filteredSchools = sourceData.filter((school) => {
        const matchCountry = selectedCountry === "Todos" || school.filterMetadata.country === selectedCountry;
        const matchMethodology = selectedMethodology === "Todas" || school.filterMetadata.methodology === selectedMethodology;
        return matchCountry && matchMethodology;
    });

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar de Filtros */}
            <aside className="w-full md:w-64 space-y-6 bg-neutral-50 dark:bg-neutral-900 p-6 rounded-xl h-fit border border-neutral-200 dark:border-neutral-800">

                {/* Barra de Busca Inteligente Atualizada */}
                <div className="mb-2">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Busca IA
                    </label>
                    <div className="relative">
                        {isPending ? (
                            <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        )}

                        <input
                            type="text"
                            placeholder="Ex: autonomia, natureza..."
                            className="w-full pl-9 pr-8 py-2 rounded-md border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 text-sm focus:ring-2 focus:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            disabled={isPending}
                        />

                        {searchQuery && !isPending && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 top-2.5 text-neutral-400 hover:text-neutral-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Pressione <strong>Enter</strong> para buscar
                    </p>
                    {searchResults && (
                        <p className="text-[10px] text-green-600 mt-1">
                            🔍 {searchResults.length} resultado(s) encontrado(s)
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg">Filtros</h2>
                </div>

                {/* Filtro País */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">País</label>
                    <select
                        className="w-full p-2 rounded-md border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 text-sm"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Filtro Metodologia */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Metodologia</label>
                    <select
                        className="w-full p-2 rounded-md border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 text-sm"
                        value={selectedMethodology}
                        onChange={(e) => setSelectedMethodology(e.target.value)}
                    >
                        {methodologies.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Resumo */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-center text-muted-foreground">
                        Mostrando <strong>{filteredSchools.length}</strong> de {sourceData.length} escolas
                    </p>
                    {(selectedCountry !== "Todos" || selectedMethodology !== "Todas" || searchResults) && (
                        <button
                            onClick={() => { setSelectedCountry("Todos"); setSelectedMethodology("Todas"); clearSearch(); }}
                            className="w-full mt-3 text-xs flex items-center justify-center gap-1 text-red-500 hover:text-red-700"
                        >
                            <X size={12} /> Limpar Tudo
                        </button>
                    )}
                </div>
            </aside>

            {/* Grid de Cards */}
            <main className="flex-1">
                <div className="flex gap-6 flex-wrap justify-center md:justify-start">
                    {filteredSchools.map((item) => (
                        <FlippingCard
                            key={item.id}
                            width={300}
                            height={360}
                            frontContent={
                                <div className="flex flex-col h-full w-full p-4">
                                    <div className="h-40 w-full bg-neutral-100 rounded-md mb-4 overflow-hidden relative group">
                                        <img
                                            src={item.cardProps.frontData.imageSrc}
                                            alt={item.cardProps.frontData.title}
                                            className="object-cover w-full h-full"
                                        />
                                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                                            {item.cardProps.frontData.subtitle}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight">{item.cardProps.frontData.title}</h3>
                                    <div className="mt-2 inline-block">
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                            {item.cardProps.frontData.tag}
                                        </span>
                                    </div>
                                </div>
                            }
                            backContent={
                                <div className="flex flex-col h-full w-full p-6 justify-between bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Dores Resolvidas</h4>
                                        <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                                            {item.cardProps.backData.description}
                                        </p>
                                        <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 my-2" />
                                        <p className="text-xs text-muted-foreground">
                                            <strong>BNCC:</strong> {item.cardProps.backData.details}
                                        </p>
                                    </div>
                                    <button className="w-full bg-black text-white py-2 rounded-md hover:bg-neutral-800 transition-colors text-xs font-bold uppercase tracking-widest">
                                        {item.cardProps.backData.buttonText}
                                    </button>
                                </div>
                            }
                        />
                    ))}

                    {filteredSchools.length === 0 && (
                        <div className="w-full py-20 text-center text-muted-foreground">
                            <p>Nenhuma escola encontrada com esses filtros.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
