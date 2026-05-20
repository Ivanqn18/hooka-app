import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MapPin, Users, Package, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="text-shisha-text-main pb-16 bg-shisha-bg min-h-screen relative overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center text-center pt-20 pb-16 px-4 md:px-8 relative animate-reveal-up">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-shisha-ember/10 blur-[120px] rounded-full animate-float-slow opacity-30"></div>
          <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-shisha-neon/10 blur-[120px] rounded-full [animation-delay:-4s] opacity-30"></div>
        </div>

        <div className="max-w-[900px] flex flex-col items-center gap-8 z-10 relative">
          <div className="inline-flex items-center glass-panel px-6 py-2 rounded-full shadow-2xl mb-4 animate-reveal-up [animation-delay:0.2s]">
            <Sparkles size={16} className="mr-2 text-shisha-ember" />
            <span className="text-shisha-text-muted font-bold tracking-[0.2em] text-[10px] uppercase">HookaHub Premium Experience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[1.1] m-0 animate-reveal-up [animation-delay:0.4s]">
            <span className="text-white">La Experiencia</span><br />
            <span className="text-gradient-amber">Definitiva de Shisha.</span>
          </h1>

          <p className="text-lg md:text-2xl max-w-[650px] leading-relaxed mb-6 text-shisha-text-muted animate-reveal-up [animation-delay:0.6s]">
            Descubre miles de tabacos, crea tus propias mezclas, encuentra lounges cercanos y contrata servicios premium.
          </p>

          <div className="flex gap-4 mt-4 flex-wrap justify-center w-full animate-reveal-up [animation-delay:0.8s]">
            <Link to="/tobaccos" className="bg-shisha-ember hover:bg-shisha-ember-deep text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-lg shadow-shisha-ember/20 inline-flex items-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-shisha-ember/40 w-full md:w-auto justify-center group">
              Explorar Tabacos
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
            </Link>
            {!user && (
              <Link to="/register" className="glass-panel text-white px-10 py-5 rounded-2xl font-bold transition-all inline-flex items-center hover:bg-white/10 w-full md:w-auto justify-center group">
                Únete a la Comunidad
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-12 md:mb-20 animate-reveal-up">
          <h2 className="text-4xl md:text-5xl mb-6 text-center font-black tracking-tight">Todo lo que necesitas</h2>
          <div className="w-[80px] h-[4px] bg-gradient-to-r from-shisha-ember to-shisha-neon rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Mezclas */}
          <Link to="/mezclas" className="glass-panel glass-panel-hover p-6 md:p-10 rounded-2xl md:rounded-[2rem] group col-span-1 lg:col-span-2 flex flex-col justify-between animate-reveal-up [animation-delay:1s]">
            <div>
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-6 md:mb-8 rounded-2xl bg-shisha-ember/10 border border-shisha-ember/20 group-hover:scale-110 transition-transform">
                <Users size={28} className="text-shisha-ember" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">Comunidad de Mezclas</h3>
              <p className="text-shisha-text-muted text-base md:text-lg leading-relaxed">Comparte tus mejores recetas, descubre combinaciones exóticas y valora las creaciones de otros expertos.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <ArrowRight className="text-shisha-text-dim group-hover:text-shisha-ember transform transition-all group-hover:translate-x-2" size={28} />
            </div>
          </Link>

          {/* Card 2: Mapa */}
          <Link to="/mapa" className="glass-panel glass-panel-hover p-6 md:p-10 rounded-2xl md:rounded-[2rem] group flex flex-col justify-between animate-reveal-up [animation-delay:1.2s]">
            <div>
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-6 md:mb-8 rounded-2xl bg-shisha-neon/10 border border-shisha-neon/20 group-hover:scale-110 transition-transform">
                <MapPin size={28} className="text-shisha-neon" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4">Radar de Lounges</h3>
              <p className="text-shisha-text-muted text-base md:text-lg leading-relaxed">Encuentra los mejores sitios cerca de ti mediante nuestro mapa interactivo.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <ArrowRight className="text-shisha-text-dim group-hover:text-shisha-neon transform transition-all group-hover:translate-x-2" size={24} />
            </div>
          </Link>

          {/* Card 3: Tabacos */}
          <Link to="/tobaccos" className="glass-panel glass-panel-hover p-6 md:p-10 rounded-2xl md:rounded-[2rem] group flex flex-col justify-between animate-reveal-up [animation-delay:1.4s]">
            <div>
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-6 md:mb-8 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                <Flame size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4">Catálogo Oficial</h3>
              <p className="text-shisha-text-muted text-lg leading-relaxed">Precios actualizados del BOE y marcas de todo el mundo al alcance de tu mano.</p>
            </div>
            <div className="mt-8 flex justify-end">
              <ArrowRight className="text-shisha-text-dim group-hover:text-white transform transition-all group-hover:translate-x-2" size={28} />
            </div>
          </Link>

          {/* Card 4: Stash */}
          <Link to="/stash" className="glass-panel glass-panel-hover p-6 md:p-10 rounded-2xl md:rounded-[2rem] group col-span-1 lg:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 animate-reveal-up [animation-delay:1.6s]">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0 rounded-2xl bg-shisha-ember/10 border border-shisha-ember/20 group-hover:rotate-12 transition-transform">
              <Package size={32} className="text-shisha-ember" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black mb-2 px-0">Tu Colección Personal</h3>
              <p className="text-shisha-text-muted text-base md:text-lg m-0">Gestiona tu almacén de tabacos, organiza tu estantería y planifica tus futuras adquisiciones.</p>
            </div>
          </Link>

        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-5xl mx-auto animate-reveal-up">
          <div className="flex flex-col items-center text-center py-12 px-6 md:py-20 md:px-10 glass-panel rounded-2xl md:rounded-[3rem] shadow-shisha-ember/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-shisha-ember/5 via-transparent to-shisha-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">¿Listo para elevar tu nivel?</h2>
            <p className="text-shisha-text-muted max-w-xl mb-10 relative z-10 text-xl leading-relaxed">Únete a la plataforma líder en el mundo de la shisha y lleva tu experiencia al siguiente escalón.</p>
            <Link to="/register" className="bg-shisha-ember hover:bg-shisha-ember-deep text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-shisha-ember/20 relative z-10 hover:-translate-y-1 hover:shadow-shisha-ember/40">
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;

