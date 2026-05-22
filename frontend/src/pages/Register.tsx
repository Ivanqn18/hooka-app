import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Facehash, stringHash } from 'facehash';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Upload, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const BG_COLORS = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444'
];

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const nameStr = nombre || "";
    const colorIndex = Math.abs(stringHash(nameStr)) % BG_COLORS.length;
    const dynamicBgColor = BG_COLORS[colorIndex];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/[\]\\|~`';]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, un número y un carácter especial.');
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('email', email);
        formData.append('password', password);

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        } else if (avatarUrl) {
            formData.append('avatarUrl', avatarUrl);
        }

        try {
            const data: any = await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            login(data.user);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error en el registro';
            setError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 md:p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] bg-shisha-ember/10 blur-[120px] rounded-full animate-float-slow"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] bg-shisha-neon/10 blur-[120px] rounded-full [animation-delay:-3s]"></div>
            </div>

            <div className="glass-panel w-full max-w-lg p-6 md:p-12 rounded-2xl md:rounded-[3rem] shadow-2xl animate-reveal-up overflow-hidden">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-shisha-neon/10 border border-shisha-neon/20 mb-4 group rotate-3">
                        <UserPlus size={24} className="text-shisha-neon group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Únete al Gremio</h2>
                    <p className="text-shisha-text-muted font-medium text-sm">Crea tu perfil y empieza a compartir tus mezclas hoy mismo.</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-sm font-bold text-center mb-6">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl text-sm font-bold text-center mb-6">
                        ¡Bienvenido a la comunidad! Redirigiendo...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* AVATAR SECTION */}
                    <div className="flex flex-col items-center gap-4 py-6 border-b border-white/5 mb-2 relative">
                        <div className="relative group">
                            <div 
                                className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-shisha-neon/30 shadow-2xl relative z-10 transition-transform group-hover:scale-105"
                                style={{ backgroundColor: dynamicBgColor }}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Facehash name={nameStr} size={96} intensity3d="dramatic" variant="gradient" showInitial={true} enableBlink={true} />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-shisha-bg border border-shisha-neon/40 text-shisha-neon rounded-xl flex items-center justify-center shadow-xl hover:bg-shisha-neon hover:text-white transition-all z-20 active:scale-90"
                            >
                                <Upload size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-shisha-text-dim font-black uppercase tracking-widest text-center max-w-[200px]">
                            Tu avatar se genera <span className="text-shisha-neon">por arte de magia</span> con tu nombre
                        </p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-neon transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    minLength={2}
                                    placeholder="Tu alias"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-neon/40 outline-none transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-neon transition-colors" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-neon/40 outline-none transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-shisha-text-dim px-2">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-neon transition-colors" size={16} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-neon/40 outline-none transition-all font-medium text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-shisha-text-dim hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black py-4 rounded-2xl shadow-lg shadow-shisha-ember/20 hover:shadow-shisha-ember/40 active:scale-95 transition-all flex items-center justify-center gap-2 group mt-4"
                    >
                        <span>Crear Cuenta Gratis</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-shisha-text-dim font-medium text-xs">
                        ¿Ya formas parte del gremio? 
                        <Link to="/login" className="text-shisha-ember font-black ml-2 hover:underline tracking-tight">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

