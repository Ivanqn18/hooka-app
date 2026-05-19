import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Trash2, AlertTriangle, ShieldCheck, LayoutDashboard,
    Flame, ShoppingCart, MapPin, CheckCircle, Users,
    Plus, Clock, Database, ChevronDown, ChevronUp
} from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'mezclas' | 'productos' | 'bares' | 'users' | 'tabacos'>('overview');

    const [mezclas, setMezclas] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [bares, setBares] = useState<any[]>([]);
    const [pendingBares, setPendingBares] = useState<any[]>([]);

    // Tabacos state
    const [brands, setBrands] = useState<any[]>([]);
    const [brandsTotal, setBrandsTotal] = useState(0);
    const [brandsPage, setBrandsPage] = useState(1);
    const [brandsLimit] = useState(10);
    const [searchBrand, setSearchBrand] = useState('');
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [newTaste, setNewTaste] = useState({
        name: '',
        brandId: '',
        linea: '',
        descripcion: ''
    });
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    const [expandedBrands, setExpandedBrands] = useState<{[key: number]: boolean}>({});

    const toggleBrand = (id: number) => {
        setExpandedBrands(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const expandAllBrands = (expand: boolean) => {
        const updated: {[key: number]: boolean} = {};
        brands.forEach(b => {
            updated[b.id] = expand;
        });
        setExpandedBrands(updated);
    };

    const [newBar, setNewBar] = useState({
        nombre: '',
        direccion: '',
        latitud: '',
        longitud: '',
        descripcion: '',
        imagenUrl: ''
    });

    const fetchBrands = async () => {
        setLoadingBrands(true);
        try {
            const res: any = await api.get('/tobaccos', {
                params: {
                    page: brandsPage,
                    limit: brandsLimit,
                    brand: searchBrand || undefined
                }
            });
            setBrands(res.data || []);
            setBrandsTotal(res.total || 0);
        } catch (e) {
            console.error("Error fetching brands:", e);
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;
        try {
            await api.post('/tobaccos/brands', { name: newBrandName });
            setNewBrandName('');
            fetchBrands();
            alert('Marca creada con éxito');
        } catch (e) {
            console.error(e);
            alert('Error al crear la marca');
        }
    };

    const handleCreateTaste = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaste.name.trim() || !newTaste.brandId) {
            alert('El nombre del sabor y la marca son requeridos');
            return;
        }
        try {
            await api.post('/tobaccos/tastes', {
                name: newTaste.name,
                brandId: Number(newTaste.brandId),
                linea: newTaste.linea || undefined,
                descripcion: newTaste.descripcion || undefined
            });
            setNewTaste({ name: '', brandId: '', linea: '', descripcion: '' });
            fetchBrands();
            alert('Sabor creado con éxito');
        } catch (e) {
            console.error(e);
            alert('Error al crear el sabor');
        }
    };

    const handleDeleteBrand = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta marca? Se eliminarán todos sus sabores asociados.')) return;
        try {
            await api.delete(`/tobaccos/brands/${id}`);
            fetchBrands();
        } catch (e) {
            console.error(e);
            alert('Error al eliminar la marca');
        }
    };

    const handleDeleteTaste = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este sabor?')) return;
        try {
            await api.delete(`/tobaccos/tastes/${id}`);
            fetchBrands();
        } catch (e) {
            console.error(e);
            alert('Error al eliminar el sabor');
        }
    };

    const handleMaintenanceAction = async (action: 'seed' | 'scan-boe' | 'clear') => {
        if (action === 'clear' && !confirm('¿Estás seguro de vaciar COMPLETAMENTE el catálogo de tabacos? Esto no se puede deshacer.')) return;
        
        setMaintenanceLoading(true);
        try {
            if (action === 'seed') {
                await api.post('/tobaccos/seed');
                alert('Semillado del catálogo completado con éxito.');
            } else if (action === 'scan-boe') {
                const res: any = await api.post('/tobaccos/scan-boe');
                alert(`Escaneo de BOE finalizado. Sabores añadidos: ${res.addedTastes || 0}`);
            } else if (action === 'clear') {
                await api.post('/tobaccos/clear');
                alert('Catálogo vaciado.');
            }
            fetchBrands();
        } catch (e) {
            console.error(e);
            alert('Error al ejecutar la acción de mantenimiento.');
        } finally {
            setMaintenanceLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isAdmin) {
            if (activeTab === 'tabacos') {
                fetchBrands();
            } else {
                fetchData();
            }
        }
    }, [user, activeTab, brandsPage, searchBrand]);

    const fetchData = () => {
        // Función auxiliar para extraer el array de datos sin importar la estructura de paginación del backend
        const extractData = (res: any) => {
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.data)) return res.data;
            if (res && Array.isArray(res.items)) return res.items;
            if (res && Array.isArray(res.users)) return res.users;
            return [];
        };

        api.get('/mezclas', { params: { limit: 100 } })
            .then((res: any) => setMezclas(extractData(res)))
            .catch(err => console.error("Error fetching mezclas:", err));

        api.get('/marketplace/products', { params: { limit: 100 } })
            .then((res: any) => setProductos(extractData(res)))
            .catch(err => console.error("Error fetching products:", err));

        api.get('/bares', { params: { limit: 100 } })
            .then((res: any) => setBares(extractData(res)))
            .catch(err => console.error("Error fetching bares:", err));

        api.get('/bares/admin/pending')
            .then((res: any) => setPendingBares(extractData(res)))
            .catch(err => console.error("Error fetching pending:", err));

        api.get('/users', { params: { limit: 100 } })
            .then((res: any) => setUsers(extractData(res)))
            .catch(err => console.error("Error fetching users:", err));
    };

    const handleDelete = async (id: number, type: 'mezclas' | 'marketplace/products' | 'bares' | 'users') => {
        if (type === 'users' && id === user?.id) {
            alert('No puedes eliminar tu propia cuenta de administrador desde aquí.');
            return;
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar este elemento?`)) return;

        try {
            await api.delete(`/${type}/${id}`);
            fetchData();
        } catch (e) {
            alert('Error al eliminar');
        }
    };

    const handleUpdateBarStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/bares/${id}/status`, { status });
            fetchData();
        } catch (e) {
            alert('Error al actualizar');
        }
    };

    const handleAddBar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/bares', {
                ...newBar,
                latitud: Number(newBar.latitud),
                longitud: Number(newBar.longitud)
            });
            setNewBar({ nombre: '', direccion: '', latitud: '', longitud: '', descripcion: '', imagenUrl: '' });
            fetchData();
            alert('¡Lounge registrado!');
        } catch (e) {
            alert('Error al registrar');
        }
    };

    if (!user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-reveal-up text-center px-6">
                <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mb-6 text-rose-500 border border-rose-500/20 shadow-2xl">
                    <AlertTriangle size={48} />
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Acceso Denegado</h1>
                <p className="text-shisha-text-muted font-medium max-w-md">No tienes los privilegios necesarios para acceder a la torre de control.</p>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, colorClass }: any) => {
        const textColor = colorClass.replace('bg-', 'text-');

        return (
            <div className="glass-panel p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 shadow-xl flex items-center justify-between group transition-all hover:border-white/10 overflow-hidden relative">
                {/* Subtle background glow */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${colorClass} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                <div className="space-y-1 relative z-10">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim group-hover:text-shisha-text-muted transition-colors">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">{value}</h3>
                </div>
                <div className={`relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-6 h-6 md:w-8 md:h-8 ${textColor} drop-shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.5)]`} style={{ filter: `drop-shadow(0 0 12px currentColor)` }} />
                </div>
            </div>
        );
    };

    const NavButton = ({ tab, icon: Icon, label, lgLabel }: any) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center lg:justify-start gap-2.5 md:gap-3.5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all w-full border ${activeTab === tab
                ? 'bg-shisha-ember border-shisha-ember text-white shadow-xl shadow-shisha-ember/20'
                : 'bg-transparent border-transparent text-shisha-text-dim hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            <span className="hidden lg:inline">{lgLabel || label}</span>
            <span className="lg:hidden">{label}</span>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 animate-reveal-up flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-140px)]">

            {/* Sidebar Navigation */}
            <aside className="lg:w-80 flex flex-col gap-6 md:gap-8 shrink-0">
                <div className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8 md:mb-10 px-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-shisha-ember/10 rounded-xl md:rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20">
                            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">Control</h2>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-ember">Administración</span>
                        </div>
                    </div>

                    <nav className="flex flex-row lg:flex-col gap-2 flex-grow overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="overview" icon={LayoutDashboard} label="Gral" lgLabel="General" />
                        </div>
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="mezclas" icon={Flame} label="Mix" lgLabel="Mezclas" />
                        </div>
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="productos" icon={ShoppingCart} label="Shop" lgLabel="Mercado" />
                        </div>
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="bares" icon={MapPin} label="Maps" lgLabel="Lounges" />
                        </div>
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="users" icon={Users} label="Users" lgLabel="Usuarios" />
                        </div>
                        <div className="flex-1 min-w-[120px] lg:min-w-0">
                            <NavButton tab="tabacos" icon={Database} label="Catalog" lgLabel="Tabacos" />
                        </div>
                    </nav>

                    <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-white/5 hidden md:block">
                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                            <div className="relative">
                                {user?.avatarUrl ? (
                                    <img src={imageUrl(user.avatarUrl)} className="w-11 h-11 rounded-1.5xl object-cover border-2 border-shisha-ember/30" alt="admin" />
                                ) : (
                                    <div className="w-11 h-11 rounded-1.5xl bg-shisha-ember flex items-center justify-center text-white font-black text-lg">
                                        {user?.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-shisha-surface"></div>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-white truncate">{user?.nombre}</p>
                                <span className="text-[9px] font-black uppercase tracking-widest text-shisha-ember">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col gap-8">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard title="Mezclas" value={mezclas.length} icon={Flame} colorClass="bg-shisha-ember" />
                    <StatCard title="Mercado" value={productos.length} icon={ShoppingCart} colorClass="bg-emerald-500" />
                    <StatCard title="Bares" value={bares.length} icon={MapPin} colorClass="bg-blue-500" />
                    <StatCard title="Usuarios" value={users.length} icon={Users} colorClass="bg-violet-500" />
                    <StatCard title="Espera" value={pendingBares.length} icon={Clock} colorClass="bg-amber-500" />
                </div>

                {/* Tab Content */}
                <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 flex-1 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        {activeTab === 'overview' && <LayoutDashboard className="w-[120px] h-[120px]" />}
                        {activeTab === 'mezclas' && <Flame className="w-[120px] h-[120px]" />}
                        {activeTab === 'productos' && <ShoppingCart className="w-[120px] h-[120px]" />}
                        {activeTab === 'bares' && <MapPin className="w-[120px] h-[120px]" />}
                        {activeTab === 'users' && <Users className="w-[120px] h-[120px]" />}
                        {activeTab === 'tabacos' && <Database className="w-[120px] h-[120px]" />}
                    </div>

                    <div className="relative z-10">
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="flex items-end justify-between">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Actividad Global</h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Actualizado en tiempo real</span>
                                </div>

                                {pendingBares.length > 0 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 animate-pulse-subtle">
                                        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white mb-1">Acción Requerida</h3>
                                            <p className="text-shisha-text-muted text-sm font-medium">Hay <strong>{pendingBares.length}</strong> solicitudes de nuevos lounges esperando auditoría.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('bares')} className="md:ml-auto px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-xl">Revisar Ahora</button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={24} />
                                        </div>
                                        <p className="text-emerald-400 text-sm font-black uppercase tracking-widest">Toda la infraestructura está en orden</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-2">
                                            <Flame size={14} className="text-shisha-ember" /> Últimas Mezclas
                                        </h3>
                                        <div className="space-y-3">
                                            {mezclas.slice(0, 5).map(m => (
                                                <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-shisha-ember shadow-[0_0_10px_rgba(255,87,34,0.5)]"></div>
                                                    <span className="text-sm font-bold text-white flex-1 truncate">{m.titulo}</span>
                                                    <span className="text-[9px] font-black text-shisha-text-dim">ID #{m.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-2">
                                            <MapPin size={14} className="text-blue-500" /> Bares Recientes
                                        </h3>
                                        <div className="space-y-3">
                                            {bares.slice(0, 5).map(b => (
                                                <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                                    <span className="text-sm font-bold text-white flex-1 truncate">{b.nombre}</span>
                                                    <span className="text-[9px] font-black text-shisha-text-dim truncate max-w-[100px]">{b.direccion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'mezclas' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Gestión de Contenido</h2>
                                    <div className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                        {mezclas.length} mezclas totales
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {mezclas.map((m: any) => (
                                        <div key={m.id} className="group flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-[1.5rem] hover:bg-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-shisha-ember/10 flex items-center justify-center text-shisha-ember group-hover:scale-110 transition-transform">
                                                    <Flame size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white group-hover:text-shisha-ember transition-colors leading-none mb-1.5">{m.titulo}</h4>
                                                    <div className="flex items-center gap-3 text-shisha-text-dim text-[10px] font-black uppercase tracking-[0.05em]">
                                                        <span>ID: {m.id}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                                        <span>Autor: {m.autorId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(m.id, 'mezclas')}
                                                className="w-12 h-12 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'productos' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Marketplace Hub</h2>
                                    <div className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                        {productos.length} artículos en activo
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {productos.map((p: any) => (
                                        <div key={p.id} className="group flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-emerald-500/30 transition-colors shrink-0">
                                                    {p.imagenUrl ? (
                                                        <img src={imageUrl(p.imagenUrl)} className="w-full h-full object-cover" alt="item" />
                                                    ) : (
                                                        <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <ShoppingCart size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors leading-none">{p.titulo}</h4>
                                                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">{Number(p.precio)}€</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-shisha-text-dim text-[10px] font-black uppercase tracking-widest leading-none">
                                                        <span>{p.categoria}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                                        <span>Vendedor #{p.vendedorId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(p.id, 'marketplace/products')}
                                                className="px-6 py-4 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                                            >
                                                <Trash2 size={16} /> Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Gestión de Usuarios</h2>
                                    <div className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                        {users.length} usuarios registrados
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {users.map((u: any) => (
                                        <div key={u.id} className="group flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-6 overflow-hidden">
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-violet-500/30 transition-colors shrink-0">
                                                    {u.avatarUrl ? (
                                                        <img src={imageUrl(u.avatarUrl)} className="w-full h-full object-cover" alt="avatar" />
                                                    ) : (
                                                        <div className="w-full h-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                                                            <Users size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors leading-none truncate">{u.nombre}</h4>
                                                        {u.isAdmin && (
                                                            <span className="px-3 py-1 bg-shisha-ember text-white text-[9px] font-black rounded-lg uppercase tracking-widest shrink-0">Admin</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-shisha-text-dim text-[10px] font-black uppercase tracking-widest leading-none">
                                                        <span className="truncate">ID: {u.id}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full shrink-0"></span>
                                                        <span className="truncate">{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user?.id !== u.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id, 'users')}
                                                    className="shrink-0 px-6 py-4 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="hidden md:inline">Eliminar</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'bares' && (
                            <div className="space-y-12">
                                {/* Pending Authorizations */}
                                {pendingBares.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                                                <Clock size={24} />
                                            </div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Autorizaciones Pendientes</h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            {pendingBares.map((b: any) => (
                                                <div key={b.id} className="glass-panel p-8 rounded-[2rem] border-amber-500/20 bg-amber-500/[0.02] flex flex-col gap-6 animate-reveal-up">
                                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                                        <div className="space-y-2">
                                                            <h4 className="text-2xl font-black text-white leading-none">{b.nombre}</h4>
                                                            <p className="text-shisha-text-muted text-sm font-medium flex items-center gap-2">
                                                                <MapPin size={14} className="text-amber-500" /> {b.direccion}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-3 shrink-0">
                                                            <button
                                                                onClick={() => handleUpdateBarStatus(b.id, 'APPROVED')}
                                                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                                            >
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateBarStatus(b.id, 'REJECTED')}
                                                                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                                            <div className="relative">
                                                                {b.solicitante?.avatarUrl ? (
                                                                    <img src={imageUrl(b.solicitante.avatarUrl)} className="w-8 h-8 rounded-full border border-white/10" alt="user" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-shisha-ember flex items-center justify-center text-white text-[10px] font-black">
                                                                        {b.solicitante?.nombre?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                                                Solicitado por <span className="text-white ml-1">{b.solicitante?.nombre || 'Desconocido'}</span>
                                                            </span>
                                                        </div>
                                                        {b.descripcion && (
                                                            <div className="flex-1 italic text-xs text-shisha-text-muted border-l-2 border-amber-500/30 pl-4 py-1">
                                                                "{b.descripcion}"
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Bar Form */}
                                <div className="glass-panel p-10 rounded-[3rem] border-white/5 shadow-xl bg-shisha-surface/40">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-14 h-14 bg-shisha-ember/10 rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20 shadow-xl">
                                            <Plus size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight">Registrar Nuevo local</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Modo inserción directa de administrador</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleAddBar} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Nombre</label>
                                            <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all" value={newBar.nombre} onChange={e => setNewBar({ ...newBar, nombre: e.target.value })} placeholder="Ej: Elite Hookah" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Dirección</label>
                                            <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all" value={newBar.direccion} onChange={e => setNewBar({ ...newBar, direccion: e.target.value })} placeholder="Calle, Ciudad" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Coordenadas</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input required type="number" step="any" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all" value={newBar.latitud} onChange={e => setNewBar({ ...newBar, latitud: e.target.value })} placeholder="Lat" />
                                                <input required type="number" step="any" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all" value={newBar.longitud} onChange={e => setNewBar({ ...newBar, longitud: e.target.value })} placeholder="Lng" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">URL Imagen</label>
                                            <input type="url" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all" value={newBar.imagenUrl} onChange={e => setNewBar({ ...newBar, imagenUrl: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Descripción</label>
                                            <textarea required rows={2} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all resize-none" value={newBar.descripcion} onChange={e => setNewBar({ ...newBar, descripcion: e.target.value })} placeholder="Resumen del local..."></textarea>
                                        </div>
                                        <button type="submit" className="md:col-span-2 py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 group">
                                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                            <span>Registrar Lounge en Mapa</span>
                                        </button>
                                    </form>
                                </div>

                                {/* Existing Bars List */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-shisha-text-dim px-2">Lista Global de Bares</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bares.map((b: any) => (
                                            <div key={b.id} className="group flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                                        <MapPin size={24} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors truncate">{b.nombre}</h4>
                                                        <p className="text-[10px] font-bold text-shisha-text-dim uppercase tracking-wider truncate">{b.direccion}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(b.id, 'bares')} className="w-11 h-11 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tabacos' && (
                            <div className="space-y-10 animate-reveal-up">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Catálogo de Tabacos</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-shisha-ember">Mantenimiento de marcas, sabores e importador oficial</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            disabled={maintenanceLoading}
                                            onClick={() => handleMaintenanceAction('seed')} 
                                            className="px-4 py-2.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {maintenanceLoading ? 'Procesando...' : 'Importar Catálogo (Seed)'}
                                        </button>
                                        <button 
                                            disabled={maintenanceLoading}
                                            onClick={() => handleMaintenanceAction('scan-boe')} 
                                            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {maintenanceLoading ? 'Procesando...' : 'Escanear BOE'}
                                        </button>
                                        <button 
                                            disabled={maintenanceLoading}
                                            onClick={() => handleMaintenanceAction('clear')} 
                                            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {maintenanceLoading ? 'Procesando...' : 'Vaciar Catálogo'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.01]">
                                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                            <Plus size={18} className="text-shisha-ember" /> Añadir Marca
                                        </h3>
                                        <form onSubmit={handleCreateBrand} className="flex gap-3">
                                            <input 
                                                required 
                                                type="text" 
                                                value={newBrandName} 
                                                onChange={e => setNewBrandName(e.target.value)} 
                                                placeholder="Ej: Overdozz" 
                                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm placeholder:text-white/20"
                                            />
                                            <button type="submit" className="px-5 py-3 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shrink-0">
                                                Añadir
                                            </button>
                                        </form>
                                    </div>

                                    <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.01]">
                                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                            <Plus size={18} className="text-shisha-ember" /> Añadir Sabor
                                        </h3>
                                        <form onSubmit={handleCreateTaste} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <select 
                                                    required 
                                                    value={newTaste.brandId} 
                                                    onChange={e => setNewTaste({...newTaste, brandId: e.target.value})} 
                                                    className="w-full px-4 py-3 rounded-xl bg-shisha-surface border border-white/5 text-white font-bold outline-none transition-all text-sm cursor-pointer"
                                                >
                                                    <option value="" disabled className="text-white/30">Seleccionar Marca...</option>
                                                    {brands.map(b => (
                                                        <option key={b.id} value={b.id} className="bg-shisha-surface text-black md:text-white">{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input 
                                                required 
                                                type="text" 
                                                value={newTaste.name} 
                                                onChange={e => setNewTaste({...newTaste, name: e.target.value})} 
                                                placeholder="Nombre del Sabor" 
                                                className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm placeholder:text-white/20"
                                            />
                                            <input 
                                                type="text" 
                                                value={newTaste.linea} 
                                                onChange={e => setNewTaste({...newTaste, linea: e.target.value})} 
                                                placeholder="Línea (Ej: Negra)" 
                                                className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm placeholder:text-white/20"
                                            />
                                            <div className="md:col-span-2 flex gap-3">
                                                <input 
                                                    type="text" 
                                                    value={newTaste.descripcion} 
                                                    onChange={e => setNewTaste({...newTaste, descripcion: e.target.value})} 
                                                    placeholder="Descripción o notas de sabor (opcional)" 
                                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm placeholder:text-white/20"
                                                />
                                                <button type="submit" className="px-5 py-3 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shrink-0">
                                                    Crear
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <h3 className="text-xl font-black text-white">Catálogo Actual ({brandsTotal} marcas)</h3>
                                            {brands.length > 0 && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => expandAllBrands(true)}
                                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
                                                    >
                                                        Expandir Todo
                                                    </button>
                                                    <button 
                                                        onClick={() => expandAllBrands(false)}
                                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
                                                    >
                                                        Colapsar Todo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={searchBrand} 
                                            onChange={e => { setSearchBrand(e.target.value); setBrandsPage(1); }} 
                                            placeholder="Buscar marca..." 
                                            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-xs w-full md:w-64 placeholder:text-white/25"
                                        />
                                    </div>

                                    {loadingBrands ? (
                                        <div className="flex justify-center py-10">
                                            <div className="w-8 h-8 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                                        </div>
                                    ) : brands.length === 0 ? (
                                        <p className="text-shisha-text-dim text-sm text-center py-10">No se encontraron marcas en el catálogo.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {brands.map(brand => {
                                                const isExpanded = !!expandedBrands[brand.id];
                                                return (
                                                    <div 
                                                        key={brand.id} 
                                                        className="glass-panel rounded-[2rem] border-white/5 bg-white/[0.01] overflow-hidden transition-all duration-300 hover:border-white/10"
                                                    >
                                                        {/* Brand Card Header */}
                                                        <div 
                                                            onClick={() => toggleBrand(brand.id)}
                                                            className="flex flex-col sm:flex-row justify-between sm:items-center p-6 md:p-8 cursor-pointer select-none bg-white/[0.005] hover:bg-white/[0.02] transition-colors gap-4"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 rounded-xl bg-shisha-ember/10 border border-shisha-ember/20 text-shisha-ember shrink-0">
                                                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xl font-black text-white leading-none flex items-center gap-3">
                                                                        {brand.name}
                                                                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-shisha-text-dim">
                                                                            {brand.tastes?.length || 0} sabores
                                                                        </span>
                                                                    </h4>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim mt-2 inline-block">ID Marca: {brand.id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
                                                                <button 
                                                                    onClick={() => handleDeleteBrand(brand.id)} 
                                                                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-rose-500/20"
                                                                >
                                                                    Eliminar Marca
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Brand Card Body (Tastes list) */}
                                                        {isExpanded && (
                                                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 bg-white/[0.002] animate-reveal-up">
                                                                <div className="space-y-4 pt-6">
                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-shisha-ember">Sabores Registrados</h5>
                                                                    {brand.tastes && brand.tastes.length > 0 ? (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                            {brand.tastes.map((taste: any) => (
                                                                                <div key={taste.id} className="flex justify-between items-center p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                                                                                    <div className="overflow-hidden pr-2 flex-grow">
                                                                                        <p className="text-sm font-bold text-white truncate leading-snug">{taste.name}</p>
                                                                                        <div className="flex items-center gap-2 mt-1">
                                                                                            {taste.linea && (
                                                                                                <span className="text-[8px] font-black uppercase tracking-wider text-shisha-text-dim bg-white/5 px-1.5 py-0.5 rounded">
                                                                                                    Línea: {taste.linea}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        {taste.formats && taste.formats.length > 0 && (
                                                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                                                {taste.formats.map((f: any) => (
                                                                                                    <span key={f.id} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-shisha-ember/10 border border-shisha-ember/15 text-shisha-ember">
                                                                                                        {f.formato} • {f.precio}€
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <button 
                                                                                        onClick={() => handleDeleteTaste(taste.id)} 
                                                                                        className="w-9 h-9 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-rose-500/10 ml-2"
                                                                                    >
                                                                                        <Trash2 size={15} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-shisha-text-dim text-[11px] italic">No hay sabores registrados para esta marca.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {brandsTotal > brandsLimit && (
                                        <div className="flex justify-center items-center gap-4 pt-4">
                                            <button 
                                                disabled={brandsPage === 1} 
                                                onClick={() => setBrandsPage(p => p - 1)} 
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                                            >
                                                Anterior
                                            </button>
                                            <span className="text-xs font-black text-white">Página {brandsPage} de {Math.ceil(brandsTotal / brandsLimit)}</span>
                                            <button 
                                                disabled={brandsPage >= Math.ceil(brandsTotal / brandsLimit)} 
                                                onClick={() => setBrandsPage(p => p + 1)} 
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
