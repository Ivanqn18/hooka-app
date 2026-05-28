import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings, Save, ShoppingBag, FlaskConical, LayoutGrid, Star, ShieldCheck, Mail, Users, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Facehash, stringHash } from 'facehash';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

// Paleta ampliada de colores vibrantes para avatares
const BG_COLORS = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', // Rosas y morados brillantes
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', // Azules cyan y turquesas
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444' // Verdes, amarillos y naranjas fuertes
];

export default function Profile() {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalMezclas: 0, productosActivos: 0 });
    const [fullUser, setFullUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview | reviews
    const [userProducts, setUserProducts] = useState<any[]>([]);
    const [userMixes, setUserMixes] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        avatarUrl: '',
        bio: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setFormData({
            nombre: user.nombre || '',
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || ''
        });

        // Obtener estadísticas reales del backend
        api.get(`/users/${user.id}/stats`)
            .then((data: any) => setStats(data))
            .catch(err => console.error("Error fetching stats:", err));

        // Obtener el perfil completo con reseñas
        api.get(`/users/${user.id}`)
            .then((data: any) => setFullUser(data))
            .catch(err => console.error("Error fetching full user:", err));

        // Obtener las mezclas del usuario
        api.get('/mezclas', { params: { limit: 100 } })
            .then((res: any) => {
                const allMixes = Array.isArray(res) ? res : res.data || [];
                setUserMixes(allMixes.filter((m: any) => m.autorId === user.id));
            })
            .catch(err => console.error("Error fetching user mixes:", err));

        // Obtener los productos del usuario
        api.get('/marketplace/products', { params: { limit: 100, vendedorId: user.id } })
            .then((res: any) => {
                const allProducts = Array.isArray(res) ? res : res.data || [];
                setUserProducts(allProducts);
            })
            .catch(err => console.error("Error fetching user products:", err));

    }, [user, navigate]);

    const handleSave = async () => {
        try {
            // 1. Actualizar nombre y bio (JSON puro)
            const updatedUser: any = await api.put(`/users/${user.id}`, {
                nombre: formData.nombre,
                bio: formData.bio,
            });

            // 2. Si hay un archivo de avatar nuevo, subirlo en una petición separada
            let finalUser = updatedUser;
            if (avatarFile) {
                const avatarForm = new FormData();
                avatarForm.append('avatar', avatarFile);
                finalUser = await api.post(`/users/${user.id}/avatar`, avatarForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            updateUser(finalUser);
            setAvatarFile(null);
            setAvatarPreview(null);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el perfil");
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-reveal-up space-y-6 md:space-y-8">
            {/* Header / Avatar Card */}
            <div className="glass-panel-premium rounded-[2rem] md:rounded-[3rem] p-5 md:p-12 relative overflow-hidden flex flex-col items-center text-center shadow-3xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-shisha-ember/20 blur-[80px] rounded-full -translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 mb-8 group">
                    {(() => {
                        const avatarSrc = avatarPreview || imageUrl(formData.avatarUrl);
                        if (avatarSrc) {
                            return (
                                <div className="relative">
                                    <img
                                        src={avatarSrc}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-shisha-surface shadow-2xl transition-transform group-hover:scale-105"
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border-4 border-shisha-ember gap-1"
                                        >
                                            <Upload size={22} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Cambiar</span>
                                        </button>
                                    )}
                                </div>
                            );
                        } else {
                            const nameStr = formData.nombre || user.nombre || "Usuario";
                            const colorIndex = Math.abs(stringHash(nameStr)) % BG_COLORS.length;
                            const dynamicBgColor = BG_COLORS[colorIndex];
                            return (
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-shisha-surface shadow-2xl overflow-hidden transition-transform group-hover:scale-105" style={{ background: dynamicBgColor }}>
                                        <Facehash name={nameStr} size={128} intensity3d="none" variant="solid" showInitial={false} enableBlink={true} />
                                    </div>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border-4 border-shisha-ember gap-1"
                                        >
                                            <Upload size={22} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Subir foto</span>
                                        </button>
                                    )}
                                </div>
                            );
                        }
                    })()}
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpg,image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                    />
                </div>

                <div className="relative z-10 space-y-4 w-full max-w-xl">
                    {isEditing ? (
                        <div className="space-y-4 w-full md:w-[400px] mx-auto animate-reveal-up">
                            <input
                                type="text"
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-center focus:border-shisha-ember outline-none transition-all placeholder:text-shisha-text-dim/20"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Tu apodo en el gremio..."
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:border-shisha-ember/50 outline-none transition-all flex items-center gap-3 group"
                            >
                                <Upload size={16} className="text-shisha-text-dim group-hover:text-shisha-ember transition-colors shrink-0" />
                                <span className="text-shisha-text-dim group-hover:text-white transition-colors truncate">
                                    {avatarFile ? avatarFile.name : 'Seleccionar imagen de perfil...'}
                                </span>
                            </button>
                            <textarea
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium focus:border-shisha-ember outline-none transition-all resize-none placeholder:text-shisha-text-dim/20"
                                rows={3}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Escribe una breve leyenda sobre tu experiencia..."
                            />

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-shisha-text-dim hover:text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all active:scale-95">Descartar</button>
                                <button onClick={handleSave} className="flex-1 py-3 md:py-4 bg-shisha-ember hover:bg-shisha-ember-deep text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-shisha-ember/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={14} /> Guardar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-4">
                                    {user.nombre}
                                    {user.isAdmin && (
                                        <span className="bg-shisha-ember text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg text-white shadow-lg shadow-shisha-ember/20">Administrador</span>
                                    )}
                                </h1>
                                <p className="text-shisha-text-dim font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Mail size={12} className="text-shisha-ember" /> {user.email}
                                </p>
                            </div>

                            {user.bio ? (
                                <p className="text-lg text-shisha-text-muted font-medium italic leading-relaxed">"{user.bio}"</p>
                            ) : (
                                <p className="text-sm text-shisha-text-dim/40 italic">La leyenda de este fumador aún no ha sido escrita...</p>
                            )}

                            <button onClick={() => setIsEditing(true)} className="mx-auto flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-shisha-text-muted hover:text-white rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                                <Settings size={14} /> Configurar Perfil
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center justify-start md:justify-center gap-2 md:gap-4 p-2 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/5 overflow-x-auto scrollbar-hide scroll-smooth select-none">
                {[
                    { id: 'overview', icon: LayoutGrid, label: 'Resumen' },
                    { id: 'mezclas', icon: FlaskConical, label: 'Mis Mezclas' },
                    { id: 'productos', icon: ShoppingBag, label: 'Mis Ofertas' },
                    { id: 'reviews', icon: Star, label: 'Valoraciones' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-[1.5rem] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id
                            ? 'bg-shisha-ember text-white shadow-xl shadow-shisha-ember/20'
                            : 'text-shisha-text-dim hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.id === 'reviews' && fullUser?.reviewCount > 0 && (
                            <span className="ml-1 opacity-50">({fullUser.reviewCount})</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div className="animate-reveal-up pt-4">
                {activeTab === 'overview' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 shadow-xl border-l-shisha-ember border-l-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-shisha-ember/10 rounded-xl md:rounded-2xl flex items-center justify-center text-shisha-ember shrink-0">
                                    <FlaskConical className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Mezclas</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-white">{stats.totalMezclas}</h2>
                                </div>
                            </div>

                            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 shadow-xl border-l-[#fbbf24] border-l-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#fbbf24]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#fbbf24] shrink-0">
                                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Ofertas</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-white">{stats.productosActivos}</h2>
                                </div>
                            </div>

                            <div className="glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 flex flex-col items-start justify-center gap-4 shadow-xl border-l-indigo-500 border-l-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-12 md:h-12 bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white">Comunidad</p>
                                </div>
                                <div className="flex w-full gap-6 mt-1 overflow-hidden">
                                    <div className="flex-[1]">
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-none">{fullUser?.followers?.length || 0}</h2>
                                        <p className="text-[8px] md:text-[9px] font-bold text-shisha-text-dim uppercase tracking-widest mt-1">Sgds</p>
                                    </div>
                                    <div className="flex-[1]">
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-none">{fullUser?.following?.length || 0}</h2>
                                        <p className="text-[8px] md:text-[9px] font-bold text-shisha-text-dim uppercase tracking-widest mt-1">Siguiendo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Previsualización de Últimas Mezclas */}
                        {userMixes.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <FlaskConical size={18} className="text-shisha-ember" />
                                        Tus Últimas Creaciones
                                    </h3>
                                    <button onClick={() => setActiveTab('mezclas')} className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim hover:text-white transition-colors">
                                        Ver todas →
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userMixes.slice(0, 4).map((mix: any) => (
                                        <Link to={`/mezcla/${mix.id}`} key={mix.id} className="glass-panel p-5 rounded-2xl border-white/5 hover:border-shisha-ember/30 transition-all flex items-center gap-4 group shadow-lg">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-shisha-ember/5 border border-shisha-ember/10 group-hover:border-shisha-ember/30 transition-colors">
                                                {mix.imagenUrl ? (
                                                    <img src={imageUrl(mix.imagenUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="mix" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-shisha-ember"><FlaskConical size={18} /></div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <h4 className="text-base font-black text-white truncate group-hover:text-shisha-ember transition-colors leading-none mb-1.5">{mix.titulo}</h4>
                                                {mix.descripcion && (
                                                    <p className="text-[10px] text-shisha-text-muted font-medium line-clamp-1 mb-1.5">{mix.descripcion}</p>
                                                )}
                                                <span className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">{mix._count?.likes || 0} Likes</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'mezclas' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userMixes.length > 0 ? userMixes.map((mix: any) => (
                            <Link to={`/mezcla/${mix.id}`} key={mix.id} className="glass-panel p-5 rounded-2xl border-white/5 hover:border-shisha-ember/30 transition-all flex items-center gap-4 md:gap-6 group shadow-xl">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-shisha-ember/5 border border-shisha-ember/10 group-hover:border-shisha-ember/30 transition-colors">
                                    {mix.imagenUrl ? (
                                        <img src={imageUrl(mix.imagenUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="mix" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-shisha-ember"><FlaskConical size={24} /></div>
                                    )}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <h4 className="text-xl font-black text-white truncate group-hover:text-shisha-ember transition-colors leading-none mb-2">{mix.titulo}</h4>
                                    {mix.descripcion && (
                                        <p className="text-xs text-shisha-text-muted font-medium line-clamp-2 mb-2 leading-relaxed">
                                            {mix.descripcion}
                                        </p>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">{mix._count?.likes || 0} Likes</span>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center text-shisha-text-dim font-medium border-2 border-dashed border-white/5 rounded-[3rem]">Aún no has creado ninguna mezcla.</div>
                        )}
                    </div>
                ) : activeTab === 'productos' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userProducts.length > 0 ? userProducts.map((product: any) => (
                            <Link to={`/marketplace/${product.id}`} key={product.id} className="glass-panel p-5 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-4 md:gap-6 group shadow-xl">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                    {product.imagenUrl ? (
                                        <img src={imageUrl(product.imagenUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="product" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-emerald-500"><ShoppingBag size={24} /></div>
                                    )}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <h4 className="text-xl font-black text-white truncate group-hover:text-emerald-400 transition-colors leading-none mb-1.5">{product.titulo}</h4>
                                    {product.descripcion && (
                                        <p className="text-xs text-shisha-text-muted font-medium line-clamp-2 mb-2 leading-relaxed">
                                            {product.descripcion}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim bg-white/5 px-2 py-0.5 rounded">{product.categoria}</span>
                                        <span className="text-lg font-black text-emerald-400">{Number(product.precio).toFixed(2)}€</span>
                                        {product.estado && (
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                product.estado === 'DISPONIBLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                product.estado === 'RESERVADO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                                'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                            }`}>
                                                {product.estado}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center text-shisha-text-dim font-medium border-2 border-dashed border-white/5 rounded-[3rem]">Aún no tienes ninguna oferta activa en el marketplace.</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {!fullUser ? (
                            <div className="py-20 text-center text-shisha-text-dim font-black animate-pulse">CARGANDO REPUTACIÓN...</div>
                        ) : fullUser.reviewsReceived?.length > 0 ? (
                            <>
                                <div className="glass-panel p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-white/5 bg-amber-500/5 border-amber-500/10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 md:gap-8 shadow-2xl">
                                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shadow-xl border border-amber-500/20 shrink-0">
                                        <Star fill="currentColor" size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl md:text-5xl font-black text-white">{fullUser.rating?.toFixed(1) || '0.0'}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Media de confianza en el gremio</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {fullUser.reviewsReceived.map((rev: any) => (
                                        <div key={rev.id} className="glass-panel p-5 md:p-8 rounded-2xl border-white/5 hover:border-white/10 transition-colors shadow-xl">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={imageUrl(rev.comprador?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-shisha-ember"
                                                    />
                                                    <div>
                                                        <p className="font-black text-white">{rev.comprador?.nombre || 'Miembro Anónimo'}</p>
                                                        <p className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 bg-white/5 p-2 rounded-xl border border-white/5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.puntuacion ? '#fbbf24' : 'transparent'} color={i < rev.puntuacion ? '#fbbf24' : 'rgba(255,255,255,0.05)'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-base md:text-lg text-white font-medium italic leading-relaxed">"{rev.comentario}"</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="glass-panel p-20 rounded-[3rem] border-white/5 border-dashed border-2 flex flex-col items-center text-center gap-8 shadow-2xl">
                                <div className="w-24 h-24 bg-shisha-ember/5 rounded-full flex items-center justify-center text-shisha-ember/20">
                                    <ShieldCheck size={64} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">Sin Reputación</h3>
                                    <p className="text-shisha-text-dim font-medium max-w-sm">Aún no has recibido valoraciones. Completa transacciones en el marketplace para ganar honor.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
