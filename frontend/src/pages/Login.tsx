import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data: any = await api.post('/auth/login', { email, password });
            login(data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error en credenciales');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-shisha-ember/10 blur-[120px] rounded-full animate-float-slow"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] bg-shisha-neon/10 blur-[120px] rounded-full [animation-delay:-4s]"></div>
            </div>

            <div className="glass-panel w-full max-w-md p-10 md:p-14 rounded-[3rem] shadow-2xl animate-reveal-up">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-shisha-ember/10 border border-shisha-ember/20 mb-6 group">
                        <LogIn size={28} className="text-shisha-ember group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Bienvenido al Lounge</h2>
                    <p className="text-shisha-text-muted font-medium">Introduce tus credenciales para continuar compartiendo.</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-sm font-bold text-center mb-8 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-shisha-text-dim px-2">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-ember transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-ember/40 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-shisha-text-dim px-2">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-shisha-text-dim group-focus-within:text-shisha-ember transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-shisha-text-dim focus:bg-white/10 focus:border-shisha-ember/40 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black py-4 rounded-2xl shadow-lg shadow-shisha-ember/20 hover:shadow-shisha-ember/40 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Entrar al Lounge</span>
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-shisha-text-dim font-medium text-sm">
                        ¿Aún no tienes cuenta? 
                        <Link to="/register" className="text-shisha-ember font-black ml-2 hover:underline tracking-tight">Regístrate gratis</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

