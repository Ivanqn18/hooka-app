// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Plus, X, Search, ChevronRight, Navigation, Sparkles, Map as MapIcon, Info, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import { imageUrl } from '../utils/imageUrl';

import api from '../services/api';

// Fix typical Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [39.5, -3.0]; // Centro de Spain
const spainBounds: L.LatLngBoundsExpression = [
    [27.0, -18.5],
    [44.0, 4.5]
];

function MapClickHandler({ onMapClick, active }) {
    useMapEvents({
        click(e) {
            if (active) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

export default function MapView() {
    const { user } = useAuth();
    const [bars, setBars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Sidebar state
    const [showSidebar, setShowSidebar] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        descripcion: '',
        latitud: null,
        longitud: null
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [geocoding, setGeocoding] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const tileLayerUrl = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

    useEffect(() => {
        fetchBares();
    }, []);

    const fetchBares = () => {
        api.get('/bares')
            .then((data: any) => {
                setBars(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleAddressGeocode = async () => {
        if (!formData.direccion) return;
        setGeocoding(true);
        setSuggestions([]);
        setShowSuggestions(false);
        try {
            const query = encodeURIComponent(formData.direccion + ", España");
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
            const data = await res.json();
            if (data && data.length > 0) {
                setSuggestions(data);
                setShowSuggestions(true);
            } else {
                alert("No se encontraron resultados para esta dirección. Prueba a hacer clic directamente en el mapa.");
            }
        } catch (e) {
            console.error(e);
            alert("Error al buscar la dirección.");
        } finally {
            setGeocoding(false);
        }
    };

    const handleMapClick = async (latlng: L.LatLng) => {
        setFormData(prev => ({
            ...prev,
            latitud: latlng.lat,
            longitud: latlng.lng
        }));

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18`);
            const data = await res.json();
            if (data && data.display_name) {
                setFormData(prev => ({
                    ...prev,
                    direccion: data.display_name
                }));
            }
        } catch (e) {
            console.error("Error al geocodificar las coordenadas:", e);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.latitud === null) {
            alert("Selecciona una ubicación en el mapa o busca la dirección.");
            return;
        }

        setSubmitStatus('loading');
        try {
            const payload = {
                ...formData,
                solicitanteId: user?.id,
                imagenUrl: 'https://images.unsplash.com/photo-1542385262-cdf06b302c2e?q=80&w=600&auto=format&fit=crop'
            };

            await api.post('/bares', payload);

            setSubmitStatus('success');
            setTimeout(() => {
                setShowSidebar(false);
                setSubmitStatus('idle');
                setFormData({ nombre: '', direccion: '', descripcion: '', latitud: null, longitud: null });
                setSuggestions([]);
                setShowSuggestions(false);
                fetchBares();
            }, 3000);

        } catch (error) {
            setSubmitStatus('error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col gap-4 md:gap-6 animate-reveal-up overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shrink-0">
                <div className="flex items-center gap-3 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-shisha-ember/10 rounded-xl md:rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20 shadow-xl shadow-shisha-ember/5 text-shisha-ember">
                        <MapIcon className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Mapa de Lounges</h1>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-1.5">
                            <Sparkles size={10} className="text-shisha-ember" /> El Gremio recomienda moderación
                        </p>
                    </div>
                </div>
                {user && (
                    <button 
                        onClick={() => setShowSidebar(true)} 
                        className="w-full md:w-auto px-5 md:px-6 py-3 md:py-3.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-shisha-ember/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 md:w-[16px] md:h-[16px] group-hover:rotate-90 transition-transform" />
                        Solicitar Nuevo Lounge
                    </button>
                )}
            </header>

            <div className="flex-1 flex gap-4 md:gap-6 min-h-0 relative">
                {/* Map Container */}
                <div className="glass-panel flex-1 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-shisha-bg/60 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Localizando lounges...</p>
                            </div>
                        </div>
                    )}
                    <LeafletMap 
                        center={defaultCenter} 
                        zoom={6} 
                        className="w-full h-full z-10"
                        maxBounds={spainBounds}
                    >
                        <TileLayer url={tileLayerUrl} attribution='&copy; CARTO' />
                        <MapClickHandler active={showSidebar} onMapClick={handleMapClick} />
                        
                        {bars.map(bar => (
                            <Marker key={bar.id} position={[bar.latitud, bar.longitud]}>
                                <Popup className="custom-popup">
                                    <div className="min-w-[200px] p-2 flex flex-col gap-3">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-white leading-tight">{bar.nombre}</h4>
                                            <p className="text-[10px] font-medium text-shisha-text-dim leading-relaxed">{bar.direccion}</p>
                                        </div>
                                        <Link to={`/bar/${bar.id}`} className="block w-full py-2 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[9px] uppercase tracking-widest text-center rounded-lg transition-all shadow-lg active:scale-95">
                                            Explorar Local
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
 
                        {showSidebar && formData.latitud && (
                            <Marker position={[formData.latitud, formData.longitud]} icon={new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                                iconSize: [25, 41], iconAnchor: [12, 41]
                            })}>
                                <Popup><span className="text-[10px] font-black uppercase tracking-widest text-shisha-ember">📍 Ubicación Elegida</span></Popup>
                            </Marker>
                        )}
                    </LeafletMap>
                </div>
 
                {/* Sidebar for Solicitar Lounge */}
                {showSidebar && (
                    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[2000] pointer-events-none md:p-4 lg:p-8">
                        <div className="w-full h-full glass-panel-premium bg-shisha-surface/95 backdrop-blur-2xl border-l md:border border-white/10 shadow-3xl animate-fade-in-right p-5 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto pointer-events-auto md:rounded-[2.5rem] lg:rounded-[3rem]">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">Nueva Solicitud</h2>
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-ember">Colaboración del Gremio</span>
                                </div>
                                <button onClick={() => { setShowSidebar(false); setSuggestions([]); setShowSuggestions(false); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-shisha-text-dim hover:text-white transition-colors border border-white/5">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 bg-shisha-ember/10 border border-shisha-ember/20 rounded-2xl flex items-start gap-4">
                                <Compass className="text-shisha-ember shrink-0 mt-1" size={20} />
                                <p className="text-[11px] font-medium text-shisha-text-muted leading-relaxed">
                                    Para registrar un nuevo local, haz <strong className="text-white">clic en el mapa</strong> para marcar el punto exacto, o utiliza el buscador de dirección.
                                </p>
                            </div>

                            {submitStatus === 'success' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl text-emerald-400 text-center animate-fade-in">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus size={24} className="rotate-45" />
                                    </div>
                                    <h4 className="text-lg font-black mb-1">¡Solicitud Enviada!</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-muted">Será revisada por un administrador</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAddSubmit} className="flex flex-col gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Nombre Comercial</label>
                                        <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all placeholder:text-shisha-text-dim/30 text-sm md:text-base" placeholder="Ej: Elite Shisha Lounge" />
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Dirección Aproximada</label>
                                        <div className="flex gap-3">
                                            <input 
                                                required 
                                                value={formData.direccion} 
                                                onChange={e => {
                                                    setFormData({...formData, direccion: e.target.value});
                                                    setShowSuggestions(false);
                                                }} 
                                                className="flex-1 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all placeholder:text-shisha-text-dim/30 text-sm md:text-base" 
                                                placeholder="Ej: Gran Via 1, Madrid" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleAddressGeocode} 
                                                disabled={geocoding} 
                                                className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-shisha-ember hover:bg-shisha-ember-deep text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 shrink-0"
                                            >
                                                {geocoding ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Search size={20} />}
                                            </button>
                                        </div>

                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-[75px] left-0 w-full bg-[#1b1e24] border border-white/10 rounded-2xl shadow-2xl z-[2100] max-h-52 overflow-y-auto py-2">
                                                {suggestions.map((sug, idx) => (
                                                    <button
                                                        type="button"
                                                        key={idx}
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                direccion: sug.display_name,
                                                                latitud: parseFloat(sug.lat),
                                                                longitud: parseFloat(sug.lon)
                                                            }));
                                                            setShowSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-5 py-3 hover:bg-white/5 text-white font-medium text-xs flex flex-col gap-1 border-b border-white/5 last:border-b-0"
                                                    >
                                                        <span className="font-bold text-shisha-text-main line-clamp-1">{sug.display_name.split(',')[0]}</span>
                                                        <span className="text-shisha-text-dim text-[10px] line-clamp-1">{sug.display_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-2">
                                                <Navigation size={12} /> Coordenadas Map
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${formData.latitud ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                {formData.latitud ? 'Detectadas ✓' : 'Pendiente ✗'}
                                            </span>
                                        </div>
                                        {formData.latitud && (
                                            <div className="flex gap-6 justify-center text-[10px] font-black text-white font-mono">
                                                <span>LAT {formData.latitud.toFixed(6)}</span>
                                                <span>LON {formData.longitud.toFixed(6)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Por qué añadirlo</label>
                                        <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all resize-none placeholder:text-shisha-text-dim/30 text-sm md:text-base" placeholder="Ambiente, calidad de tabaco, servicios exclusivos..." />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={!formData.latitud || submitStatus === 'loading'} 
                                        className="w-full py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-shisha-ember/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed group"
                                    >
                                        {submitStatus === 'loading' ? 'Enviando Solicitud...' : 'Publicar Propuesta'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .leaflet-container { font-family: inherit; }
                .leaflet-popup-content-wrapper { background: #13151a !important; color: white !important; border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 0 !important; overflow: hidden; }
                .leaflet-popup-content { margin: 0 !important; width: auto !important; }
                .leaflet-popup-tip { background: #13151a !important; border: 1px solid rgba(255,255,255,0.1) !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,87,34,0.1); border-radius: 10px; }
                .animate-fade-in-right { animation: fadeInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
