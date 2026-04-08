import { useEffect, useState } from 'react';
import { X, Star, UserPlus, UserCheck } from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SellerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    sellerId: number;
}

export default function SellerProfileModal({ isOpen, onClose, sellerId }: SellerProfileModalProps) {
    const [seller, setSeller] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const currentUserId = user?.id;
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        api.get(`/users/${sellerId}`)
            .then((data: any) => {
                setSeller(data);
                if (currentUserId && data.followers) {
                    setIsFollowing(data.followers.some((f: any) => f.followerId === currentUserId));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching seller:", err);
                setLoading(false);
            });
    }, [isOpen, sellerId, currentUserId]);

    const handleToggleFollow = async () => {
        if (!currentUserId || followLoading) return;
        setFollowLoading(true);
        try {
            const res: any = await api.post(`/users/${sellerId}/follow`, { followerId: currentUserId });
            setIsFollowing(res.following);
            setSeller((prev: any) => ({
                ...prev,
                followers: res.following 
                    ? [...(prev.followers || []), { followerId: currentUserId }] 
                    : (prev.followers || []).filter((f: any) => f.followerId !== currentUserId)
            }));
        } catch (e) {
            console.error("Error toggling follow", e);
        }
        setFollowLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="bg-[#13151A]/70 backdrop-blur-md rounded-xl border border-white/5 shadow-xl animate-fade-in-up" style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '500px', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Perfil del Vendedor</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando información...</p>
                    ) : !seller ? (
                        <p style={{ textAlign: 'center', color: 'var(--danger-color)' }}>No se pudo cargar el perfil.</p>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                <img src={imageUrl(seller.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt={seller.nombre} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)', marginBottom: '1rem' }} />
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{seller.nombre}</h2>
                                {seller.bio && <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>"{seller.bio}"</p>}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                    <Star fill="#fbbf24" color="#fbbf24" size={20} />
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{seller.rating ? seller.rating.toFixed(1) : 'Nuevo'}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>({seller.reviewCount} valoraciones)</span>
                                </div>

                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{seller.followers?.length || 0}</span>
                                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Seguidores</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{seller.following?.length || 0}</span>
                                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Siguiendo</span>
                                    </div>
                                </div>

                                {currentUserId !== seller.id && (
                                    <button 
                                        onClick={() => {
                                            if (!currentUserId) {
                                                window.location.assign('/login');
                                                return;
                                            }
                                            handleToggleFollow();
                                        }}
                                        disabled={followLoading}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.8rem 2rem',
                                            borderRadius: '30px',
                                            border: 'none',
                                            background: isFollowing ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)',
                                            color: 'var(--text-primary)',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s',
                                            opacity: followLoading ? 0.7 : 1
                                        }}
                                    >
                                        {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </button>
                                )}
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Últimas Reseñas</h4>
                                {seller.reviewsReceived && seller.reviewsReceived.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {seller.reviewsReceived.map((rev: any) => (
                                            <div key={rev.id} style={{ background: 'var(--bg-surface-glass)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <img src={imageUrl(rev.comprador?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Comprador" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.comprador?.nombre || 'Anónimo'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex' }}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={14} fill={i < rev.puntuacion ? '#fbbf24' : 'transparent'} color={i < rev.puntuacion ? '#fbbf24' : 'var(--border-color)'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{rev.comentario}</p>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '0.5rem', display: 'block' }}>
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>El usuario aún no tiene valoraciones.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
