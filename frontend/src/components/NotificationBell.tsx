import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = () => {
        if (!user) return;
        api.get(`/notificaciones?userId=${user.id}`)
            .then((data: any) => setNotifications(data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.leido).length;

    const handleNotificationClick = (notif: any) => {
        if (!notif.leido) {
            api.put(`/notificaciones/${notif.id}/leer`, { userId: user?.id })
                .then(() => {
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
                });
        }
        setIsOpen(false);
        if (notif.tipo === 'LIKE_MEZCLA' && notif.recursoId) {
            navigate(`/mezcla/${notif.recursoId}`);
        } else if (notif.tipo === 'NUEVO_MENSAJE' && notif.recursoId) {
            navigate(`/chat/${notif.recursoId}`);
        }
    };

    if (!user) return null;

    return (
        <div ref={dropdownRef} className="relative flex items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
                title="Notificaciones"
            >
                <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-shisha-ember' : 'text-white'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-shisha-ember text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-shisha-ember/20 ring-2 ring-shisha-bg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 md:w-96 max-h-[500px] overflow-hidden z-[110] glass-panel-premium rounded-3xl shadow-3xl flex flex-col border border-white/10 animate-reveal-up bg-shisha-bg">
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest m-0">Notificaciones</h4>
                            {unreadCount > 0 && <div className="w-2 h-2 rounded-full bg-shisha-ember animate-pulse" />}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => {
                                    api.put('/notificaciones/leer-todas', { userId: user.id })
                                        .then(() => fetchNotifications());
                                }}
                                className="text-[10px] font-black text-shisha-neon uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <CheckCircle size={12} />
                                Marcar todas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[400px] scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center space-y-3">
                                <Bell size={32} className="mx-auto text-white/5" />
                                <p className="text-shisha-text-dim text-xs font-bold italic">No hay nada nuevo por aquí</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-5 border-b border-white/5 cursor-pointer flex gap-4 items-start transition-all hover:bg-white/5 ${notif.leido ? 'opacity-60' : 'bg-shisha-ember/[0.03]'}`}
                                >
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.leido ? 'bg-white/10' : 'bg-shisha-ember shadow-[0_0_8px_rgba(255,75,75,0.4)]'}`} />
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-[13px] leading-relaxed font-medium ${notif.leido ? 'text-shisha-text-muted' : 'text-white'}`}>
                                            {notif.mensaje}
                                        </p>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-shisha-text-dim flex items-center gap-1.5">
                                            <Info size={10} />
                                            {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 bg-white/[0.01] text-center border-t border-white/5">
                            <p className="text-[9px] font-black text-shisha-text-dim uppercase tracking-[0.2em]">Fin de las notificaciones</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
