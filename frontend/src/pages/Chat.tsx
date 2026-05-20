import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Check, CheckCheck, Tag, X, MessageCircle, Sparkles } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

export default function Chat() {
    const { id } = useParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInfo, setChatInfo] = useState<any>(null);
    const [text, setText] = useState('');
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const currentUserId = user?.id; // Authed user

    useEffect(() => {
        // 1. Fetch initial DB messages
        api.get(`/chats/${id}/messages`)
            .then((data: any) => setMessages(data))
            .catch(console.error);

        // 2. Fetch Chat & Product info
        api.get(`/chats/${id}`)
            .then((data: any) => setChatInfo(data))
            .catch(console.error);

        // En producción: conecta al mismo origen → Caddy enruta /socket.io/* al backend
        const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
        
        const socketOptions = {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            secure: window.location.protocol === 'https:',
            reconnectionAttempts: 5,
        };
        socketRef.current = io(socketUrl, socketOptions);

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('joinChat', Number(id));
            if (currentUserId) {
                socketRef.current?.emit('markAsRead', { chatId: Number(id), usuarioLecturaId: currentUserId });
            }
        });

        socketRef.current.on('newMessage', (msg: any) => {
            setMessages(prev => [...prev, msg]);
            if (msg.emisorId !== currentUserId) {
                // Si recibimos un mensaje nuevo y tenemos el chat abierto, lo marcamos como leido
                socketRef.current?.emit('markAsRead', { chatId: Number(id), usuarioLecturaId: currentUserId });
            }
        });

        socketRef.current.on('messagesRead', (data: any) => {
            if (data.chatId === Number(id)) {
                setMessages(prev => prev.map(m => m.emisorId === currentUserId ? { ...m, leido: true } : m));
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        // Emit through websocket
        socketRef.current?.emit('sendMessage', {
            chatId: Number(id),
            emisorId: currentUserId,
            texto: text
        });

        setText('');
    };

    const handleOffer = () => {
        setShowOfferModal(true);
        setOfferAmount('');
    };

    const submitOffer = () => {
        if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) return;

        socketRef.current?.emit('sendMessage', {
            chatId: Number(id),
            emisorId: currentUserId,
            texto: `[OFERTA:${Number(offerAmount).toFixed(2)}€]`
        });
        setShowOfferModal(false);
        setOfferAmount('');
    };

    const handleAcceptOffer = async (amount: string) => {
        // Emitir mensaje de oferta aceptada
        socketRef.current?.emit('sendMessage', {
            chatId: Number(id),
            emisorId: currentUserId,
            texto: `[OFERTA_ACEPTADA:${amount}€]`
        });

        // Actualizar estado del producto a RESERVADO en el marketplace
        if (chatInfo?.productoId) {
            try {
                await api.patch(`/marketplace/products/${chatInfo.productoId}`, { estado: 'RESERVADO' });
                setChatInfo((prev: any) => ({
                    ...prev,
                    product: {
                        ...prev.product,
                        estado: 'RESERVADO'
                    }
                }));
            } catch (err) {
                console.error("Error al reservar el producto", err);
            }
        }
    };

    const handleRejectOffer = (amount: string) => {
        // Emitir mensaje de oferta rechazada
        socketRef.current?.emit('sendMessage', {
            chatId: Number(id),
            emisorId: currentUserId,
            texto: `[OFERTA_RECHAZADA:${amount}€]`
        });
        
        // Abrir modal para contraoferta
        setShowOfferModal(true);
        setOfferAmount('');
    };

    const renderMessageContent = (m: any, index: number, isMe: boolean) => {
        const texto = m.texto || '';

        // 1. Oferta Aceptada
        const acceptedMatch = texto.match(/^\[OFERTA_ACEPTADA:(\d+(?:\.\d+)?)€\]$/);
        if (acceptedMatch) {
            return (
                <div className="glass-panel p-5 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 flex flex-col gap-2 max-w-xs animate-reveal-up">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-base">
                        <CheckCheck size={18} />
                        <span>¡Oferta Aceptada: {acceptedMatch[1]}€!</span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 font-medium leading-tight">
                        Acuerdo cerrado. Por favor, coordinad el pago y envío a continuación.
                    </p>
                </div>
            );
        }

        // 2. Oferta Rechazada
        const rejectedMatch = texto.match(/^\[OFERTA_RECHAZADA:(\d+(?:\.\d+)?)€\]$/);
        if (rejectedMatch) {
            return (
                <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-2 text-rose-400/80 text-xs font-bold animate-reveal-up">
                    <X size={14} className="shrink-0" />
                    <span className="line-through">Oferta de {rejectedMatch[1]}€ rechazada</span>
                </div>
            );
        }

        // 3. Oferta Original
        const offerMatch = texto.match(/^\[OFERTA:(\d+(?:\.\d+)?)€\]$/);
        if (offerMatch) {
            const amount = offerMatch[1];
            // Comprobar si hay alguna respuesta posterior a esta oferta en el chat
            const isAnswered = messages.slice(index + 1).some((subMsg: any) => 
                subMsg.texto?.startsWith('[OFERTA_ACEPTADA:') || subMsg.texto?.startsWith('[OFERTA_RECHAZADA:')
            );

            return (
                <div className={`glass-panel p-6 rounded-3xl border ${isMe ? 'border-amber-400/50 bg-amber-400/10' : 'border-amber-400/20 bg-amber-400/5'} flex flex-col gap-4 min-w-[240px]`}>
                    <div className="flex items-center gap-3 text-amber-400 font-black text-xl">
                        <Tag size={20} className="animate-pulse" />
                        <span className={isAnswered ? "opacity-60 line-through" : ""}>OFERTA: {amount}€</span>
                    </div>
                    {!isMe && !isAnswered && (
                        <div className="flex gap-3 animate-fade-in">
                            <button 
                                onClick={() => handleAcceptOffer(amount)}
                                className="flex-1 py-2.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                            >Aceptar</button>
                            <button 
                                onClick={() => handleRejectOffer(amount)}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-shisha-text-muted hover:text-white border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                            >Rechazar</button>
                        </div>
                    )}
                    {isAnswered && (
                        <div className="text-[9px] font-black text-shisha-text-dim uppercase tracking-widest text-center">
                            Oferta Respondida
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium shadow-xl border ${
                isMe 
                ? 'bg-shisha-ember text-white rounded-br-none border-shisha-ember/20' 
                : 'glass-panel text-white rounded-bl-none border-white/5'
            }`}>
                {texto}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 h-[calc(100vh-130px)] md:h-[calc(100vh-140px)] flex flex-col gap-4 animate-reveal-up overflow-hidden">
            <Link to="/market" className="flex items-center gap-2 text-shisha-text-dim hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors mb-1 md:mb-2 group w-fit">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver al mercado
            </Link>

            <div className="glass-panel flex-1 rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="px-4 md:px-8 py-4 md:py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-shisha-ember/10 rounded-xl md:rounded-2xl flex items-center justify-center text-shisha-ember border border-shisha-ember/20">
                            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-base md:text-xl font-black text-white tracking-tight leading-none flex items-center gap-2 flex-wrap">
                                <span>{chatInfo?.product?.titulo || 'Canal de Negociación'}</span>
                                {chatInfo?.product?.estado === 'RESERVADO' && (
                                    <span className="flex items-center gap-1 text-[8px] md:text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 tracking-widest uppercase">
                                        <Check size={10} /> Reservado
                                    </span>
                                )}
                            </h2>
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-shisha-text-dim mt-1 flex items-center gap-1.5">
                                <Sparkles size={10} className="text-shisha-ember" /> 
                                {chatInfo?.product?.precio ? `${Number(chatInfo.product.precio).toFixed(2)}€ • ` : ''}
                                Cifrado de extremo a extremo
                            </p>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-8 flex flex-col gap-3 md:gap-6 custom-scrollbar bg-white/[0.01]">
                    {messages.map((m, i) => {
                        const isMe = m.emisorId === currentUserId;
                        return (
                            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'} animate-reveal-up`}>
                                {renderMessageContent(m, i, isMe)}
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <span className="text-[9px] font-black text-shisha-text-dim uppercase tracking-tighter">
                                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        m.leido 
                                        ? <CheckCheck size={12} className="text-emerald-500" /> 
                                        : <Check size={12} className="text-shisha-text-dim" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {messages.length === 0 && (
                        <div className="m-auto text-center space-y-4 py-10">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-shisha-text-dim/20">
                                <MessageCircle size={32} />
                            </div>
                            <p className="text-shisha-text-dim font-black text-[10px] uppercase tracking-widest">Inicia la conversación</p>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className="px-3 md:px-8 py-3 md:py-6 border-t border-white/5 bg-white/[0.02] shrink-0 space-y-3 md:space-y-4">
                    <button 
                        onClick={handleOffer} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all group shadow-lg active:scale-95"
                    >
                        <Tag size={12} className="group-hover:rotate-12 transition-transform" />
                        Oferta Comercial
                    </button>

                    <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
                        <input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Mensaje..."
                            className="flex-1 px-3.5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white font-medium focus:border-shisha-ember/50 outline-none transition-all placeholder:text-shisha-text-dim/30 text-sm md:text-base"
                        />
                        <button 
                            type="submit" 
                            className="w-12 h-12 md:w-14 md:h-14 bg-shisha-ember hover:bg-shisha-ember-deep text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-shisha-ember/20 transition-all hover:-translate-y-1 active:scale-90 shrink-0"
                        >
                            <Send className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal de Oferta */}
            {showOfferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in bg-shisha-bg/60 backdrop-blur-md" onClick={() => setShowOfferModal(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass-panel w-full max-w-sm p-10 rounded-[3rem] border-white/10 shadow-3xl animate-reveal-up flex flex-col gap-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 text-amber-500/5 rotate-12 scale-150 pointer-events-none">
                            <Tag size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                                        <Tag size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Hacer Oferta</h3>
                                </div>
                                <button onClick={() => setShowOfferModal(false)} className="text-shisha-text-dim hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-[11px] font-black uppercase tracking-widest text-shisha-text-dim mb-8">Propón un precio de compra directo</p>

                            <div className="relative mb-8">
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && submitOffer()}
                                    placeholder="0.00"
                                    autoFocus
                                    className="w-full bg-white/5 border-2 border-amber-500/30 px-8 py-6 rounded-3xl text-4xl font-black text-white outline-none focus:border-amber-500 transition-all text-center"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-amber-500">€</span>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowOfferModal(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-shisha-text-dim hover:text-white font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all"
                                >Cancelar</button>
                                <button
                                    onClick={submitOffer}
                                    disabled={!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all disabled:opacity-30 active:scale-95"
                                >Enviar Oferta 🔥</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
