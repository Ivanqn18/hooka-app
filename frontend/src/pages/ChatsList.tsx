import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function ChatsList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        api.get(`/chats/user/${user.id}`)
            .then((data: any) => {
                setChats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Error al cargar tus conversaciones");
                setLoading(false);
            });
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
                <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                <p className="text-shisha-text-dim font-bold animate-pulse">Cargando tus conversaciones...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up">
            <div className="flex items-center gap-4 md:gap-5 mb-8 md:mb-12">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-shisha-ember/10 flex items-center justify-center border border-shisha-ember/20 shadow-xl shadow-shisha-ember/5 text-shisha-ember">
                    <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Tus Conversaciones</h1>
                    <p className="text-shisha-text-muted font-medium text-sm md:text-base">Negociaciones y ofertas activas en el mercado.</p>
                </div>
            </div>

            {chats.length === 0 ? (
                <div className="py-20 glass-panel rounded-[3rem] text-center p-12 border-white/5 shadow-2xl">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                        <MessageCircle size={40} className="text-shisha-text-dim" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">No hay chats activos</h3>
                    <p className="text-shisha-text-muted font-medium mb-10 max-w-md mx-auto leading-relaxed">
                        Aún no has iniciado ninguna conversación. Explora el mercado y contacta con algún vendedor.
                    </p>
                    <Link to="/market" className="inline-block">
                        <button className="px-8 py-4 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-2xl transition-all shadow-xl shadow-shisha-ember/20 cursor-pointer">
                            Explorar Mercado
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {chats.map((chat) => {
                        const isBuyer = chat.interesadoId === user.id;
                        const otherUser = isBuyer ? chat.product?.seller : chat.buyer;
                        const product = chat.product;

                        return (
                            <Link
                                to={`/chat/${chat.id}`}
                                key={chat.id}
                                className="glass-panel p-5 rounded-2xl border-white/5 hover:border-shisha-ember/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group shadow-xl"
                            >
                                <div className="flex items-center gap-4 md:gap-6 overflow-hidden w-full sm:w-auto">
                                    {/* Other user avatar */}
                                    <div className="relative shrink-0">
                                        <img
                                            src={imageUrl(otherUser?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-shisha-ember/30 transition-colors shadow-lg"
                                            alt={otherUser?.nombre || 'Usuario'}
                                        />
                                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-shisha-bg border border-white/10 flex items-center justify-center text-[8px] font-black uppercase tracking-widest text-shisha-text-muted">
                                            {isBuyer ? 'Vendedor' : 'Comprador'}
                                        </div>
                                    </div>

                                    {/* Chat text info */}
                                    <div className="overflow-hidden flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-shisha-text-dim uppercase tracking-widest">
                                                Conversación con
                                            </span>
                                            <span className="text-xs font-black text-white uppercase bg-white/5 px-2 py-0.5 rounded">
                                                {otherUser?.nombre || 'Miembro del Gremio'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-black text-white truncate group-hover:text-shisha-ember transition-colors leading-tight mb-2 flex items-center gap-2">
                                            {product?.titulo || 'Artículo de segunda mano'}
                                            {product?.estado && product.estado !== 'DISPONIBLE' && (
                                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                    product.estado === 'RESERVADO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                }`}>
                                                    {product.estado}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-3 text-shisha-text-dim text-[10px] font-bold uppercase tracking-wider">
                                            <Calendar size={12} className="text-shisha-text-dim" />
                                            <span>Actualizado: {new Date(chat.updatedAt).toLocaleDateString()} {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                                    {/* Mini thumbnail of product */}
                                    {product?.imagenUrl && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 bg-shisha-surface shrink-0 hidden md:block">
                                            <img
                                                src={imageUrl(product.imagenUrl)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Enter Chat Button */}
                                    <button
                                        className="px-5 py-3 rounded-xl bg-shisha-ember/10 flex items-center gap-2 text-shisha-ember hover:bg-shisha-ember hover:text-white transition-all active:scale-95 border border-shisha-ember/20 group/btn font-black text-[10px] uppercase tracking-widest ml-auto sm:ml-0"
                                    >
                                        <span>Ver Negociación</span>
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
