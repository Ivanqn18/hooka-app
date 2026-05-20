import React from 'react';
import { Star, ArrowRight, Sparkles, Zap, Flame, Crown } from 'lucide-react';

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Vance",
    role: "Event Organizer",
    content: "The best shisha catering experience! The neon setups completely transformed our VIP lounge.",
    avatar: "https://i.pravatar.cc/150?u=alex",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Nightclub Manager",
    content: "Flawless service. The premium flavors and smoking thick clouds are exactly what our club needed.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    rating: 5
  },
  {
    id: 3,
    name: "Marcus Thorne",
    role: "Private Client",
    content: "Unreal attention to detail! The heat management was perfect and the aesthetic unmatched.",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    rating: 5
  }
];

const ShishaServices: React.FC = () => {
  return (
    <div className="min-h-screen bg-shisha-bg text-white pb-20 relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="min-h-[85vh] flex items-center justify-center text-center px-8 relative animate-reveal-up overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute w-[600px] h-[600px] bg-shisha-ember/10 blur-[120px] rounded-full -top-40 -right-40 animate-pulse pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -bottom-40 -left-40 animate-pulse delay-700 pointer-events-none" />

        <div className="max-w-4xl flex flex-col items-center gap-8 z-10 relative">
          <div className="inline-flex items-center glass-panel px-6 py-2 rounded-full border-white/10 shadow-2xl mb-4">
            <Sparkles size={16} className="mr-3 text-shisha-ember group-hover:animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Elevación del Gremio</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter text-white m-0">
            Noches <span className="text-shisha-ember">Eternas</span>.
          </h1>
          
          <p className="text-base md:text-xl lg:text-2xl font-medium text-shisha-text-muted max-w-2xl leading-relaxed mb-4">
            Transformamos eventos sociales en experiencias sensoriales únicas con alquimia de vanguardia y atmósferas premium.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 mt-4 w-full sm:w-auto">
            <button className="px-10 py-5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-shisha-ember/40 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 group">
              Reservar Catering 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
            <button className="px-10 py-5 glass-panel hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <Flame className="text-shisha-ember" size={18} /> 
              Ver Carta Alquimia
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10 space-y-16 md:space-y-20">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Servicios de Élite</h2>
          <div className="w-16 md:w-20 h-1.5 bg-shisha-ember mx-auto rounded-full"></div>
          <p className="text-sm md:text-base text-shisha-text-dim font-medium">Desde eventos corporativos hasta fiestas privadas clandestinas.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
                { icon: Flame, title: "Alquimia Artesanal", desc: "Mezclas exclusivas diseñadas para una producción de humo máxima y sabores intensos.", color: "text-shisha-ember" },
                { icon: Zap, title: "Gestión Integral", desc: "Servicio completo con sommeliers expertos, gestión térmica y cristalería de lujo.", color: "text-indigo-400" },
                { icon: Crown, title: "Hardware Premium", desc: "Cachimba de aluminio aeroespacial y cristal bohemio para el tiro más fluido del mercado.", color: "text-amber-400" }
            ].map((service, i) => (
                <div key={i} className="glass-panel p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/5 shadow-2xl group hover:-translate-y-2 transition-all hover:border-white/10 animate-reveal-up" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${service.color}`}>
                        <service.icon className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-white tracking-tight">{service.title}</h3>
                    <p className="text-sm md:text-base text-shisha-text-dim font-medium leading-relaxed">{service.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10 space-y-16 md:space-y-20">
         <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Honor del Gremio</h2>
          <div className="w-16 md:w-20 h-1.5 bg-shisha-ember mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {MOCK_TESTIMONIALS.map((testimonial, i) => (
            <div key={testimonial.id} className="glass-panel p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/5 shadow-2xl flex flex-col gap-6 md:gap-8 animate-reveal-up" style={{ animationDelay: `${i * 200}ms` }}>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#FF5722" className="text-shisha-ember" />
                ))}
              </div>
              <p className="text-lg md:text-xl font-medium text-white italic leading-relaxed flex-grow">"{testimonial.content}"</p>
              <div className="flex items-center gap-4 pt-6 md:pt-8 border-t border-white/5">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border-2 border-shisha-ember shadow-lg" />
                <div className="space-y-0.5">
                  <p className="font-black text-white text-sm md:text-base leading-none">{testimonial.name}</p>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-shisha-text-dim">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="glass-panel-premium p-6 md:p-16 rounded-2xl md:rounded-[4rem] text-center space-y-8 md:space-y-10 relative overflow-hidden shadow-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-shisha-ember/10 to-indigo-500/10 animate-pulse pointer-events-none opacity-50" />
          
          <div className="relative z-10 space-y-2 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">¿Listo para el Nivel Dios?</h2>
            <p className="text-base md:text-xl text-shisha-text-muted max-w-xl mx-auto leading-relaxed">Reserva nuestros servicios premium y entra en una nueva dimensión de hospitalidad.</p>
          </div>

          <button className="relative z-10 px-8 md:px-12 py-5 md:py-6 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-[10px] md:text-sm uppercase tracking-[0.3em] rounded-2xl md:rounded-3xl shadow-2xl shadow-shisha-ember/30 transition-all hover:-translate-y-1 active:scale-[0.98] group flex items-center mx-auto gap-4">
            Asegurar Fecha <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ShishaServices;
