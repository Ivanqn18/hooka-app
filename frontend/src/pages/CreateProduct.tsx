import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Navigation, Tag, Euro, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GlassSelect from '../components/GlassSelect';

export default function CreateProduct() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        categoria: 'CACHIMBA',
        ubicacion: '',
        vendedorId: user?.id || 1
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['CACHIMBA', 'CAZOLETA', 'MANGUERA', 'GESTOR_CALOR', 'ACCESORIO', 'BASE', 'CARBON'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleGetLocation = () => {
        setLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`);
                        const data = await res.json();
                        if (data && data.address) {
                            const city = data.address.city || data.address.town || data.address.village || data.address.county || "Ubicación Geocodificada";
                            setFormData(prev => ({
                                ...prev,
                                ubicacion: city
                            }));
                        } else {
                            setFormData(prev => ({ ...prev, ubicacion: "Mi Ubicación" }));
                        }
                    } catch (e) {
                        console.error(e);
                        setFormData(prev => ({ ...prev, ubicacion: "Mi Ubicación" }));
                    } finally {
                        setLocationLoading(false);
                    }
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    toast.warning("No se pudo obtener la ubicación. Por favor, introdúcela manualmente.");
                    setLocationLoading(false);
                }
            );
        } else {
            toast.warning("Tu navegador no soporta geolocalización.");
            setLocationLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            toast.error("La imagen del producto es obligatoria");
            return;
        }

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('descripcion', formData.descripcion);
            formDataToSend.append('precio', formData.precio);
            formDataToSend.append('categoria', formData.categoria);
            formDataToSend.append('ubicacion', formData.ubicacion);
            formDataToSend.append('vendedorId', String(formData.vendedorId));
            formDataToSend.append('imagen', image);
            
            if (coords) {
                formDataToSend.append('latitud', String(coords.lat));
                formDataToSend.append('longitud', String(coords.lng));
            }

            await api.post('/marketplace/products', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/market');
        } catch (err) {
            console.error(err);
            toast.error("Error al publicar el producto");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up">
            <header className="mb-8 md:mb-10 text-center px-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-shisha-ember/10 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 md:mb-6 text-shisha-ember border border-shisha-ember/20 shadow-xl">
                    <ShoppingBag className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Vender Artículo</h1>
                <p className="text-sm md:text-base text-shisha-text-muted font-medium">Publica tu producto en el mercado de la comunidad</p>
            </header>

            <form onSubmit={handleSubmit} className="glass-panel p-5 md:p-12 rounded-2xl md:rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col gap-6 md:gap-8">
                
                {/* Image Upload */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1">Imagen del Producto (Obligatoria)</label>
                    <div 
                        onClick={() => document.getElementById('product-image')?.click()}
                        className="relative aspect-video rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-shisha-ember/50 transition-all cursor-pointer overflow-hidden group flex items-center justify-center"
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs uppercase tracking-widest">
                                    Cambiar Imagen
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-shisha-text-dim group-hover:text-shisha-ember transition-colors">
                                <ShoppingBag size={40} className="opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Click para subir foto</span>
                            </div>
                        )}
                        <input 
                            id="product-image"
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" 
                        />
                    </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                        <GlassSelect 
                            value={formData.categoria} 
                            onChange={val => setFormData({ ...formData, categoria: val })} 
                            icon={<Tag size={16} />}
                            options={categories.map(c => ({
                                value: c,
                                label: c.replace('_', ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
                            }))}
                        />
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
                    disabled={isSubmitting}
                    className="mt-2 md:mt-4 w-full py-4 md:py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-base md:text-lg rounded-2xl md:rounded-3xl shadow-2xl shadow-shisha-ember/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar en el Mercado'}
                </button>
            </form>
        </div>
    );
}
