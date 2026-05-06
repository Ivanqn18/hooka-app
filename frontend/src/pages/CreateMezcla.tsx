import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Flame, Plus, Tag, MessageSquare, Info, 
    Sparkles, Trash2, Sliders, Pipette,
    Camera, Image as ImageIcon, X as CloseIcon
} from 'lucide-react';
import { imageUrl } from '../utils/imageUrl';
import api from '../services/api';

interface ProductoBase {
    id: number;
    nombre: string;
    marca: string;
    tipo: 'TABACO' | 'MELAZA';
    imagenUrl?: string;
}

export default function CreateMezcla() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams();
    
    const [tabacosDisponibles, setTabacosDisponibles] = useState<ProductoBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [focusedMarcaIdx, setFocusedMarcaIdx] = useState<number | null>(null);
    const [focusedTabacoIdx, setFocusedTabacoIdx] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        cazoletaRecomendada: '',
        privada: false,
        autorId: user?.id || 1,
        ingredientes: [{ nombreTabaco: '', marca: '', porcentaje: 100 }],
        tagIds: [] as number[]
    });

    useEffect(() => {
        const fetchCatalog = api.get('/tobaccos/light-catalog');
        const fetchMix = id ? api.get(`/mezclas/${id}`) : Promise.resolve(null);

        Promise.all([fetchCatalog, fetchMix])
            .then(([brands, mixRes]: any) => {
                if (Array.isArray(brands)) {
                    const flatTabacos: ProductoBase[] = [];
                    brands.forEach((b: any) => {
                        b.tastes.forEach((t: string) => {
                            flatTabacos.push({
                                id: Math.random(),
                                nombre: t,
                                marca: b.name,
                                tipo: 'TABACO'
                            });
                        });
                    });
                    setTabacosDisponibles(flatTabacos);
                } else {
                    setTabacosDisponibles([]);
                }

                if (mixRes) {
                    setFormData(prev => ({
                        ...prev,
                        titulo: mixRes.titulo || '',
                        descripcion: mixRes.descripcion || '',
                        cazoletaRecomendada: mixRes.cazoletaRecomendada || '',
                        privada: mixRes.privada || false,
                        autorId: mixRes.autorId || user?.id || 1,
                        ingredientes: mixRes.ingredients?.length > 0 ? mixRes.ingredients.map((ing: any) => ({
                            nombreTabaco: ing.nombreTabaco,
                            marca: ing.marca || '',
                            porcentaje: ing.porcentaje
                        })) : [{ nombreTabaco: '', marca: '', porcentaje: 100 }],
                        tagIds: mixRes.tags?.map((t: any) => t.tagId) || []
                    }));
                    if (mixRes.imagenUrl) {
                        setImagePreview(imageUrl(mixRes.imagenUrl) || null);
                    }
                }
                setLoading(false);
            })
            .catch((err: any) => {
                console.error(err);
                setLoading(false);
            });
    }, [id, user?.id]);

    const handleIngredientChange = (index: number, field: 'nombreTabaco' | 'marca' | 'porcentaje', value: any) => {
        const newIngredientes = [...formData.ingredientes];
        
        if (field === 'nombreTabaco') {
            const val = value as string;
            // Si el nombre coincide con uno disponible, autocompletar la marca
            const encontrado = tabacosDisponibles.find((t: ProductoBase) => t.nombre.toLowerCase() === val.toLowerCase());
            newIngredientes[index] = { 
                ...newIngredientes[index], 
                nombreTabaco: val,
                marca: encontrado ? encontrado.marca : newIngredientes[index].marca 
            };
        } else {
            newIngredientes[index] = { ...newIngredientes[index], [field]: value };
        }
        
        setFormData({ ...formData, ingredientes: newIngredientes });
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredientes: [...formData.ingredientes, { nombreTabaco: '', marca: '', porcentaje: 0 }]
        });
    };

    const removeIngredient = (index: number) => {
        const newIngredientes = formData.ingredientes.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, ingredientes: newIngredientes });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const total = formData.ingredientes.reduce((acc: number, curr: any) => acc + (Number(curr.porcentaje) || 0), 0);
        if (total !== 100) {
            alert(`El total debe ser 100%. Actualmente es ${total}%.`);
            return;
        }

        if (!selectedImage && !id) {
            alert("La imagen de la mezcla es obligatoria.");
            return;
        }

        const data = new FormData();
        data.append('titulo', formData.titulo);
        data.append('descripcion', formData.descripcion);
        data.append('autorId', String(formData.autorId));
        data.append('privada', String(formData.privada));
        data.append('cazoletaRecomendada', formData.cazoletaRecomendada);
        data.append('ingredientes', JSON.stringify(formData.ingredientes));
        data.append('tagIds', JSON.stringify(formData.tagIds));
        
        if (selectedImage) {
            data.append('imagen', selectedImage);
        }

        try {
            if (id) {
                await api.put(`/mezclas/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/mezclas', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/mezclas');
        } catch (err) {
            console.error("Error al crear mezcla", err);
            alert("Error al crear la mezcla. Revisa los datos.");
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-reveal-up text-center">
                <div className="w-12 h-12 border-4 border-shisha-ember/20 border-t-shisha-ember rounded-full animate-spin"></div>
                <p className="text-shisha-text-dim font-black animate-pulse uppercase tracking-[0.2rem]">Preparando alquimia...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-reveal-up">
            <header className="mb-8 md:mb-12 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-shisha-ember/10 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 md:mb-6 text-shisha-ember border border-shisha-ember/20 shadow-xl shadow-shisha-ember/5">
                    <Pipette size={28} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{id ? 'Editar Alquimia' : 'Nueva Alquimia'}</h1>
                <p className="text-shisha-text-muted font-medium text-sm md:text-base">{id ? 'Perfecciona tu mezcla maestra.' : 'Diseña la mezcla perfecta para tu próxima sesión.'}</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-10">
                <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl space-y-6 md:space-y-8 relative">
                    <div className="absolute top-0 right-0 p-8 md:p-12 text-shisha-ember opacity-[0.02] scale-[1] md:scale-150 rotate-12 pointer-events-none">
                        <Flame size={180} />
                    </div>

                    {/* Basic Info */}
                    <div className="relative z-10 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1 flex items-center gap-2">
                                <Sparkles size={14} /> Identidad de la mezcla
                            </label>
                            <input 
                                required 
                                type="text" 
                                placeholder="Nombre de tu creación (Ej: Dulce Atardecer)" 
                                value={formData.titulo} 
                                onChange={e => setFormData({ ...formData, titulo: e.target.value })} 
                                className="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl bg-white/5 border border-white/5 text-lg md:text-xl font-black text-white focus:border-shisha-ember/50 outline-none transition-all placeholder:text-shisha-text-dim/30"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1 flex items-center gap-2">
                                <MessageSquare size={14} /> Notas del autor
                            </label>
                            <textarea 
                                required 
                                rows={3} 
                                placeholder="Describe las sensaciones generales de la mezcla..." 
                                value={formData.descripcion} 
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })} 
                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all resize-none placeholder:text-shisha-text-dim/30"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1 flex items-center gap-2">
                                <Flame size={14} /> Cazoleta Recomendada
                            </label>
                            <select 
                                value={formData.cazoletaRecomendada} 
                                onChange={e => setFormData({ ...formData, cazoletaRecomendada: e.target.value })} 
                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-white font-bold focus:border-shisha-ember/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-shisha-bg text-shisha-text-dim">Seleccionar tipo...</option>
                                <option value="Phunnel" className="bg-shisha-bg text-white">Phunnel</option>
                                <option value="Tradi" className="bg-shisha-bg text-white">Tradi</option>
                                <option value="Killer" className="bg-shisha-bg text-white">Killer</option>
                            </select>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="relative z-10 pt-8 border-t border-white/5 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-shisha-ember ml-1 flex items-center gap-2">
                                <Sliders size={14} /> Proporciones de Alquimia
                            </label>
                            
                            {/* Image Upload Input */}
                            <div className="flex items-center gap-3">
                                <input 
                                    type="file" 
                                    id="image-upload" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                />
                                <label 
                                    htmlFor="image-upload" 
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-shisha-text-muted rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                                >
                                    {selectedImage ? <ImageIcon size={14} /> : <Camera size={14} />}
                                    {selectedImage ? "Imagen Lista" : "Subir Foto (Obligatoria)"}
                                </label>
                                
                                <button 
                                    type="button" 
                                    onClick={addIngredient} 
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                >
                                    <Plus size={14} /> Añadir Componente
                                </button>
                            </div>
                        </div>

                        {imagePreview && (
                            <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-white/10 animate-reveal-up group">
                                <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        type="button"
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="p-3 bg-rose-500 text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform"
                                    >
                                        <CloseIcon size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {formData.ingredientes.map((ing, index) => (
                                <div 
                                    key={index} 
                                    className="flex flex-col md:flex-row items-center gap-4 animate-reveal-up relative" 
                                    style={{ animationDelay: `${index * 50}ms`, zIndex: 50 - index }}
                                >
                                    <div className="flex-1 w-full relative group">
                                        <input 
                                            required
                                            autoComplete="off"
                                            placeholder="Marca..."
                                            value={ing.marca} 
                                            onChange={e => handleIngredientChange(index, 'marca', e.target.value)}
                                            onFocus={() => setFocusedMarcaIdx(index)}
                                            onBlur={() => setTimeout(() => setFocusedMarcaIdx(null), 200)}
                                            className="w-full pl-6 pr-12 py-3.5 md:py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold placeholder:text-shisha-text-dim/20 focus:border-shisha-ember/50 outline-none transition-all"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Tag size={18} className="text-shisha-text-dim/30" />
                                        </div>
                                        {focusedMarcaIdx === index && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-shisha-bg border border-white/10 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-reveal-up py-2">
                                                {Array.from(new Set(tabacosDisponibles.map(t => t.marca)))
                                                    .filter(m => m.toLowerCase().includes(ing.marca.toLowerCase()))
                                                    .sort()
                                                    .map(marca => (
                                                        <button 
                                                            type="button" 
                                                            key={marca}
                                                            onClick={() => handleIngredientChange(index, 'marca', marca)}
                                                            className="w-full text-left px-6 py-3 hover:bg-white/5 text-white font-medium"
                                                        >
                                                            {marca}
                                                        </button>
                                                    ))
                                                }
                                                {ing.marca && !Array.from(new Set(tabacosDisponibles.map(t => t.marca))).some(m => m.toLowerCase() === ing.marca.toLowerCase()) && (
                                                    <div className="px-6 py-3 text-shisha-text-dim font-medium text-sm">
                                                        Se registrará como nueva marca: <strong className="text-white">{ing.marca}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-[2] w-full relative group">
                                        <input 
                                            required
                                            autoComplete="off"
                                            placeholder="Nombre del tabaco..."
                                            value={ing.nombreTabaco} 
                                            onChange={e => handleIngredientChange(index, 'nombreTabaco', e.target.value)} 
                                            onFocus={() => setFocusedTabacoIdx(index)}
                                            onBlur={() => setTimeout(() => setFocusedTabacoIdx(null), 200)}
                                            disabled={!ing.marca}
                                            className="w-full pl-6 pr-12 py-3.5 md:py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold placeholder:text-shisha-text-dim/20 focus:border-shisha-ember/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Pipette size={18} className="text-shisha-text-dim/30" />
                                        </div>
                                        {focusedTabacoIdx === index && !(!ing.marca) && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-shisha-bg border border-white/10 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-reveal-up py-2">
                                                {tabacosDisponibles
                                                    .filter(t => t.marca.toLowerCase() === ing.marca.toLowerCase())
                                                    .filter(t => t.nombre.toLowerCase().includes(ing.nombreTabaco.toLowerCase()))
                                                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                    .map(t => (
                                                        <button 
                                                            type="button" 
                                                            key={t.id}
                                                            onClick={() => handleIngredientChange(index, 'nombreTabaco', t.nombre)}
                                                            className="w-full text-left px-6 py-3 hover:bg-white/5 text-white font-medium flex items-center justify-between"
                                                        >
                                                            <span>{t.nombre}</span>
                                                        </button>
                                                    ))
                                                }
                                                {ing.nombreTabaco && !tabacosDisponibles.filter(t => t.marca.toLowerCase() === ing.marca.toLowerCase()).some(t => t.nombre.toLowerCase() === ing.nombreTabaco.toLowerCase()) && (
                                                    <div className="px-6 py-3 text-shisha-text-dim font-medium text-sm">
                                                        Se registrará como nuevo tabaco: <strong className="text-white">{ing.nombreTabaco}</strong> ({ing.marca})
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative w-32 shrink-0">
                                            <input 
                                                required
                                                type="number" 
                                                min="1" 
                                                max="100" 
                                                placeholder="%" 
                                                value={ing.porcentaje || ''} 
                                                onChange={e => handleIngredientChange(index, 'porcentaje', Number(e.target.value))} 
                                                className="w-full px-4 md:px-6 py-3.5 md:py-4 rounded-2xl bg-white/5 border border-white/5 text-lg md:text-xl font-black text-center text-white focus:border-shisha-ember/50 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-shisha-ember font-black">%</span>
                                        </div>

                                        <button 
                                            type="button" 
                                            onClick={() => removeIngredient(index)} 
                                            disabled={formData.ingredientes.length === 1}
                                            className="w-14 h-14 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total indicator */}
                        <div className="flex justify-center pt-4">
                            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all border ${
                                formData.ingredientes.reduce((a, b) => a + (b.porcentaje || 0), 0) === 100 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            }`}>
                                <Info size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Total: {formData.ingredientes.reduce((a: number, b: any) => a + (Number(b.porcentaje) || 0), 0)} / 100%
                                </span>
                            </div>
                        </div>
                    </div>


                </div>

                <button 
                    type="submit" 
                    className="w-full py-6 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-shisha-ember/40 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4 group"
                >
                    <Flame size={24} className="group-hover:animate-pulse" />
                    <span>{id ? 'Guardar Cambios' : 'Publicar Alquimia'}</span>
                </button>
            </form>
        </div>
    );
}
