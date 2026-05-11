import { useState, useEffect } from 'react';
import { X, Star, Users, FlaskConical, ShoppingBag, ShieldCheck } from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import { Facehash, stringHash } from 'facehash';
import api from '../services/api';

// Paleta de colores para los avatares automáticos (Misma que en Profile)
const BG_COLORS = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444'
];

interface PublicProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
}

export default function PublicProfileModal({ isOpen, onClose, userId }: PublicProfileModalProps) {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ totalMezclas: 0, productosActivos: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/stats`).catch(() => ({ totalMezclas: 0, productosActivos: 0 }))
            ]).then(([userData, statsData]: any) => {
                setUser(userData);
                setStats(statsData);
                setLoading(false);
            }).catch(err => {
                console.error("Error fetching user profile:", err);
                setLoading(false);
            });
        } else {
            setUser(null);
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const nameStr = user?.nombre || "Usuario";
    const colorIndex = Math.abs(stringHash(nameStr)) % BG_COLORS.length;
    const dynamicBgColor = BG_COLORS[colorIndex];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-shisha-bg/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div
                className="glass-panel-premium w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] border-white/10 shadow-3xl overflow-hidden relative flex flex-col max-h-[90vh] animate-reveal-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
                >
                    <X size={20} />
                </button>

                {loading || !user ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                        <p className="text-shisha-text-dim font-black uppercase tracking-widest text-[10px]">Cargando información...</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto custom-scrollbar flex-1 pb-8">
                        <div className="p-8 md:p-12 relative flex flex-col items-center text-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-shisha-ember/20 blur-[80px] rounded-full -translate-y-1/2 pointer-events-none" />

                            <div className="relative z-10 mb-6">
                                {user.avatarUrl ? (
                                    <img src={imageUrl(user.avatarUrl)} alt="Avatar" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-shisha-surface shadow-2xl" />
                                ) : (
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-shisha-surface shadow-2xl overflow-hidden" style={{ background: dynamicBgColor }}>
                                        <Facehash name={nameStr} size={128} intensity3d="none" variant="solid" showInitial={false} enableBlink={true} />
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 space-y-3">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-3">
                                    {user.nombre}
                                    {user.isAdmin && <span className="bg-shisha-ember text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg text-white">Admin</span>}
                                </h2>
                                {user.bio ? (
                                    <p className="text-shisha-text-muted font-medium italic text-base max-w-md mx-auto">"{user.bio}"</p>
                                ) : (
                                    <p className="text-shisha-text-dim/50 font-medium italic text-sm">Este usuario aún no ha escrito su leyenda...</p>
                                )}
                            </div>
                        </div>

                        <div className="px-8 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center gap-2 border-white/5">
                                <FlaskConical className="text-shisha-ember" size={20} />
                                <div>
                                    <h4 className="text-xl font-black text-white">{stats.totalMezclas}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">Mezclas</p>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center gap-2 border-white/5">
                                <ShoppingBag className="text-emerald-500" size={20} />
                                <div>
                                    <h4 className="text-xl font-black text-white">{stats.productosActivos}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">En Venta</p>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center gap-2 border-white/5">
                                <Users className="text-indigo-400" size={20} />
                                <div>
                                    <h4 className="text-xl font-black text-white">{user.followers?.length || 0}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">Sgds</p>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center gap-2 border-white/5">
                                <Star className="text-amber-400" size={20} />
                                <div>
                                    <h4 className="text-xl font-black text-white">{user.rating ? user.rating.toFixed(1) : '-'}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">Rating</p>
                                </div>
                            </div>
                        </div>

                        {user.reviewsReceived && user.reviewsReceived.length > 0 && (
                            <div className="px-8 md:px-12 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" /> Valoraciones Recientes
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {user.reviewsReceived.slice(0, 3).map((rev: any) => (
                                        <div key={rev.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-white text-sm flex items-center gap-2">
                                                    {rev.comprador?.nombre || 'Anónimo'}
                                                </span>
                                                <div className="flex gap-0.5 bg-white/5 px-2 py-1 rounded-lg">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={10} fill={i < rev.puntuacion ? '#fbbf24' : 'transparent'} color={i < rev.puntuacion ? '#fbbf24' : 'rgba(255,255,255,0.05)'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-shisha-text-muted text-sm italic">"{rev.comentario}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}