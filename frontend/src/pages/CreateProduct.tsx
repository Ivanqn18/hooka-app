import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Tag, Euro, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function CreateProduct() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        categoria: 'CACHIMBA',
        ubicacion: '',
        vendedorId: user?.id || 1
    });

    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const categories = ['CACHIMBA', 'CAZOLETA', 'MANGUERA', 'GESTOR_CALOR', 'ACCESORIO', 'BASE', 'CARBON'];

    const handleGetLocation = () => {
        setLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });

                    // Solo para experiencia visual en la demo (simularemos que sacamos la ciudad)
                    if (!formData.ubicacion) setFormData({ ...formData, ubicacion: "Mi Ubicación Actual" });
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    alert("No se pudo obtener la ubicación. Por favor, introdúcela manualmente.");
                    setLocationLoading(false);
                }
            );
        } else {
            alert("Tu navegador no soporta geolocalización.");
            setLocationLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                precio: parseFloat(formData.precio),
                ...(coords && { latitud: coords.lat, longitud: coords.lng })
            };

            await api.post('/marketplace/products', payload);
            navigate('/market');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 animate-reveal-up">
            <header className="mb-8 md:mb-10 text-center px-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-shisha-ember/10 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 md:mb-6 text-shisha-ember border border-shisha-ember/20 shadow-xl">
                    <ShoppingBag className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Vender Artículo</h1>
                <p className="text-sm md:text-base text-shisha-text-muted font-medium">Publica tu producto en el mercado de la comunidad</p>
            </header>

            <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col gap-8">
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1">Qué vendes</label>
                    <div className="relative">
                        <input 
                            required 
                            type="text" 
                            placeholder="Ej: Steamulation Pro X II" 
                            value={formData.titulo} 
                            onChange={e => setFormData({ ...formData, titulo: e.target.value })} 
                            className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all placeholder:text-shisha-text-dim/40 text-sm md:text-base"
                        />
                        <Sparkles className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-shisha-text-dim/20" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1">Precio</label>
                        <div className="relative">
                            <input 
                                required 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                value={formData.precio} 
                                onChange={e => setFormData({ ...formData, precio: e.target.value })} 
                                className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-black text-lg md:text-xl focus:border-shisha-ember/50 outline-none transition-all"
                            />
                            <Euro className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-shisha-text-dim" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1">Categoría</label>
                        <div className="relative">
                            <select 
                                value={formData.categoria} 
                                onChange={e => setFormData({ ...formData, categoria: e.target.value })} 
                                className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-bold appearance-none focus:border-shisha-ember/50 outline-none transition-all cursor-pointer text-sm md:text-base"
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-shisha-surface text-black md:text-white">{c.replace('_', ' ')}</option>)}
                            </select>
                            <Tag className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-shisha-text-dim pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember">Ubicación</label>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationLoading || coords !== null}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                coords 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-shisha-ember/10 text-shisha-ember border border-shisha-ember/20 hover:bg-shisha-ember hover:text-white'
                            }`}
                        >
                            {coords ? <MapPin size={12} /> : <Navigation size={12} className={locationLoading ? 'animate-pulse' : ''} />}
                            {coords ? 'Capturada' : (locationLoading ? 'Buscando...' : 'Autolocalizar')}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            required
                            type="text"
                            placeholder="Ej: Madrid, Centro"
                            value={formData.ubicacion}
                            onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                            className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm md:text-base"
                        />
                        <MapPin className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-shisha-text-dim/20" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1">Descripción y Estado</label>
                    <div className="relative">
                        <textarea 
                            required 
                            rows={4} 
                            placeholder="Describe el estado, desperfectos, tiempo de uso..." 
                            value={formData.descripcion} 
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })} 
                            className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all resize-none placeholder:text-shisha-text-dim/40 text-sm md:text-base"
                        />
                        <AlertCircle className="absolute right-5 md:right-6 top-6 text-shisha-text-dim/20" size={18} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="mt-2 md:mt-4 w-full py-4 md:py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-base md:text-lg rounded-2xl md:rounded-3xl shadow-2xl shadow-shisha-ember/30 transition-all hover:-translate-y-1 active:scale-[0.98]"
                >
                    Publicar en el Mercado
                </button>
            </form>
        </div>
    );
}
