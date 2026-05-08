import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Tag, Pipette, Package, Star } from 'lucide-react';
import api from '../services/api';

interface XmlTaste {
    name: string;
    price: string;
}

interface XmlBrand {
    name: string;
    tastes: XmlTaste[];
}

export default function StashTab() {
    const { user, logout } = useAuth();
    const [stash, setStash] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [xmlBrands, setXmlBrands] = useState<XmlBrand[]>([]);

    // Form state
    const [marca, setMarca] = useState('');
    const [nombreTabaco, setNombreTabaco] = useState('');
    const [tipo, setTipo] = useState('HAVE');
    const [focusMarca, setFocusMarca] = useState(false);
    const [focusSabor, setFocusSabor] = useState(false);

    // Load XML catalog and stash
    useEffect(() => {
        api.get('/tobaccos/light-catalog')
            .then((data: any) => { if (Array.isArray(data)) setXmlBrands(data); })
            .catch(console.error);
    }, []);

    const fetchStash = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data: any = await api.get(`/users/${user.id}/stash`);
            setStash(Array.isArray(data) ? data : []);
        } catch (error: any) {
            setStash([]);
            if (error.response?.status === 401 || error.response?.status === 404) logout();
        } finally {
            setLoading(false);
        }
    }, [user, logout]);

    useEffect(() => { fetchStash(); }, [fetchStash]);

    // Marcas/sabores filtrados
    const marcasFiltradas = xmlBrands
        .filter(b => b.name.toLowerCase().includes(marca.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const saboresFiltrados = (() => {
        const brand = xmlBrands.find(b => b.name.toLowerCase() === marca.toLowerCase());
        const tastes = brand ? brand.tastes : [];
        return tastes.filter(t => t.name.toLowerCase().includes(nombreTabaco.toLowerCase()));
    })();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreTabaco || !user) return;
        try {
            await api.post(`/users/stash`, { usuarioId: user.id, nombreTabaco, marca, tipo });
            setMarca('');
            setNombreTabaco('');
            setTipo('HAVE');
            fetchStash();
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 404) {
                logout();
                alert('Se detectó un problema con tu sesión. Inicia sesión de nuevo.');
            } else {
                alert('No se pudo añadir al stash: ' + (error.response?.data?.message || ''));
            }
        }
    };

    const handleRemove = async (id: number) => {
        try {
            await api.delete(`/users/stash/${id}`);
            setStash(prev => prev.filter(item => item.id !== id));
        } catch (error) { console.error(error); }
    };

    const estanteria = stash.filter(item => item.tipo === 'HAVE');
    const wishlist = stash.filter(item => item.tipo === 'WANT');

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-8 h-8 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
            <p className="text-shisha-text-dim font-black animate-pulse uppercase tracking-[0.2rem] text-[11px]">Cargando stash...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">

            {/* ——— Formulario Añadir ——— */}
            <form onSubmit={handleAdd} className="glass-panel relative z-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/5 shadow-xl space-y-4 md:space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember flex items-center gap-2">
                    <Plus size={14} /> Añadir a tu colección
                </p>

                <div className="flex flex-col md:flex-row gap-4">

                    {/* Marca */}
                    <div className="flex-1 relative group">
                        <input
                            required
                            autoComplete="off"
                            placeholder="Marca..."
                            value={marca}
                            onChange={e => { setMarca(e.target.value); setNombreTabaco(''); }}
                            onFocus={() => setFocusMarca(true)}
                            onBlur={() => setTimeout(() => setFocusMarca(false), 200)}
                            className="w-full pl-6 pr-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-bold placeholder:text-shisha-text-dim/20 focus:border-shisha-ember/50 outline-none transition-all"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Tag size={16} className="text-shisha-text-dim/30" />
                        </div>
                        {focusMarca && marcasFiltradas.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-shisha-bg border border-white/10 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto animate-reveal-up py-2">
                                {marcasFiltradas.map(b => (
                                    <button
                                        type="button"
                                        key={b.name}
                                        onClick={() => { setMarca(b.name); setNombreTabaco(''); }}
                                        className="w-full text-left px-5 py-2.5 hover:bg-white/5 text-white font-medium text-sm flex items-center justify-between"
                                    >
                                        <span>{b.name}</span>
                                        <span className="text-[10px] text-shisha-text-dim">{b.tastes.length}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sabor */}
                    <div className="flex-[2] relative group">
                        <input
                            required
                            autoComplete="off"
                            placeholder="Nombre del sabor..."
                            value={nombreTabaco}
                            onChange={e => setNombreTabaco(e.target.value)}
                            onFocus={() => setFocusSabor(true)}
                            onBlur={() => setTimeout(() => setFocusSabor(false), 200)}
                            disabled={!marca}
                            className="w-full pl-6 pr-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-bold placeholder:text-shisha-text-dim/20 focus:border-shisha-ember/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Pipette size={16} className="text-shisha-text-dim/30" />
                        </div>
                        {focusSabor && marca && saboresFiltrados.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-shisha-bg border border-white/10 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto animate-reveal-up py-2">
                                {saboresFiltrados.map(t => (
                                    <button
                                        type="button"
                                        key={t.name}
                                        onClick={() => setNombreTabaco(t.name)}
                                        className="w-full text-left px-5 py-2.5 hover:bg-white/5 text-white font-medium text-sm flex items-center justify-between"
                                    >
                                        <span>{t.name}</span>
                                        {t.price && <span className="text-[10px] bg-shisha-ember/10 text-shisha-ember px-2 py-0.5 rounded-lg font-black">{t.price}€</span>}
                                    </button>
                                ))}
                                {nombreTabaco && !saboresFiltrados.some(t => t.name.toLowerCase() === nombreTabaco.toLowerCase()) && (
                                    <div className="px-5 py-2.5 text-shisha-text-dim text-xs italic">
                                        Nuevo sabor: <strong className="text-white">{nombreTabaco}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tipo */}
                    <div className="md:w-48">
                        <select
                            value={tipo}
                            onChange={e => setTipo(e.target.value)}
                            className="w-full px-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-bold focus:border-shisha-ember/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="HAVE" className="bg-shisha-bg text-black md:text-white">📦 Lo tengo</option>
                            <option value="WANT" className="bg-shisha-bg text-black md:text-white">⭐ Lo quiero</option>
                        </select>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-shisha-ember hover:bg-shisha-ember-deep text-white rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-shisha-ember/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} /> Añadir
                    </button>
                </div>
            </form>

            {/* ——— Listas ——— */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Estantería */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-text-muted flex items-center gap-2">
                        <Package size={14} className="text-shisha-ember" />
                        Mi Estantería ({estanteria.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                        {estanteria.length === 0 ? (
                            <div className="glass-panel p-8 rounded-2xl border-white/5 text-center">
                                <p className="text-shisha-text-dim text-sm italic">Aún no has añadido tabacos.</p>
                            </div>
                        ) : (
                            estanteria.map(item => (
                                <div key={item.id} className="glass-panel px-5 py-4 rounded-2xl border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="font-bold text-white">{item.nombreTabaco}</p>
                                        {item.marca && <p className="text-[11px] text-shisha-ember font-black uppercase tracking-widest">{item.marca}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="w-9 h-9 rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Wishlist */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-text-muted flex items-center gap-2">
                        <Star size={14} className="text-amber-400" />
                        Lista de Deseos ({wishlist.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                        {wishlist.length === 0 ? (
                            <div className="glass-panel p-8 rounded-2xl border-white/5 text-center">
                                <p className="text-shisha-text-dim text-sm italic">Tu lista de deseos está vacía.</p>
                            </div>
                        ) : (
                            wishlist.map(item => (
                                <div key={item.id} className="glass-panel px-5 py-4 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] flex items-center justify-between hover:border-amber-500/20 transition-colors">
                                    <div>
                                        <p className="font-bold text-white">{item.nombreTabaco}</p>
                                        {item.marca && <p className="text-[11px] text-amber-400 font-black uppercase tracking-widest">{item.marca}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="w-9 h-9 rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
