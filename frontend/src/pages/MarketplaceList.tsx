import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Tag, MapPin, Navigation, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function MarketplaceList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const currentUserId = user?.id;

    // Filtros de distancia
    const [radius, setRadius] = useState<number | ''>('');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const fetchProducts = () => {
        setLoading(true);
        const params: any = { page, limit: 12 };

        if (radius && userLocation) {
            params.lat = userLocation.lat;
            params.lng = userLocation.lng;
            params.radius = radius;
        }

        api.get('/marketplace/products', { params })
            .then((result: any) => {
                setProducts(result.data);
                setTotalPages(result.totalPages);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, [radius, userLocation, page]);

    const handleGetLocation = () => {
        setLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    if (!radius) setRadius(10); // Default 10km al activar
                    setLocationLoading(false);
                },
                (error) => {
                    console.error(error);
                    toast.warning("No pudimos obtener tu ubicación.");
                    setLocationLoading(false);
                }
            );
        }
    };

    const handleQuickContact = async (e: React.MouseEvent, productId: number, sellerId: number) => {
        e.preventDefault(); // Prevent Link navigation
        if (!currentUserId) {
            toast.warning("Necesitas iniciar sesión para contactar con el vendedor.");
            navigate('/login');
            return;
        }

        if (sellerId === currentUserId) {
            toast.warning("No puedes abrir un chat contigo mismo.");
            return;
        }
        try {
            const chat: any = await api.post('/chats', { 
                productoId: productId, 
                interesadoId: currentUserId 
            });
            navigate(`/chat/${chat.id}`);
        } catch (err: any) {
            console.error("Error al crear el chat", err);
            toast.error("Hubo un error al intentar abrir el chat. Inicia sesión de nuevo si se reinició la base de datos.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-shisha-ember/10 flex items-center justify-center border border-shisha-ember/20 shadow-xl shadow-shisha-ember/5 text-shisha-ember">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Mercado Cachimbero</h1>
                        <p className="text-shisha-text-muted font-medium text-sm md:text-base">Equípate con lo mejor de la segunda mano.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="glass-panel px-4 md:px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between sm:justify-start gap-4 border-white/5 shadow-xl w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGetLocation}
                                disabled={locationLoading}
                                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    userLocation 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-white/5 border border-white/5 text-shisha-text-muted hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Navigation size={12} className={locationLoading ? 'animate-pulse' : ''} />
                                {userLocation ? 'Ubicación Activa' : 'Cerca de mí'}
                            </button>
                        </div>

                        {userLocation && (
                            <div className="flex items-center gap-3 md:gap-4 border-l border-white/10 pl-4 md:pl-6 animate-fade-in-right">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">Radio</span>
                                        <span className="text-[9px] md:text-[10px] font-black text-white">{radius}km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="100"
                                        value={radius || 10}
                                        onChange={(e) => setRadius(Number(e.target.value))}
                                        className="w-16 md:w-24 accent-shisha-ember"
                                    />
                                </div>
                                <button 
                                    onClick={() => { setUserLocation(null); setRadius(''); }} 
                                    className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                                >
                                    Filtro Off
                                </button>
                            </div>
                        )}
                    </div>

                    <Link to="/market/nuevo" className="shrink-0 text-white w-full sm:w-auto">
                        <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-shisha-ember/20 hover:shadow-shisha-ember/40 transition-all hover:-translate-y-1 active:scale-95 group w-full sm:w-auto">
                            <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
                            <span className="text-xs md:text-sm">Vender</span>
                        </button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                    <p className="text-shisha-text-dim font-bold animate-pulse">Buscando tesoros cercanos...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                        {products.map((p: any) => (
                            <Link to={`/marketplace/${p.id}`} key={p.id} className="glass-panel group rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col hover:border-shisha-ember/30 transition-all duration-500 hover:-translate-y-2">
                                <div className="relative h-48 md:h-60 overflow-hidden bg-shisha-surface/50 border-b border-white/5">
                                    {p.imagenUrl ? (
                                        <img 
                                            src={imageUrl(p.imagenUrl)} 
                                            alt={p.titulo} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-shisha-text-dim/20">
                                            <ShoppingBag className="w-10 h-10 md:w-12 md:h-12" />
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Sin imagen</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 md:top-4 md:left-4">
                                        <span className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 glass-panel rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember shadow-2xl">
                                            <Tag className="w-2.5 h-2.5 md:w-3 md:h-3" /> {p.categoria}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                                        <div className="px-3 py-1.5 md:px-4 md:py-2 glass-panel rounded-xl md:rounded-2xl shadow-3xl">
                                            <span className="text-lg md:text-xl font-black text-white">{Number(p.precio).toFixed(0)}€</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 md:p-8 flex flex-col flex-1 gap-3 md:gap-5">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black text-white mb-1 md:mb-2 line-clamp-1 group-hover:text-shisha-ember transition-colors">{p.titulo}</h3>
                                        <p className="text-shisha-text-muted text-[11px] md:text-xs font-medium line-clamp-2 leading-relaxed">
                                            {p.descripcion}
                                        </p>
                                    </div>

                                    {p.ubicacion && (
                                        <div className="flex items-center gap-2 py-1.5 px-2 md:py-2 md:px-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
                                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-shisha-neon" />
                                            <span className="text-[9px] md:text-[10px] font-bold text-shisha-text-dim uppercase tracking-wider truncate">
                                                {p.ubicacion} 
                                                {userLocation && radius && <span className="text-shisha-neon ml-2">Prox. {radius}km</span>}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-white/10">
                                                <img 
                                                    src={imageUrl(p.seller?.avatarUrl) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                                                    className="w-full h-full object-cover" 
                                                    alt="seller" 
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-tight">
                                                    {p.seller?.nombre || 'Anónimo'}
                                                </span>
                                                <div className="flex items-center gap-1 text-[#fbbf24]">
                                                    <Star className="w-2 md:w-2.5 h-2 md:h-2.5" fill="currentColor" />
                                                    <span className="text-[8px] md:text-[9px] font-black">{p.seller?.rating ? p.seller.rating.toFixed(1) : 'NEW'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleQuickContact(e, p.id, p.vendedorId)}
                                            className="w-10 h-10 rounded-xl bg-shisha-ember/10 flex items-center justify-center text-shisha-ember hover:bg-shisha-ember hover:text-white transition-all active:scale-90 border border-shisha-ember/20 group/btn"
                                            title="Contactar ya"
                                        >
                                            <MessageCircle size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {products.length === 0 && (
                            <div className="col-span-full py-20 glass-panel rounded-[3rem] text-center p-12">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                                    <ShoppingBag size={40} className="text-shisha-text-dim" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4">Aún no hay tesoros</h3>
                                <p className="text-shisha-text-muted font-medium mb-10 max-w-md mx-auto leading-relaxed">
                                    Parece que nadie ha puesto a la venta su arsenal. ¡Pionero! Sé el primero en abrir el mercado.
                                </p>
                                <Link to="/market/nuevo" className="inline-block">
                                    <button className="px-8 py-4 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-2xl transition-all shadow-xl shadow-shisha-ember/20">
                                        Empezar a Vender
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-16">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </>
            )}
        </div>
    );
}
