import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, ArrowRight } from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function MixOfTheWeek() {
    const [mix, setMix] = useState<any>(null);

    useEffect(() => {
        api.get('/mezclas/semana')
            .then((data: any) => {
                if (data && data.id) {
                    setMix(data);
                }
            })
            .catch(err => console.error("Error cargando mezcla de la semana:", err));
    }, []);

    if (!mix) return null;

    return (
        <div className="glass-panel-premium rounded-2xl md:rounded-[3rem] p-6 md:p-14 mb-8 md:mb-12 relative overflow-hidden group shadow-3xl animate-reveal-up">
            <div className="absolute -top-20 -right-20 text-white/5 rotate-12 transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-125">
                <Award size={320} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-shisha-ember/20 border border-shisha-ember/30 backdrop-blur-md rounded-full text-shisha-ember text-[10px] font-black uppercase tracking-widest animate-glow-pulse">
                            <Flame size={14} /> La Mezcla del Mes
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter m-0 leading-tight md:leading-none">
                            {mix.titulo}
                        </h2>
                        <p className="text-xl text-shisha-text-muted font-medium italic leading-relaxed max-w-2xl">
                            "{mix.descripcion || "Una selección excepcional del maestro alquimista."}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {mix.ingredients && mix.ingredients.map((ing: any) => (
                            <span key={ing.id} className="glass-panel px-4 py-2 rounded-xl text-xs font-black text-white border-white/10">
                                {ing.nombreTabaco} <span className="text-shisha-ember ml-1 opacity-80">{ing.porcentaje}%</span>
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center pt-4 w-full">
                        <Link to={`/mezcla/${mix.id}`} className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-4 bg-white text-shisha-bg font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95">
                                Ver Alquimia <ArrowRight size={16} />
                            </button>
                        </Link>
                        <div className="flex items-center gap-3">
                            {mix.author?.avatarUrl ? (
                                <img 
                                    src={imageUrl(mix.author.avatarUrl)} 
                                    alt={mix.author?.nombre || 'autor'} 
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-white border border-white/10">
                                    {mix.author?.nombre?.[0] || 'A'}
                                </div>
                            )}
                            <span className="text-sm font-bold text-shisha-text-muted">
                                Por {mix.author?.nombre || 'Alquimista Maestro'}
                            </span>
                        </div>
                    </div>
                </div>

                 {mix.imagenUrl && (
                     <div className="hidden lg:block w-1/3 relative">
                          <div className="absolute inset-0 bg-shisha-ember/20 blur-[100px] rounded-full animate-pulse"></div>
                          <div className="relative glass-panel-premium aspect-square rounded-[3rem] border-white/10 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-700 shadow-2xl overflow-hidden">
                                 <img 
                                     src={imageUrl(mix.imagenUrl)} 
                                     alt={mix.titulo}
                                     className="w-full h-full object-cover"
                                 />
                          </div>
                     </div>
                 )}
            </div>
        </div>
    );
}

