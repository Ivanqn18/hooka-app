import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import {
    Trash2, AlertTriangle, ShieldCheck, LayoutDashboard,
    Flame, ShoppingCart, MapPin, CheckCircle, Users,
    Plus, Clock, Database, ChevronDown, ChevronUp
} from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

export default function AdminDashboard() {
    const { user } = useAuth();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [activeTab, setActiveTab] = useState<'overview' | 'mezclas' | 'productos' | 'bares' | 'users' | 'tabacos' | 'disputas'>('overview');

    const [mezclas, setMezclas] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [bares, setBares] = useState<any[]>([]);
    const [pendingBares, setPendingBares] = useState<any[]>([]);
    const [disputas, setDisputas] = useState<any[]>([]);

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

    // Custom Brand Dropdown state
    const [allBrands, setAllBrands] = useState<any[]>([]);
    const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
    const [brandSearchQuery, setBrandSearchQuery] = useState('');

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

    const fetchAllBrands = async () => {
        try {
            const res: any = await api.get('/tobaccos/brands');
            setAllBrands(res || []);
        } catch (e) {
            console.error("Error fetching all brands:", e);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;
        try {
            await api.post('/tobaccos/brands', { name: newBrandName });
            setNewBrandName('');
            fetchBrands();
            fetchAllBrands();
            toast.success('Marca creada con éxito');
        } catch (e) {
            console.error(e);
            toast.error('Error al crear la marca');
        }
    };

    const handleCreateTaste = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaste.name.trim() || !newTaste.brandId) {
            toast.warning('El nombre del sabor y la marca son requeridos');
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
            fetchAllBrands();
            toast.success('Sabor creado con éxito');
        } catch (e) {
            console.error(e);
            toast.error('Error al crear el sabor');
        }
    };

    const handleDeleteBrand = async (id: number) => {
        const confirmed = await confirm({
            title: 'Eliminar Marca',
            message: '¿Estás seguro de eliminar esta marca? Se eliminarán todos sus sabores asociados.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (!confirmed) return;
        try {
            await api.delete(`/tobaccos/brands/${id}`);
            fetchBrands();
            fetchAllBrands();
            toast.success('Marca eliminada con éxito');
        } catch (e) {
            console.error(e);
            toast.error('Error al eliminar la marca');
        }
    };

    const handleDeleteTaste = async (id: number) => {
        const confirmed = await confirm({
            title: 'Eliminar Sabor',
            message: '¿Estás seguro de eliminar este sabor?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (!confirmed) return;
        try {
            await api.delete(`/tobaccos/tastes/${id}`);
            fetchBrands();
            fetchAllBrands();
            toast.success('Sabor eliminado con éxito');
        } catch (e) {
            console.error(e);
            toast.error('Error al eliminar el sabor');
        }
    };

    const handleMaintenanceAction = async (action: 'seed' | 'scan-boe' | 'clear') => {
        if (action === 'clear') {
            const confirmed = await confirm({
                title: 'Vaciar Catálogo de Tabacos',
                message: '¿Estás seguro de vaciar COMPLETAMENTE el catálogo de tabacos? Esto no se puede deshacer.',
                confirmText: 'Vaciar Catálogo',
                cancelText: 'Cancelar',
                type: 'danger'
            });
            if (!confirmed) return;
        }
        
        setMaintenanceLoading(true);
        try {
            if (action === 'seed') {
                await api.post('/tobaccos/seed');
                toast.success('Semillado del catálogo completado con éxito.');
            } else if (action === 'scan-boe') {
                const res: any = await api.post('/tobaccos/scan-boe');
                toast.success(`Escaneo de BOE finalizado. Sabores añadidos: ${res.addedTastes || 0}`);
            } else if (action === 'clear') {
                await api.post('/tobaccos/clear');
                toast.success('Catálogo vaciado.');
            }
            fetchBrands();
            fetchAllBrands();
        } catch (e) {
            console.error(e);
            toast.error('Error al ejecutar la acción de mantenimiento.');
        } finally {
            setMaintenanceLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isAdmin) {
            if (activeTab === 'tabacos') {
                fetchBrands();
                fetchAllBrands();
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

        api.get('/marketplace/reports')
            .then((res: any) => setDisputas(extractData(res)))
            .catch(err => console.error("Error fetching reports:", err));
    };

    const handleResolveReport = async (id: number) => {
        try {
            await api.patch(`/marketplace/reports/${id}/resolve`);
            fetchData();
            toast.success('Incidencia marcada como resuelta.');
        } catch (e) {
            console.error(e);
            toast.error('Error al resolver la incidencia.');
        }
    };

    const handleDelete = async (id: number, type: 'mezclas' | 'marketplace/products' | 'bares' | 'users') => {
        if (type === 'users' && id === user?.id) {
            toast.warning('No puedes eliminar tu propia cuenta de administrador desde aquí.');
            return;
        }

        const typeLabels: Record<string, { title: string, message: string }> = {
            mezclas: {
                title: 'Eliminar Mezcla',
                message: '¿Estás seguro de que deseas eliminar esta mezcla de shisha? Esta acción no se puede deshacer.'
            },
            'marketplace/products': {
                title: 'Eliminar Producto',
                message: '¿Estás seguro de que deseas eliminar este producto del marketplace? Esta acción no se puede deshacer.'
            },
            bares: {
                title: 'Eliminar Lounge/Bar',
                message: '¿Estás seguro de que deseas eliminar este establecimiento de la guía de bares? Esta acción no se puede deshacer.'
            },
            users: {
                title: 'Eliminar Usuario',
                message: '¿Estás seguro de que deseas eliminar a este usuario de HookaHub? Se eliminará toda su información permanentemente.'
            }
        };

        const config = typeLabels[type] || {
            title: 'Eliminar Elemento',
            message: '¿Estás seguro de que deseas eliminar este elemento?'
        };

        const confirmed = await confirm({
            title: config.title,
            message: config.message,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/${type}/${id}`);
            fetchData();
            toast.success('Elemento eliminado con éxito');
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || 'Error al eliminar';
            toast.error(errorMsg);
        }
    };

    const handleUpdateBarStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/bares/${id}/status`, { status });
            fetchData();
        } catch (e) {
            toast.error('Error al actualizar');
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
            toast.success('¡Lounge registrado!');
        } catch (e) {
            toast.error('Error al registrar');
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

    const StatCard = ({ title, value, icon: Icon, colorClass, className = '' }: any) => {
        const textColor = colorClass.replace('bg-', 'text-');

        return (
            <div className={`glass-panel p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 shadow-xl flex items-center justify-between group transition-all hover:border-white/10 overflow-hidden relative ${className}`}>
                {/* Subtle background glow */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${colorClass} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                <div className="space-y-0.5 md:space-y-1 relative z-10">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim group-hover:text-shisha-text-muted transition-colors">{title}</p>
                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter">{value}</h3>
                </div>
                <div className={`relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-5 h-5 md:w-8 md:h-8 ${textColor} drop-shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.5)]`} style={{ filter: `drop-shadow(0 0 12px currentColor)` }} />
                </div>
            </div>
        );
    };

    const NavButton = ({ tab, icon: Icon, label, lgLabel }: any) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2.5 lg:gap-3.5 px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all w-full border ${activeTab === tab
                ? 'bg-shisha-ember border-shisha-ember text-white shadow-xl shadow-shisha-ember/20'
                : 'bg-transparent border-transparent text-shisha-text-dim hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] shrink-0" />
            <span className="hidden lg:inline">{lgLabel || label}</span>
            <span className="lg:hidden">{label}</span>
        </button>
    );

    const selectedBrandName = allBrands.find(b => String(b.id) === newTaste.brandId)?.name;
    const filteredBrandsForDropdown = allBrands.filter(b =>
        b.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-4 md:py-8 animate-reveal-up flex flex-col lg:flex-row gap-4 md:gap-8 min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-140px)]">

            {/* Sidebar Navigation */}
            <aside className="lg:w-80 flex flex-col gap-4 md:gap-8 shrink-0 lg:sticky lg:top-28 lg:self-start">
                <div className="glass-panel p-3 sm:p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col">
                    <div className="hidden lg:flex items-center gap-4 mb-8 md:mb-10 px-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-shisha-ember/10 rounded-xl md:rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20">
                            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">Control</h2>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-ember">Administración</span>
                        </div>
                    </div>

                    <nav className="grid grid-cols-4 lg:flex lg:flex-col gap-1.5 sm:gap-2 w-full">
                        <NavButton tab="overview" icon={LayoutDashboard} label="Gral" lgLabel="General" />
                        <NavButton tab="mezclas" icon={Flame} label="Mix" lgLabel="Mezclas" />
                        <NavButton tab="productos" icon={ShoppingCart} label="Shop" lgLabel="Mercado" />
                        <NavButton tab="bares" icon={MapPin} label="Maps" lgLabel="Lounges" />
                        <NavButton tab="users" icon={Users} label="Users" lgLabel="Usuarios" />
                        <NavButton tab="tabacos" icon={Database} label="Catalog" lgLabel="Tabacos" />
                        <NavButton tab="disputas" icon={AlertTriangle} label="Alerts" lgLabel="Disputas" />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                    <StatCard title="Mezclas" value={mezclas.length} icon={Flame} colorClass="bg-shisha-ember" />
                    <StatCard title="Mercado" value={productos.length} icon={ShoppingCart} colorClass="bg-emerald-500" />
                    <StatCard title="Bares" value={bares.length} icon={MapPin} colorClass="bg-blue-500" />
                    <StatCard title="Usuarios" value={users.length} icon={Users} colorClass="bg-violet-500" />
                    <StatCard title="Espera" value={pendingBares.length} icon={Clock} colorClass="bg-amber-500" className="col-span-2 sm:col-span-1" />
                </div>

                {/* Tab Content */}
                <div className="glass-panel p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/5 flex-1 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        {activeTab === 'overview' && <LayoutDashboard className="w-[120px] h-[120px]" />}
                        {activeTab === 'mezclas' && <Flame className="w-[120px] h-[120px]" />}
                        {activeTab === 'productos' && <ShoppingCart className="w-[120px] h-[120px]" />}
                        {activeTab === 'bares' && <MapPin className="w-[120px] h-[120px]" />}
                        {activeTab === 'users' && <Users className="w-[120px] h-[120px]" />}
                        {activeTab === 'tabacos' && <Database className="w-[120px] h-[120px]" />}
                        {activeTab === 'disputas' && <AlertTriangle className="w-[120px] h-[120px]" />}
                    </div>

                    <div className="relative z-10">
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Actividad Global</h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Actualizado en tiempo real</span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {pendingBares.length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-pulse-subtle">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                                                <Clock size={28} />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-lg md:text-xl font-black text-white mb-0.5 md:mb-1">Acción Requerida</h3>
                                                <p className="text-shisha-text-muted text-xs md:text-sm font-medium">Hay <strong>{pendingBares.length}</strong> solicitudes de nuevos lounges esperando auditoría.</p>
                                            </div>
                                            <button onClick={() => setActiveTab('bares')} className="w-full md:w-auto md:ml-auto px-5 py-3 bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-xl">Revisar Ahora</button>
                                        </div>
                                    )}

                                    {disputas.filter(d => !d.resuelto).length > 0 && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-pulse-subtle">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                                                <AlertTriangle size={28} />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-lg md:text-xl font-black text-white mb-0.5 md:mb-1">Disputas Activas</h3>
                                                <p className="text-shisha-text-muted text-xs md:text-sm font-medium">Hay <strong>{disputas.filter(d => !d.resuelto).length}</strong> reportes de incidencias esperando ser resueltos en el mercado.</p>
                                            </div>
                                            <button onClick={() => setActiveTab('disputas')} className="w-full md:w-auto md:ml-auto px-5 py-3 bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-xl">Revisar Disputas</button>
                                        </div>
                                    )}

                                    {pendingBares.length === 0 && disputas.filter(d => !d.resuelto).length === 0 && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-8 rounded-2xl md:rounded-[2rem] flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                                                <CheckCircle size={20} />
                                            </div>
                                            <p className="text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest">Toda la plataforma está en orden sin incidencias</p>
                                        </div>
                                    )}
                                </div>

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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gestión de Contenido</h2>
                                    <div className="px-3.5 py-1.5 bg-white/5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim w-fit">
                                        {mezclas.length} mezclas totales
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {mezclas.map((m: any) => (
                                        <div key={m.id} className="group flex items-center justify-between p-3.5 sm:p-5 bg-white/2 border border-white/5 rounded-2xl sm:rounded-[1.5rem] hover:bg-white/5 hover:border-white/10 transition-all gap-4">
                                            <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-shisha-ember/10 flex items-center justify-center text-shisha-ember group-hover:scale-110 transition-transform shrink-0">
                                                    <Flame size={20} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="text-sm sm:text-lg font-black text-white group-hover:text-shisha-ember transition-colors leading-snug truncate mb-1">{m.titulo}</h4>
                                                    <div className="flex items-center gap-2 sm:gap-3 text-shisha-text-dim text-[9px] sm:text-[10px] font-black uppercase tracking-[0.05em] truncate">
                                                        <span>ID: {m.id}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full shrink-0"></span>
                                                        <span>Autor: {m.autorId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(m.id, 'mezclas')}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg shrink-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'productos' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Marketplace Hub</h2>
                                    <div className="px-3.5 py-1.5 bg-white/5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim w-fit">
                                        {productos.length} artículos en activo
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {productos.map((p: any) => (
                                        <div key={p.id} className="group flex items-center justify-between p-3.5 sm:p-5 bg-white/2 border border-white/5 rounded-2xl sm:rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all gap-4">
                                            <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
                                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 group-hover:border-emerald-500/30 transition-colors shrink-0">
                                                    {p.imagenUrl ? (
                                                        <img src={imageUrl(p.imagenUrl)} className="w-full h-full object-cover" alt="item" />
                                                    ) : (
                                                        <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <ShoppingCart size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                                                        <h4 className="text-sm sm:text-xl font-black text-white group-hover:text-emerald-400 transition-colors leading-snug truncate">{p.titulo}</h4>
                                                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black rounded-md sm:rounded-lg shrink-0">{Number(p.precio)}€</span>
                                                        {p.estado && p.estado !== 'DISPONIBLE' && (
                                                            <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-black rounded uppercase tracking-widest shrink-0 ${
                                                                p.estado === 'RESERVADO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                            }`}>
                                                                {p.estado}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 text-shisha-text-dim text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none truncate">
                                                        <span>{p.categoria}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full shrink-0"></span>
                                                        <span>Vendedor #{p.vendedorId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(p.id, 'marketplace/products')}
                                                className="w-10 h-10 sm:w-auto sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shrink-0"
                                            >
                                                <Trash2 size={16} />
                                                <span className="hidden sm:inline">Eliminar</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gestión de Usuarios</h2>
                                    <div className="px-3.5 py-1.5 bg-white/5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim w-fit">
                                        {users.length} usuarios registrados
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {users.map((u: any) => (
                                        <div key={u.id} className="group flex items-center justify-between p-3.5 sm:p-5 bg-white/2 border border-white/5 rounded-2xl sm:rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all gap-4">
                                            <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
                                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 group-hover:border-violet-500/30 transition-colors shrink-0">
                                                    {u.avatarUrl ? (
                                                        <img src={imageUrl(u.avatarUrl)} className="w-full h-full object-cover" alt="avatar" />
                                                    ) : (
                                                        <div className="w-full h-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                                                            <Users size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                                                        <h4 className="text-sm sm:text-xl font-black text-white group-hover:text-violet-400 transition-colors leading-snug truncate">{u.nombre}</h4>
                                                        {u.isAdmin && (
                                                            <span className="px-2 py-0.5 bg-shisha-ember text-white text-[8px] sm:text-[9px] font-black rounded uppercase tracking-widest shrink-0">Admin</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 text-shisha-text-dim text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none truncate">
                                                        <span>ID: {u.id}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full shrink-0"></span>
                                                        <span>{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user?.id !== u.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id, 'users')}
                                                    className="shrink-0 w-10 h-10 md:w-auto md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
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
                            <div className="space-y-10">
                                {/* Pending Authorizations */}
                                {pendingBares.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                                                <Clock size={20} />
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Autorizaciones Pendientes</h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {pendingBares.map((b: any) => (
                                                <div key={b.id} className="glass-panel p-5 md:p-8 rounded-2xl md:rounded-[2rem] border-amber-500/20 bg-amber-500/[0.02] flex flex-col gap-4 md:gap-6 animate-reveal-up">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                                        <div className="space-y-1">
                                                            <h4 className="text-xl md:text-2xl font-black text-white leading-tight">{b.nombre}</h4>
                                                            <p className="text-shisha-text-muted text-xs md:text-sm font-medium flex items-center gap-1.5">
                                                                <MapPin size={12} className="text-amber-500 shrink-0" /> {b.direccion}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 sm:gap-3 shrink-0">
                                                            <button
                                                                onClick={() => handleUpdateBarStatus(b.id, 'APPROVED')}
                                                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                                            >
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateBarStatus(b.id, 'REJECTED')}
                                                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 pt-4 md:pt-6 border-t border-white/5">
                                                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                                            <div className="relative">
                                                                {b.solicitante?.avatarUrl ? (
                                                                    <img src={imageUrl(b.solicitante.avatarUrl)} className="w-6 h-6 rounded-full border border-white/10" alt="user" />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-shisha-ember flex items-center justify-center text-white text-[8px] font-black">
                                                                        {b.solicitante?.nombre?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">
                                                                Solicitado por <span className="text-white ml-1">{b.solicitante?.nombre || 'Desconocido'}</span>
                                                            </span>
                                                        </div>
                                                        {b.descripcion && (
                                                            <div className="flex-1 italic text-xs text-shisha-text-muted border-l-2 border-amber-500/30 pl-3.5 py-0.5">
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
                                <div className="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-[3rem] border-white/5 shadow-xl bg-shisha-surface/40">
                                    <div className="flex items-center gap-3 mb-6 sm:mb-10">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-shisha-ember/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20 shadow-xl">
                                            <Plus size={20} className="sm:hidden" />
                                            <Plus size={28} className="hidden sm:block" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Registrar Nuevo local</h3>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">Modo inserción directa de administrador</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleAddBar} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Nombre</label>
                                            <input required type="text" className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm" value={newBar.nombre} onChange={e => setNewBar({ ...newBar, nombre: e.target.value })} placeholder="Ej: Elite Hookah" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Dirección</label>
                                            <input required type="text" className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm" value={newBar.direccion} onChange={e => setNewBar({ ...newBar, direccion: e.target.value })} placeholder="Calle, Ciudad" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Coordenadas</label>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                <input required type="number" step="any" className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm" value={newBar.latitud} onChange={e => setNewBar({ ...newBar, latitud: e.target.value })} placeholder="Lat" />
                                                <input required type="number" step="any" className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm" value={newBar.longitud} onChange={e => setNewBar({ ...newBar, longitud: e.target.value })} placeholder="Lng" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">URL Imagen</label>
                                            <input type="url" className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all text-sm" value={newBar.imagenUrl} onChange={e => setNewBar({ ...newBar, imagenUrl: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-ember ml-1">Descripción</label>
                                            <textarea required rows={2} className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all resize-none text-sm" value={newBar.descripcion} onChange={e => setNewBar({ ...newBar, descripcion: e.target.value })} placeholder="Resumen del local..."></textarea>
                                        </div>
                                        <button type="submit" className="md:col-span-2 py-4 sm:py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black rounded-2xl sm:rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 group text-xs sm:text-sm uppercase tracking-widest">
                                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                            <span>Registrar Lounge en Mapa</span>
                                        </button>
                                    </form>
                                </div>

                                {/* Existing Bars List */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-shisha-text-dim px-2">Lista Global de Bares</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {bares.map((b: any) => (
                                            <div key={b.id} className="group flex items-center justify-between p-3.5 sm:p-5 bg-white/2 border border-white/5 rounded-2xl sm:rounded-[2rem] hover:bg-white/5 hover:border-white/10 transition-all gap-4">
                                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-sm sm:text-lg font-black text-white group-hover:text-blue-400 transition-colors truncate">{b.nombre}</h4>
                                                        <p className="text-[9px] sm:text-[10px] font-bold text-shisha-text-dim uppercase tracking-wider truncate">{b.direccion}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(b.id, 'bares')} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tabacos' && (
                            <div className="space-y-8 animate-reveal-up">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Catálogo de Tabacos</h2>
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember">Mantenimiento de marcas, sabores e importador oficial</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 w-full md:w-auto">
                                        <button 
                                            disabled={maintenanceLoading}
                                            onClick={() => handleMaintenanceAction('seed')} 
                                            className="px-2 md:px-4 py-2.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[8px] sm:text-[9px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 text-center flex items-center justify-center"
                                        >
                                            {maintenanceLoading ? '...' : (
                                                <>
                                                    <span className="md:hidden">Seed</span>
                                                    <span className="hidden md:inline">Importar Catálogo (Seed)</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            disabled={maintenanceLoading}
                                            onClick={() => handleMaintenanceAction('clear')} 
                                            className="px-2 md:px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-black text-[8px] sm:text-[9px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 text-center flex items-center justify-center"
                                        >
                                            {maintenanceLoading ? '...' : (
                                                <>
                                                    <span className="md:hidden">Vaciar</span>
                                                    <span className="hidden md:inline">Vaciar Catálogo</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                                    <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 bg-white/[0.01]">
                                        <h3 className="text-base md:text-lg font-black text-white mb-4 flex items-center gap-2">
                                            <Plus size={16} className="text-shisha-ember" /> Añadir Marca
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
                                            <button type="submit" className="px-4 md:px-5 py-3 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl transition-all shrink-0">
                                                Añadir
                                            </button>
                                        </form>
                                    </div>

                                    <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 bg-white/[0.01]">
                                        <h3 className="text-base md:text-lg font-black text-white mb-4 flex items-center gap-2">
                                            <Plus size={16} className="text-shisha-ember" /> Añadir Sabor
                                        </h3>
                                        <form onSubmit={handleCreateTaste} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div className="md:col-span-2 relative">
                                                {brandDropdownOpen && (
                                                    <div 
                                                        className="fixed inset-0 z-40 cursor-default" 
                                                        onClick={() => { setBrandDropdownOpen(false); setBrandSearchQuery(''); }}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold text-sm text-left flex justify-between items-center transition-all cursor-pointer relative z-30"
                                                >
                                                    <span>
                                                        {selectedBrandName || <span className="text-white/30 font-medium">Seleccionar Marca...</span>}
                                                    </span>
                                                    <ChevronDown size={16} className={`text-white/50 transition-transform duration-300 ${brandDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {brandDropdownOpen && (
                                                    <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-[#16181E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-reveal-up">
                                                        <div className="p-2 border-b border-white/5">
                                                            <input
                                                                type="text"
                                                                value={brandSearchQuery}
                                                                onChange={e => setBrandSearchQuery(e.target.value)}
                                                                placeholder="Buscar marca..."
                                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white text-xs outline-none focus:border-shisha-ember/50 transition-all placeholder:text-white/20"
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto py-1">
                                                            {filteredBrandsForDropdown.length === 0 ? (
                                                                <div className="px-4 py-3 text-xs text-shisha-text-dim text-center">
                                                                    No se encontraron marcas
                                                                </div>
                                                            ) : (
                                                                filteredBrandsForDropdown.map(b => (
                                                                    <button
                                                                        key={b.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setNewTaste({...newTaste, brandId: String(b.id)});
                                                                            setBrandDropdownOpen(false);
                                                                            setBrandSearchQuery('');
                                                                        }}
                                                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 flex items-center justify-between ${String(b.id) === newTaste.brandId ? 'text-shisha-ember font-black bg-shisha-ember/5' : 'text-white font-semibold'}`}
                                                                    >
                                                                        <span>{b.name}</span>
                                                                        {String(b.id) === newTaste.brandId && (
                                                                            <span className="w-1.5 h-1.5 bg-shisha-ember rounded-full shadow-lg shadow-shisha-ember/50" />
                                                                        )}
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
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
                                                <button type="submit" className="px-4 md:px-5 py-3 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl transition-all shrink-0">
                                                    Crear
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <h3 className="text-lg md:text-xl font-black text-white">Catálogo Actual ({brandsTotal} marcas)</h3>
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
                                        <div className="grid grid-cols-1 gap-4">
                                            {brands.map(brand => {
                                                const isExpanded = !!expandedBrands[brand.id];
                                                return (
                                                    <div 
                                                        key={brand.id} 
                                                        className="glass-panel rounded-2xl md:rounded-[2rem] border-white/5 bg-white/[0.01] overflow-hidden transition-all duration-300 hover:border-white/10"
                                                    >
                                                        {/* Brand Card Header */}
                                                        <div 
                                                            onClick={() => toggleBrand(brand.id)}
                                                            className="flex flex-row justify-between items-center p-4 sm:p-6 md:p-8 cursor-pointer select-none bg-white/[0.005] hover:bg-white/[0.02] transition-colors gap-4"
                                                        >
                                                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                                                <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-shisha-ember/10 border border-shisha-ember/20 text-shisha-ember shrink-0">
                                                                    {isExpanded ? <ChevronUp size={16} className="md:w-5 md:h-5" /> : <ChevronDown size={16} className="md:w-5 md:h-5" />}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <h4 className="text-base md:text-xl font-black text-white leading-tight flex flex-wrap items-center gap-1.5 md:gap-3 truncate">
                                                                        <span>{brand.name}</span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-text-dim shrink-0">
                                                                            {brand.tastes?.length || 0} sabores
                                                                        </span>
                                                                    </h4>
                                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-text-dim mt-1 md:mt-2 inline-block">ID Marca: {brand.id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                                                <button 
                                                                    onClick={() => handleDeleteBrand(brand.id)} 
                                                                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-rose-500/20 shrink-0"
                                                                >
                                                                    <span className="hidden sm:inline">Eliminar Marca</span>
                                                                    <span className="sm:hidden">Eliminar</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Brand Card Body (Tastes list) */}
                                                        {isExpanded && (
                                                            <div className="p-4 md:p-8 pt-0 border-t border-white/5 bg-white/[0.002] animate-reveal-up">
                                                                <div className="space-y-3 pt-4 md:pt-6">
                                                                    <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-ember">Sabores Registrados</h5>
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

                        {activeTab === 'disputas' && (
                            <div className="space-y-8 animate-reveal-up">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Centro de Disputas</h2>
                                    <div className="px-3.5 py-1.5 bg-white/5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim w-fit">
                                        {disputas.length} incidencias reportadas
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {disputas.length === 0 ? (
                                        <div className="py-16 text-center">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20 shadow-lg">
                                                <CheckCircle size={24} />
                                            </div>
                                            <h4 className="text-lg font-black text-white mb-1">¡Sin Incidencias!</h4>
                                            <p className="text-shisha-text-muted text-xs font-medium max-w-sm mx-auto">No se han registrado reportes ni disputas de transacciones en el mercado.</p>
                                        </div>
                                    ) : (
                                        disputas.map((d: any) => (
                                            <div key={d.id} className={`glass-panel p-5 md:p-8 rounded-2xl md:rounded-[2rem] border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col gap-6 ${d.resuelto ? 'opacity-70' : 'border-rose-500/20 bg-rose-500/[0.01]'}`}>
                                                {/* Dispute Header */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl shrink-0 ${d.resuelto ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            <AlertTriangle size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Disputa #{d.id}</h4>
                                                            <p className="text-[9px] font-bold text-shisha-text-dim uppercase tracking-wider">Fecha: {new Date(d.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                            d.resuelto 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                                                        }`}>
                                                            {d.resuelto ? 'Resuelta' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Product and Motive */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest mb-1.5 block">Artículo Relacionado</span>
                                                            {d.producto ? (
                                                                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/5 bg-white/5 shrink-0">
                                                                        {d.producto.imagenUrl ? (
                                                                            <img src={imageUrl(d.producto.imagenUrl)} className="w-full h-full object-cover" alt="" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-shisha-text-dim">
                                                                                <ShoppingCart size={16} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <h5 className="text-xs font-bold text-white truncate leading-snug">{d.producto.titulo}</h5>
                                                                        <p className="text-[9px] font-bold text-shisha-text-dim uppercase">{Number(d.producto.precio).toFixed(2)}€ • {d.producto.categoria}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">Producto eliminado</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5 block">Motivo Reportado</span>
                                                            <p className="text-xs font-medium text-shisha-text-muted leading-relaxed bg-white/5 border border-white/5 p-4 rounded-xl italic">
                                                                "{d.motivo}"
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Parties involved */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest mb-1.5 block">Comprador (Reportado por)</span>
                                                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                                                <p className="text-xs font-bold text-white">{d.reportadoPor?.nombre || 'N/A'}</p>
                                                                <p className="text-[9px] font-medium text-shisha-text-dim font-mono">{d.reportadoPor?.email || 'N/A'}</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest mb-1.5 block">Vendedor</span>
                                                            {d.producto?.seller ? (
                                                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                                                    <p className="text-xs font-bold text-white">{d.producto.seller.nombre}</p>
                                                                    <p className="text-[9px] font-medium text-shisha-text-dim font-mono">{d.producto.seller.email}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs font-medium text-shisha-text-dim bg-white/5 p-3 rounded-xl">Vendedor no disponible</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/5">
                                                    {d.producto && (
                                                        <button
                                                            onClick={() => handleDelete(d.productoId, 'marketplace/products')}
                                                            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                        >
                                                            Eliminar Artículo
                                                        </button>
                                                    )}
                                                    {!d.resuelto && (
                                                        <button
                                                            onClick={() => handleResolveReport(d.id)}
                                                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                                                        >
                                                            Resolver Disputa
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
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
