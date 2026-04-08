import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
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
        const interval = setInterval(fetchNotifications, 30000); // Poll constanly for unread msgs and likes
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
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.4rem', display: 'flex', alignItems: 'center' }}
                title="Notificaciones"
            >
                <Bell size={20} color="var(--text-primary)" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'var(--danger-color)', color: 'white',
                        fontSize: '0.65rem', fontWeight: 'bold',
                        borderRadius: '50%', width: '16px', height: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                    background: 'var(--bg-surface)', border: 'var(--glass-border)',
                    borderRadius: '12px', width: '300px', maxHeight: '400px', overflowY: 'auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '1rem', borderBottom: 'var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Notificaciones</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => {
                                    api.put('/notificaciones/leer-todas', { userId: user.id })
                                        .then(() => fetchNotifications());
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Marcar todas
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No tienes notificaciones
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                style={{
                                    padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer', background: notif.leido ? 'transparent' : 'rgba(255,75,75,0.05)',
                                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-glass)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = notif.leido ? 'transparent' : 'rgba(255,75,75,0.05)'}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.leido ? 'transparent' : 'var(--danger-color)', marginTop: '0.4rem', flexShrink: 0 }} />
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: notif.leido ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                                        {notif.mensaje}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
