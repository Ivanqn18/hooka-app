import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, Package, Sparkles, Database } from 'lucide-react';
import api from '../services/api';

interface XmlFormat {
    grams: string;
    price: string;
}

interface XmlTaste {
    name: string;
    formats: XmlFormat[];
}

interface XmlBrand {
    name: string;
    tastes: XmlTaste[];
}

// Colores vibrantes para los avatares de marca (basados en hash del nombre)
const brandColors = [
    ['#6366f1', '#818cf8'], ['#ec4899', '#f472b6'], ['#f59e0b', '#fbbf24'],
    ['#10b981', '#34d399'], ['#ef4444', '#f87171'], ['#8b5cf6', '#a78bfa'],
    ['#06b6d4', '#22d3ee'], ['#f97316', '#fb923c'], ['#14b8a6', '#2dd4bf'],
    ['#e11d48', '#fb7185'], ['#7c3aed', '#a78bfa'], ['#0ea5e9', '#38bdf8'],
    ['#84cc16', '#a3e635'], ['#d946ef', '#e879f9'], ['#059669', '#34d399'],
];

function getBrandGradient(name: string): [string, string] {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % brandColors.length;
    return brandColors[idx] as [string, string];
}

const PAGE_SIZE = 18;

export const TobaccoCatalog: React.FC = () => {
    const [allBrands, setAllBrands] = useState<XmlBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<XmlBrand | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get('/tobaccos/light-catalog')
            .then((data: any) => {
                if (Array.isArray(data)) setAllBrands(data);
            })
            .catch((err: any) => console.error('Error cargando catálogo XML', err))
            .finally(() => setLoading(false));
    }, []);

    // Filtrado local sobre los datos del XML
    const filteredBrands = useMemo(() => {
        if (!searchQuery.trim()) return allBrands;
        const q = searchQuery.toLowerCase();
        return allBrands.filter(b =>
            b.name.toLowerCase().includes(q) ||
            b.tastes.some(t => t.name.toLowerCase().includes(q))
        );
    }, [allBrands, searchQuery]);

    const totalPages = Math.ceil(filteredBrands.length / PAGE_SIZE);
    const pagedBrands = filteredBrands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (v: string) => {
        setSearchQuery(v);
        setPage(1);
        setSelectedBrand(null);
    };

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
            <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
            <p className="text-shisha-text-dim font-black animate-pulse uppercase tracking-[0.2rem]">Cargando catálogo...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up">
            {/* Header */}
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Catálogo de Tabacos <span className="text-shisha-ember">Gremio</span>
                    </h1>
                    <p className="text-shisha-text-dim font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={12} className="text-shisha-ember" /> {allBrands.length} marcas · {allBrands.reduce((a, b) => a + b.tastes.length, 0)} sabores disponibles
                    </p>
                </div>
                <div className="glass-panel px-4 md:px-6 py-3 rounded-2xl border-white/5 flex items-center justify-between md:justify-start gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-muted">Directorio</p>
                        <p className="text-lg font-black text-white">
                            {filteredBrands.length} {searchQuery ? 'coincidencias' : 'Marcas'}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-shisha-ember/10 rounded-xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20">
                        <Database size={20} />
                    </div>
                </div>
            </header>

            {/* Buscador */}
            <div className="relative mb-8 md:mb-12 group">
                <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-ember transition-colors">
                    <Search className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </div>
                <input
                    className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 rounded-2xl md:rounded-[2rem] glass-panel border-white/5 text-lg md:text-xl font-bold text-white outline-none focus:border-shisha-ember/50 transition-all placeholder:text-shisha-text-dim/20 shadow-2xl"
                    type="text"
                    placeholder="Buscar marca o sabor..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Estado vacío */}
            {filteredBrands.length === 0 && (
                <div className="glass-panel p-10 md:p-20 rounded-[3rem] border-white/5 border-dashed border-2 flex flex-col items-center text-center gap-8 shadow-2xl">
                    <div className="w-24 h-24 bg-shisha-ember/5 rounded-full flex items-center justify-center text-shisha-ember/20">
                        <Package size={64} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white">Sin resultados</h3>
                        <p className="text-shisha-text-dim font-medium max-w-sm">No hay marcas o sabores que coincidan con tu búsqueda.</p>
                    </div>
                </div>
            )}

            {/* Vista de Marcas (Grid) — sin detalle seleccionado */}
            {!selectedBrand && pagedBrands.length > 0 && (
                <div className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                        {pagedBrands.map((brand) => {
                            const [c1, c2] = getBrandGradient(brand.name);
                            return (
                                <div
                                    key={brand.name}
                                    onClick={() => setSelectedBrand(brand)}
                                    className="glass-panel group p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5 cursor-pointer flex flex-col items-center gap-3 md:gap-6 transition-all hover:-translate-y-2 hover:border-shisha-ember/20 shadow-xl relative overflow-hidden"
                                >
                                    <div
                                        className="absolute top-0 left-0 right-0 h-1.5 opacity-50 transition-opacity group-hover:opacity-100"
                                        style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                                    />
                                    <div
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-2xl transition-transform group-hover:scale-110"
                                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 10px 30px ${c1}40` }}
                                    >
                                        {brand.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="font-black text-white tracking-tight group-hover:text-shisha-ember transition-colors text-sm">{brand.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                            {brand.tastes.length} Variedades
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Paginación simple */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all"
                            >
                                ← Anterior
                            </button>
                            <span className="text-shisha-text-dim text-[11px] font-black uppercase tracking-widest">
                                {page} / {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Vista Detalle de Marca */}
            {selectedBrand && (
                <div className="animate-reveal-up space-y-10">
                    <button
                        onClick={() => setSelectedBrand(null)}
                        className="flex items-center gap-2 text-shisha-text-dim hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors group w-fit"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al directorio
                    </button>

                    {(() => {
                        const [c1, c2] = getBrandGradient(selectedBrand.name);
                        return (
                            <div className="glass-panel-premium p-5 md:p-10 rounded-2xl md:rounded-[3rem] border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-3xl">
                                <div
                                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20"
                                    style={{ background: c1 }}
                                />
                                <div
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-2xl shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 15px 40px ${c1}50` }}
                                >
                                    {selectedBrand.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">{selectedBrand.name}</h2>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-muted">
                                        {selectedBrand.tastes.length} sabores en catálogo
                                    </p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Buscador de sabores */}
                    {selectedBrand.tastes.length > 10 && (
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-ember transition-colors">
                                <Search size={16} />
                            </div>
                            <input
                                className="w-full pl-12 pr-6 py-4 rounded-2xl glass-panel border-white/5 text-white font-bold outline-none focus:border-shisha-ember/50 transition-all placeholder:text-shisha-text-dim/20"
                                type="text"
                                placeholder={`Buscar entre ${selectedBrand.tastes.length} sabores...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedBrand.tastes
                            .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((taste, idx) => {
                                const [c1] = getBrandGradient(selectedBrand.name);
                                return (
                                    <div key={idx} className="glass-panel px-6 py-4 rounded-2xl border-white/5 flex flex-col md:flex-row md:items-center justify-between hover:border-white/10 hover:bg-white/[0.04] shadow-xl group gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-8 rounded-full opacity-40 shrink-0" style={{ background: c1 }} />
                                            <span className="font-bold text-white text-sm md:text-base">{taste.name}</span>
                                        </div>
                                        <div className="flex flex-wrap md:justify-end gap-3 ml-6 md:ml-0">
                                            {taste.formats.map((f, fIdx) => (
                                                <div key={fIdx} className="flex flex-col items-center md:items-end min-w-[50px]">
                                                    <span className="text-[8px] font-black uppercase text-shisha-text-muted leading-none mb-1">{f.grams}</span>
                                                    <div className="w-full text-center px-2 py-0.5 bg-shisha-ember/10 border border-shisha-ember/20 rounded-lg text-shisha-ember font-black text-[10px] md:text-xs">
                                                        {f.price}€
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};
