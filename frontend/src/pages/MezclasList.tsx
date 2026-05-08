import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Sparkles, Filter } from 'lucide-react';
import MixOfTheWeek from '../components/MixOfTheWeek';
import Pagination from '../components/Pagination';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function MezclasList() {
    const [mezclas, setMezclas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tags, setTags] = useState<any[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    // Cargar tags disponibles
    useEffect(() => {
        api.get('/mezclas/tags')
            .then((data: any) => setTags(data))
            .catch(err => console.error('Error cargando tags:', err));
    }, []);

    // Cargar mezclas con paginación y filtro de tags
    useEffect(() => {
        setLoading(true);
        const params: any = { page, limit: 12 };
        if (activeTag) params.tag = activeTag;

        api.get('/mezclas', { params })
            .then((result: any) => {
                setMezclas(result.data);
                setTotalPages(result.totalPages);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [page, activeTag]);

    const handleTagClick = (tagName: string) => {
        setActiveTag(prev => prev === tagName ? null : tagName);
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 animate-reveal-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Explora Mezclas</h1>
                    <p className="text-shisha-text-muted font-medium text-sm md:text-base">Descubre y comparte las mejores combinaciones de la comunidad.</p>
                </div>
                <Link to="/mezcla/nueva" className="shrink-0">
                    <button className="flex items-center gap-2 px-6 py-3 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-2xl shadow-xl shadow-shisha-ember/20 hover:shadow-shisha-ember/40 transition-all hover:-translate-y-1 active:scale-95 group">
                        <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                        <span>Crear Mi Mezcla</span>
                    </button>
                </Link>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
                <div className="glass-panel p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 mb-10">
                    <div className="flex items-center gap-2 mb-4 text-shisha-text-dim">
                        <Filter size={14} className="uppercase" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filtrar por Nota Sabor</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                        {tags.map((tag: any) => (
                            <button
                                key={tag.id}
                                onClick={() => handleTagClick(tag.nombre)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                    activeTag === tag.nombre 
                                    ? 'bg-shisha-neon border-shisha-neon text-white shadow-lg shadow-shisha-neon/20' 
                                    : 'bg-white/5 border-white/5 text-shisha-text-muted hover:border-shisha-neon/30 hover:bg-white/10'
                                }`}
                            >
                                {tag.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <MixOfTheWeek />

            <div className="mt-16">
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="text-shisha-ember" size={24} />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {activeTag ? `Resultados para "${activeTag}"` : 'Últimas Novedades'}
                    </h2>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                        <p className="text-shisha-text-dim font-bold animate-pulse">Inspirando nuevas cazoletas...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mezclas.map((mix: any) => (
                                <Link 
                                    to={`/mezcla/${mix.id}`} 
                                    key={mix.id} 
                                    className="glass-panel group rounded-[2.5rem] overflow-hidden flex flex-col hover:border-shisha-ember/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-shisha-ember/10"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        {mix.imagenUrl ? (
                                            <img 
                                                src={imageUrl(mix.imagenUrl)} 
                                                alt={mix.titulo} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-shisha-surface to-shisha-bg flex items-center justify-center">
                                                <Sparkles size={48} className="text-shisha-text-dim/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <div className="px-3 py-1.5 glass-panel rounded-full flex items-center gap-1.5 shadow-xl">
                                                <Heart size={14} className="text-rose-500 fill-rose-500/10" />
                                                <span className="text-xs font-black text-white">{mix._count?.likes || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 flex flex-col flex-1 gap-6">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-black text-white mb-2 line-clamp-1 group-hover:text-shisha-ember transition-colors">{mix.titulo}</h3>
                                            <p className="text-shisha-text-muted text-xs md:text-sm font-medium line-clamp-2 leading-relaxed">
                                                {mix.descripcion || "Explora los secretos de esta mezcla única creada por la comunidad."}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {mix.tags?.slice(0, 3).map((mt: any) => (
                                                <span key={mt.tag?.id} className="px-2.5 py-1 rounded-lg bg-shisha-neon/10 border border-shisha-neon/20 text-shisha-neon text-[10px] font-black uppercase tracking-wider">
                                                    #{mt.tag?.nombre}
                                                </span>
                                            ))}
                                            {mix.ingredients?.slice(0, 2).map((ing: any) => (
                                                <span key={ing.id} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-shisha-text-dim text-[10px] font-black uppercase tracking-wider">
                                                    {ing.marca}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-shisha-ember/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                    {mix.author?.avatarUrl ? (
                                                        <img 
                                                            src={imageUrl(mix.author.avatarUrl)} 
                                                            alt={mix.author.nombre} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-shisha-ember">
                                                            {mix.author?.nombre?.[0].toUpperCase() || '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-bold text-shisha-text-muted">
                                                    {mix.author?.nombre || 'Anónimo'}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black text-shisha-ember uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                Ver Detalles →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {mezclas.length === 0 && (
                                <div className="col-span-full py-20 glass-panel rounded-[3rem] text-center p-10">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Filter size={32} className="text-shisha-text-dim" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3">
                                        {activeTag ? `Cero mezclas con "${activeTag}"` : 'El lounge está vacío'}
                                    </h3>
                                    <p className="text-shisha-text-muted font-medium mb-8 max-w-md mx-auto">
                                        {activeTag ? 'Prueba a explorar otras notas de sabor o limpia el filtro.' : 'Sé el pionero y comparte tu primera mezcla maestra con el gremio.'}
                                    </p>
                                    {activeTag && (
                                        <button 
                                            onClick={() => setActiveTag(null)}
                                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl transition-all"
                                        >
                                            Limpiar Filtros
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-16">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
