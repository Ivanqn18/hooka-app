import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, HeartOff, ArrowLeft, Send, Trash2, MessageCircle, Info, Beaker, Flame, Sparkles, User, Calendar, UserPlus, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function MezclaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user?.id;
    const [mix, setMix] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [authorData, setAuthorData] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Comentarios
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');
    const [commentPage, setCommentPage] = useState(1);
    const [commentTotalPages, setCommentTotalPages] = useState(1);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        api.get(`/mezclas/${id}`)
            .then((data: any) => {
                setMix(data);
                if (data.autorId) {
                    api.get(`/users/${data.autorId}`).then((u: any) => {
                        setAuthorData(u);
                        if (currentUserId && u.followers) {
                            setIsFollowing(u.followers.some((f: any) => f.followerId === currentUserId));
                        }
                    }).catch(console.error);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (!id) return;
        setLoadingComments(true);
        api.get(`/mezclas/${id}/comments?page=${commentPage}&limit=10`)
            .then((result: any) => {
                setComments(result.data);
                setCommentTotalPages(result.totalPages);
                setLoadingComments(false);
            })
            .catch(() => setLoadingComments(false));
    }, [id, commentPage]);

    const handleLike = async () => {
        if (!user) return alert("Debes iniciar sesión para dar me gusta");
        try {
            await api.post(`/mezclas/${id}/like`, { userId: user.id });
            const updated: any = await api.get(`/mezclas/${id}`);
            setMix(updated);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDislike = async () => {
        if (!user) return alert("Debes iniciar sesión para valorar");
        try {
            await api.post(`/mezclas/${id}/dislike`, { userId: user.id });
            const updated: any = await api.get(`/mezclas/${id}`);
            setMix(updated);
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleFollow = async () => {
        if (!currentUserId || !authorData || followLoading) return;
        setFollowLoading(true);
        try {
            const res: any = await api.post(`/users/${authorData.id}/follow`, { followerId: currentUserId });
            setIsFollowing(res.following);
            setAuthorData((prev: any) => ({
                ...prev,
                followers: res.following 
                    ? [...(prev.followers || []), { followerId: currentUserId }] 
                    : (prev.followers || []).filter((f: any) => f.followerId !== currentUserId)
            }));
        } catch (e) {
            console.error(e);
        }
        setFollowLoading(false);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !commentText.trim()) return;

        try {
            await api.post(`/mezclas/${id}/comments`, { userId: user.id, texto: commentText.trim() });
            setCommentText('');
            setCommentPage(1);
            const result: any = await api.get(`/mezclas/${id}/comments?page=1&limit=10`);
            setComments(result.data);
            setCommentTotalPages(result.totalPages);
            const updated: any = await api.get(`/mezclas/${id}`);
            setMix(updated);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!user) return;
        try {
            await api.delete(`/mezclas/comments/${commentId}`, { data: { userId: user.id } });
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
            <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
            <p className="text-shisha-text-dim font-black animate-pulse uppercase tracking-[0.2rem]">Alquimia en progreso...</p>
        </div>
    );
    
    if (!mix) return (
        <div className="py-20 text-center animate-reveal-up">
            <h2 className="text-3xl font-black text-white">Mezcla no encontrada</h2>
            <Link to="/mezclas" className="text-shisha-ember hover:underline mt-4 inline-block font-bold">Volver al Laboratorio</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-reveal-up space-y-10">
            <Link 
                to="/mezclas" 
                className="inline-flex items-center gap-2 text-shisha-text-dim hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors group mb-2"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al laboratorio
            </Link>

            {/* Main Content Card */}
            <div className="glass-panel-premium rounded-[3rem] overflow-hidden shadow-3xl">
                {mix.imagenUrl && (
                    <div className="relative h-[300px] md:h-[450px] w-full group">
                        <img
                            src={imageUrl(mix.imagenUrl)}
                            alt={mix.titulo}
                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-shisha-bg via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                             <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                                {mix.tags?.map((mt: any) => (
                                    <span key={mt.tag?.id || mt.tagId} className="px-3 py-1 md:px-4 md:py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                        #{mt.tag?.nombre || mt.tagId}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none m-0 filter drop-shadow-2xl">
                                {mix.titulo}
                            </h1>
                        </div>
                    </div>
                )}

                <div className="p-6 md:p-14 space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-shisha-ember/20 flex items-center justify-center border-2 border-shisha-ember/40 text-shisha-ember font-black text-xl shadow-lg">
                                {mix.author?.nombre?.charAt(0) || 'A'}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Creado por</p>
                                <p className="text-xl font-bold text-white leading-none">{mix.author?.nombre || 'Alquimista Anónimo'}</p>
                                {authorData && (
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="text-shisha-text-dim" />
                                            <span className="text-xs font-black text-white">{authorData.followers?.length || 0}</span>
                                            <span className="text-[9px] uppercase font-bold text-shisha-text-dim">Sgds</span>
                                        </div>
                                        {currentUserId !== mix.autorId && (
                                            <button 
                                                onClick={() => {
                                                    if (!currentUserId) return navigate('/login');
                                                    handleToggleFollow();
                                                }}
                                                disabled={followLoading}
                                                className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 shadow-lg ml-2 ${
                                                    isFollowing 
                                                        ? 'bg-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500 border border-white/5' 
                                                        : 'bg-shisha-ember text-white shadow-shisha-ember/20 hover:bg-shisha-ember-deep'
                                                }`}
                                            >
                                                {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                                                {isFollowing ? 'Siguiendo' : 'Seguir'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            {user && user.id === mix.autorId && (
                                <Link 
                                    to={`/mezcla/editar/${mix.id}`} 
                                    className="px-6 py-4 rounded-[2rem] bg-shisha-ember/10 text-shisha-ember border border-shisha-ember/30 hover:bg-shisha-ember hover:text-white transition-all font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-2 h-full"
                                >
                                    Editar
                                </Link>
                            )}
                            <button 
                                onClick={handleLike} 
                                className="flex flex-col items-center gap-1 glass-panel px-6 py-4 rounded-[2rem] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                            >
                                <Heart size={24} className="text-shisha-text-dim group-hover:text-emerald-500 transition-colors" /> 
                                <span className="text-sm font-black text-white">{mix._count?.likes || 0}</span>
                            </button>
                            <button 
                                onClick={handleDislike} 
                                className="flex flex-col items-center gap-1 glass-panel px-6 py-4 rounded-[2rem] hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
                            >
                                <HeartOff size={24} className="text-shisha-text-dim group-hover:text-rose-500 transition-colors" /> 
                                <span className="text-sm font-black text-white">{mix._count?.dislikes || 0}</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-12">


                        {mix.descripcion && (
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4 text-shisha-ember">
                                    <Sparkles size={20} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">La Visión del Maestro</h3>
                                </div>
                                <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform">
                                        <Info size={120} />
                                    </div>
                                    <p className="text-xl md:text-2xl leading-relaxed text-shisha-text-muted italic relative z-10 font-medium font-serif">
                                        "{mix.descripcion}"
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="flex items-center gap-4 text-shisha-neon">
                                <Beaker size={20} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Fórmula Química</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mix.ingredients?.map((ing: any) => (
                                    <div key={ing.id} className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.04] transition-all border-white/5 hover:border-shisha-neon/30">
                                        <div className="space-y-1">
                                            <p className="font-black text-lg md:text-xl text-white group-hover:text-shisha-neon transition-colors">{ing.nombreTabaco}</p>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">{ing.marca || 'Marca Desconocida'}</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-shisha-neon/10 border border-shisha-neon/20 shadow-xl">
                                            <span className="font-black text-shisha-neon text-lg md:text-xl">{ing.porcentaje}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {mix.cazoletaRecomendada && (
                            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-r from-shisha-ember/10 to-transparent border-shisha-ember/20 shadow-2xl flex items-center gap-6 md:gap-8">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-shisha-ember flex items-center justify-center text-white shadow-2xl shadow-shisha-ember/40">
                                    <Flame size={32} className="animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-shisha-ember">Configuración Térmica</h4>
                                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight m-0">{mix.cazoletaRecomendada}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conversation Section */}
            <div className="space-y-10 pt-10">
                <div className="flex items-center justify-between px-6">
                    <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <MessageCircle size={32} className="text-shisha-neon" />
                        Debate Maestro
                    </h3>
                    <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                        {mix._count?.comments || 0} Comentarios
                    </div>
                </div>

                {user ? (
                    <form onSubmit={handleAddComment} className="glass-panel p-4 rounded-[3rem] flex items-center gap-4 group focus-within:border-shisha-neon/40 shadow-2xl transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            {user.avatarUrl ? (
                                <img src={imageUrl(user.avatarUrl)} className="w-full h-full object-cover rounded-2xl" alt="" />
                            ) : (
                                <User size={20} className="text-shisha-text-muted" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Escribe tu veredicto sobre esta alquimia..."
                            className="flex-1 bg-transparent border-none outline-none px-4 text-lg text-white placeholder:text-shisha-text-dim font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${commentText.trim() ? 'bg-shisha-neon text-white shadow-lg shadow-shisha-neon/30 hover:scale-105' : 'bg-white/5 text-shisha-text-dim cursor-not-allowed'}`}
                        >
                            <Send size={24} />
                        </button>
                    </form>
                ) : (
                    <div className="glass-panel p-16 rounded-[4rem] text-center space-y-8 bg-white/[0.01]">
                        <MessageCircle size={48} className="mx-auto text-shisha-text-dim opacity-10" />
                        <p className="text-shisha-text-muted text-xl font-medium">Inicia sesión para participar en el debate sobre esta mezcla.</p>
                        <Link to="/login" className="inline-block px-12 py-5 bg-shisha-neon hover:bg-shisha-neon-deep text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-shisha-neon/20 transition-all active:scale-95">
                            Acceder al Gremio
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {loadingComments ? (
                        <div className="py-20 text-center text-shisha-text-dim font-black animate-pulse">CARGANDO REPUTACIÓN...</div>
                    ) : (
                        comments.map((comment: any) => (
                            <div key={comment.id} className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] group hover:bg-white/[0.04] transition-all relative border-white/5">
                                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl transition-transform group-hover:scale-110">
                                        {comment.user?.avatarUrl ? (
                                            <img src={imageUrl(comment.user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-shisha-neon text-xl md:text-2xl uppercase">{comment.user?.nombre?.[0]}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h4 className="font-black text-white text-lg md:text-xl tracking-tight">{comment.user?.nombre || 'Anónimo'}</h4>
                                                <div className="flex items-center gap-2 text-shisha-text-dim">
                                                    <Calendar size={12} />
                                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                                        {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            {user && user.id === comment.user?.id && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="p-2 md:p-3 rounded-xl hover:bg-rose-500/10 text-shisha-text-dim hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-lg md:text-xl text-shisha-text-muted leading-relaxed font-serif italic">
                                            "{comment.texto}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-10 flex justify-center">
                    <Pagination currentPage={commentPage} totalPages={commentTotalPages} onPageChange={setCommentPage} />
                </div>
            </div>
        </div>
    )
}
