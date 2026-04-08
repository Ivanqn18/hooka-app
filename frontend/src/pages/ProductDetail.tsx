import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { imageUrl } from '../utils/imageUrl';
import { ArrowLeft, MessageCircle, Tag, Star, Eye, Calendar, Sparkles, ShieldCheck, UserPlus, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SellerProfileModal from '../components/SellerProfileModal';
import api from '../services/api';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const currentUserId = user?.id;
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Estado para nueva reseña
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const fetchProductData = async () => {
        try {
            const data: any = await api.get(`/marketplace/products/${id}`);
            setProduct(data);

            // Re-fetcheamos vendedor para coger reviews en caso de que acabe de añadirse una
            if (data.vendedorId) {
                const sellerData: any = await api.get(`/users/${data.vendedorId}`);
                setSeller(sellerData);
                if (currentUserId && sellerData.followers) {
                    setIsFollowing(sellerData.followers.some((f: any) => f.followerId === currentUserId));
                }
            }

            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewStatus('loading');

        try {
            await api.post(`/users/${product.vendedorId}/reviews`, {
                compradorId: currentUserId,
                puntuacion: rating,
                comentario: reviewComment
            });

            setReviewStatus('success');
            setReviewComment('');
            fetchProductData(); // Recargar datos del vendedor
        } catch (e) {
            setReviewStatus('error');
        }
    };

    const handleToggleFollow = async () => {
        if (!currentUserId || !seller || followLoading) return;
        setFollowLoading(true);
        try {
            const res: any = await api.post(`/users/${seller.id}/follow`, { followerId: currentUserId });
            setIsFollowing(res.following);
            setSeller((prev: any) => ({
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

    const handleContactSeller = async () => {
        if (!currentUserId) {
            alert("Necesitas iniciar sesión para contactar con el vendedor.");
            navigate('/login');
            return;
        }

        if (product.vendedorId === currentUserId) {
            alert("No puedes abrir un chat contigo mismo.");
            return;
        }

        try {
            const chat: any = await api.post('/chats', {
                productoId: Number(id),
                interesadoId: currentUserId
            });
            navigate(`/chat/${chat.id}`);
        } catch (err: any) {
            console.error("Error al crear el chat", err);
            alert("Hubo un error al intentar abrir el chat. Si la base de datos se reinició, tu sesión podría ser inválida. Intenta cerrar sesión y volver a entrar.");
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
                <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                <p className="text-shisha-text-dim font-bold animate-pulse">Examinando detalles del producto...</p>
            </div>
        );
    }
    
    if (!product) {
        return (
            <div className="py-20 text-center animate-reveal-up">
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                    <Eye size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Producto no encontrado</h3>
                <p className="text-shisha-text-muted mb-8">Parece que este artículo ya no está disponible en el mercado.</p>
                <Link to="/market" className="px-6 py-3 bg-shisha-ember text-white rounded-xl font-bold">Volver al Mercado</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 animate-reveal-up">
            <Link to="/market" className="inline-flex items-center gap-2 text-shisha-text-muted hover:text-white mb-8 group transition-colors font-bold uppercase tracking-widest text-[10px]">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al mercado
            </Link>

            <div className="glass-panel overflow-hidden rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl flex flex-col">
                <div className="relative h-[250px] md:h-[450px]">
                    {product.imagenUrl ? (
                        <img src={imageUrl(product.imagenUrl)} alt={product.titulo} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-shisha-surface to-shisha-bg flex items-center justify-center text-shisha-text-dim/20">
                            <Sparkles size={80} />
                        </div>
                    )}
                    <div className="absolute top-6 left-6 md:top-8 md:left-8">
                        <div className="px-3 py-1.5 md:px-4 md:py-2 glass-panel rounded-xl md:rounded-2xl flex items-center gap-2 border-white/10 shadow-3xl">
                            <Tag size={14} className="text-shisha-ember" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">{product.categoria}</span>
                        </div>
                    </div>
                    <div className="absolute top-6 right-6 md:top-8 md:right-8">
                        <div className={`px-3 py-1.5 md:px-4 md:py-2 glass-panel rounded-xl md:rounded-2xl border-white/10 shadow-3xl text-[10px] font-black uppercase tracking-widest ${
                            product.estado === 'DISPONIBLE' ? 'text-emerald-400' : 'text-shisha-text-dim'
                        }`}>
                            {product.estado}
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-14 flex flex-col gap-8 md:gap-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2 md:space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3 text-shisha-text-dim">
                                <Calendar size={14} />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Publicado en {new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-none">{product.titulo}</h1>
                        </div>

                        <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1">
                            <span className="text-2xl md:text-5xl font-black bg-gradient-to-br from-white to-shisha-text-dim bg-clip-text text-transparent tracking-tighter">
                                {Number(product.precio).toFixed(2)}€
                            </span>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">IVA incluido</span>
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-shisha-ember border-b border-shisha-ember/10 pb-3 flex items-center gap-2">
                            <Sparkles size={14} /> Descripción del Artículo
                        </h3>
                        <p className="text-base md:text-lg leading-relaxed text-shisha-text-muted font-medium max-w-3xl">
                            {product.descripcion}
                        </p>
                    </div>

                    <div className="mt-2 md:mt-6 flex flex-wrap items-center justify-between gap-6 md:gap-8 pt-8 md:pt-10 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-shisha-text-dim border border-white/10">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs md:text-sm uppercase">Compra Segura</h4>
                                <p className="text-[9px] md:text-[10px] font-bold text-shisha-text-dim uppercase tracking-wider">Verificado por HookaGremio</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleContactSeller} 
                            className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-xl md:rounded-3xl shadow-2xl shadow-shisha-ember/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm md:text-lg">Contactar Vendedor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DEL VENDEDOR */}
            {seller && (
                <div className="glass-panel w-full p-8 md:p-14 rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-xl mt-8 md:mt-10 animate-reveal-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img 
                                    src={imageUrl(seller.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] object-cover border-4 border-shisha-surface shadow-2xl" 
                                    alt="vendedor" 
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-500 border-4 border-shisha-bg flex items-center justify-center text-white">
                                    <Star size={10} fill="currentColor" />
                                </div>
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">{seller.nombre}</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-amber-400">
                                        <Star fill="currentColor" size={16} />
                                        <span className="text-base md:text-lg font-black">{seller.rating ? seller.rating.toFixed(1) : 'Nuevo'}</span>
                                    </div>
                                    {seller.reviewCount > 0 && (
                                        <span className="text-[9px] md:text-[10px] font-black text-shisha-text-dim uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">
                                            {seller.reviewCount} valoraciones
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 py-1">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-shisha-text-dim" />
                                        <span className="text-xs md:text-sm font-black text-white">{seller.followers?.length || 0}</span>
                                        <span className="text-[9px] uppercase font-bold text-shisha-text-dim">Seguidores</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs md:text-sm font-black text-white">{seller.following?.length || 0}</span>
                                        <span className="text-[9px] uppercase font-bold text-shisha-text-dim">Siguiendo</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    {currentUserId !== seller.id && (
                                        <button 
                                            onClick={() => {
                                                if (!currentUserId) {
                                                    navigate('/login');
                                                    return;
                                                }
                                                handleToggleFollow();
                                            }}
                                            disabled={followLoading}
                                            className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg ${
                                                isFollowing 
                                                    ? 'bg-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500 border border-white/5 hover:border-rose-500/20' 
                                                    : 'bg-shisha-ember hover:bg-shisha-ember-deep text-white shadow-shisha-ember/20'
                                            }`}
                                        >
                                            {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                                            {isFollowing ? 'Siguiendo' : 'Seguir Vendedor'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsSellerModalOpen(true)}
                                        className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember hover:text-white transition-colors flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10"
                                    >
                                        <Eye size={12} /> Ver Reseñas
                                    </button>
                                </div>
                            </div>
                        </div>

                        {currentUserId && currentUserId !== seller.id && (
                            <div className="w-full md:w-auto">
                                {reviewStatus === 'success' ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-emerald-400 text-xs font-bold animate-fade-in">
                                        ¡Valoración publicada! Gracias por tu aporte.
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button
                                                    key={num} type="button"
                                                    onClick={() => setRating(num)}
                                                    className={`p-1 transition-transform hover:scale-125 ${rating >= num ? 'text-amber-400' : 'text-shisha-text-dim/30'}`}
                                                >
                                                    <Star size={24} fill={rating >= num ? 'currentColor' : 'transparent'} />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                className="px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-medium w-full md:w-80 h-24 focus:border-shisha-ember/50 outline-none transition-all resize-none"
                                                placeholder="Opinión rápida sobre el vendedor..."
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={reviewStatus === 'loading'} 
                                            className="px-6 py-3.5 bg-white/5 hover:bg-shisha-ember hover:text-white text-shisha-text-muted font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {reviewStatus === 'loading' ? 'Enviando...' : 'Valorar Vendedor'}
                                        </button>
                                        {reviewStatus === 'error' && <p className="text-rose-500 text-[10px] font-bold uppercase">Error al publicar</p>}
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {seller && (
                <SellerProfileModal
                    isOpen={isSellerModalOpen}
                    onClose={() => setIsSellerModalOpen(false)}
                    sellerId={seller.id}
                />
            )}
        </div>
    );
}
