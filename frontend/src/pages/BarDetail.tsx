import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, MessageSquare, Camera, Share2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function BarDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [bar, setBar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewImageUrl, setReviewImageUrl] = useState('');

    const fetchBar = () => {
        api.get(`/bares/${id}`)
            .then((data: any) => {
                setBar(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBar();
    }, [id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.warning("Debes iniciar sesión para valorar este bar");
            return;
        }

        try {
            await api.post(`/bares/${id}/reviews`, {
                usuarioId: user.id,
                puntuacion: rating,
                comentario: comment,
                ...(reviewImageUrl && { imagenUrl: reviewImageUrl })
            });

            setComment('');
            setReviewImageUrl('');
            setRating(5);
            fetchBar(); // Recargar reseñas
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
            <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
            <p className="text-shisha-text-dim font-black animate-pulse uppercase tracking-[0.2rem]">Explorando Lounge...</p>
        </div>
    );
    
    if (!bar) return (
        <div className="py-20 text-center animate-reveal-up">
            <h2 className="text-3xl font-black text-white">Lounge no encontrado</h2>
            <Link to="/mapa" className="text-shisha-ember hover:underline mt-4 inline-block font-bold">Volver al Radar</Link>
        </div>
    );

    const avgRating = bar.reviews && bar.reviews.length > 0
        ? (bar.reviews.reduce((acc: number, r: any) => acc + r.puntuacion, 0) / bar.reviews.length).toFixed(1)
        : 'Nu';

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up space-y-8 md:space-y-10">
            <Link 
                to="/mapa" 
                className="inline-flex items-center gap-2 text-shisha-text-dim hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors group mb-2"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al radar
            </Link>

            {/* Header Card */}
            <div className="glass-panel-premium rounded-2xl md:rounded-[3rem] overflow-hidden shadow-3xl">
                <div className="relative h-[300px] md:h-[400px] w-full group">
                    <img
                        src={imageUrl(bar.imagenUrl) || 'https://images.unsplash.com/photo-1541532713592-6dafb34764d6?auto=format&fit=crop&q=80'}
                        alt={bar.nombre}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-shisha-bg/90 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-4 md:bottom-8 left-4 md:left-10 right-4 md:right-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="space-y-2 md:space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 md:px-3 md:py-1 bg-shisha-ember/20 border border-shisha-ember/30 backdrop-blur-md rounded-lg text-shisha-ember text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                    Lounge Verificado
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter m-0">{bar.nombre}</h1>
                            <p className="flex items-center gap-2 text-shisha-text-muted font-bold text-sm md:text-lg">
                                <MapPin size={18} className="text-shisha-ember" /> {bar.direccion}
                            </p>
                        </div>
                        <div className="flex flex-row md:flex-col items-center gap-2 p-3 md:p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-[2.5rem] shadow-2xl">
                            <Star className="w-6 h-6 md:w-8 md:h-8" fill="#fbbf24" color="#fbbf24" style={{ filter: `drop-shadow(0 0 10px rgba(251,191,36,0.5))` }} />
                            <span className="text-xl md:text-3xl font-black text-white">{avgRating}</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-14 space-y-6 md:space-y-8">
                    <div className="flex items-start gap-3">
                        <Info size={20} className="text-shisha-ember shrink-0 mt-1" />
                        <p className="text-base md:text-xl leading-relaxed text-shisha-text-muted font-medium italic">"{bar.descripcion}"</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-4 glass-panel hover:bg-white/5 border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
                            <Share2 size={16} /> Compartir Ubicación
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <MessageSquare size={24} className="text-shisha-ember" />
                        Opiniones del Gremio
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">{bar.reviews?.length || 0} Valoraciones</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {bar.reviews && bar.reviews.length > 0 ? (
                        bar.reviews.map((rev: any) => (
                            <div key={rev.id} className="glass-panel p-5 md:p-8 rounded-2xl md:rounded-[2rem] border-white/5 hover:border-white/10 transition-all shadow-xl group animate-reveal-up">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                    <img 
                                        src={imageUrl(rev.user?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                                        alt="user" 
                                        className="w-14 h-14 rounded-2xl object-cover border-2 border-shisha-ember shadow-lg shrink-0" 
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-black text-white text-lg">{rev.user?.nombre || 'Miembro del Gremio'}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.puntuacion ? '#fbbf24' : 'transparent'} color={i < rev.puntuacion ? '#fbbf24' : 'rgba(255,255,255,0.05)'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest">Hace poco</span>
                                        </div>
                                        <p className="text-lg text-shisha-text-muted font-medium italic leading-relaxed">"{rev.comentario}"</p>
                                        
                                        {rev.imagenUrl && (
                                            <div className="mt-6 rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-transform group-hover:scale-[1.02]">
                                                <img src={imageUrl(rev.imagenUrl)} alt="Review attachment" className="w-full max-h-[400px] object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel p-12 md:p-20 rounded-2xl md:rounded-[3rem] border-white/5 border-dashed border-2 flex flex-col items-center text-center gap-8 shadow-2xl">
                             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-shisha-text-dim/20">
                                <MessageSquare size={40} />
                            </div>
                            <p className="text-shisha-text-dim font-black uppercase tracking-widest">Nadie ha compartido su experiencia aún</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Review Section */}
            {user ? (
                <div className="glass-panel-premium p-5 md:p-14 rounded-2xl md:rounded-[3rem] border-white/10 shadow-3xl space-y-8 md:space-y-10">
                    <div className="space-y-2">
                        <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight">¿Has visitado este Lounge?</h4>
                        <p className="text-sm md:text-base text-shisha-text-muted font-medium">Tu opinión ayuda a mantener la calidad del gremio.</p>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Valoración</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setRating(num)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rating >= num ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-shisha-text-dim'}`}
                                        >
                                            <Star size={20} fill={rating >= num ? 'currentColor' : 'transparent'} />
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Adjuntar Evidencia (URL)</label>
                                <div className="relative">
                                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim" size={18} />
                                    <input 
                                        type="url" 
                                        value={reviewImageUrl} 
                                        onChange={e => setReviewImageUrl(e.target.value)} 
                                        placeholder="https://ejemplo.com/mifoto.jpg" 
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-ember/40 outline-none transition-all font-medium" 
                                    />
                                </div>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Tu experiencia</label>
                            <textarea 
                                value={comment} 
                                onChange={e => setComment(e.target.value)} 
                                required 
                                rows={4} 
                                className="w-full px-6 py-5 md:px-8 md:py-6 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-ember/40 outline-none transition-all font-medium resize-none shadow-inner" 
                                placeholder="Escribe tu reseña maestra aquí..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full md:w-auto px-12 py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-shisha-ember/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Publicar Reseña <MessageSquare size={16} />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel p-8 md:p-16 rounded-2xl md:rounded-[3rem] text-center space-y-8">
                    <p className="text-shisha-text-muted text-lg font-medium">Inicia sesión para compartir tu experiencia sobre este Lounge.</p>
                    <Link 
                        to="/login" 
                        className="inline-block px-10 py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-shisha-ember/20 transition-all active:scale-95"
                    >
                        Entrar al Lounge
                    </Link>
                </div>
            )}
        </div>
    );
}
