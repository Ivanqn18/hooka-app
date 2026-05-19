import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import MezclasList from './pages/MezclasList'
import CreateMezcla from './pages/CreateMezcla'
import MezclaDetail from './pages/MezclaDetail'
import MarketplaceList from './pages/MarketplaceList'
import CreateProduct from './pages/CreateProduct'
import ProductDetail from './pages/ProductDetail'
import Chat from './pages/Chat'
import MapView from './pages/MapView'
import BarDetail from './pages/BarDetail'
import AdminDashboard from './pages/AdminDashboard'
import { TobaccoCatalog } from './pages/TobaccoCatalog'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import StashPage from './pages/StashPage'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationBell from './components/NotificationBell'
import { useAuth } from './context/AuthContext'
import { imageUrl } from './utils/imageUrl'

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex justify-between items-center px-6 md:px-10 py-5 sticky top-0 z-[100] bg-shisha-bg/95 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20">
        <Link to="/" onClick={closeMenu} className="text-xl md:text-2xl font-black text-white tracking-tighter hover:scale-105 transition-transform no-underline">
          <span className="text-shisha-ember">Hooka</span>Hub
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-8 items-center">
          <Link to="/mezclas" className="text-shisha-text-muted font-bold text-[0.8rem] uppercase tracking-wider transition-all hover:text-shisha-ember">Mezclas</Link>
          <Link to="/market" className="text-shisha-text-muted font-bold text-[0.8rem] uppercase tracking-wider transition-all hover:text-shisha-ember">Mercado</Link>
          <Link to="/tobaccos" className="text-shisha-text-muted font-bold text-[0.8rem] uppercase tracking-wider transition-all hover:text-shisha-ember">Tabacos</Link>
          <Link to="/mapa" className="text-shisha-text-muted font-bold text-[0.8rem] uppercase tracking-wider transition-all hover:text-shisha-ember">Mapa</Link>
          {user && (
            <Link to="/stash" className="text-shisha-text-muted font-bold text-[0.8rem] uppercase tracking-wider transition-all hover:text-shisha-ember">Mi Stash</Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className="text-shisha-ember font-black text-[0.8rem] uppercase tracking-wider hover:glow-pulse">Admin</Link>
          )}
          {user ? (
            <div className="flex items-center gap-6 border-l border-white/10 pl-6">
              <NotificationBell />
              <Link to="/perfil" className="text-white font-black text-sm hover:text-shisha-ember transition-colors flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-shisha-ember/20 border-2 border-shisha-ember/40 flex items-center justify-center text-[10px] shadow-lg shadow-shisha-ember/10 group-hover:scale-105 transition-transform">
                  {user.avatarUrl ? (
                    <img
                      src={imageUrl(user.avatarUrl)}
                      alt={user.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.nombre[0].toUpperCase()}</span>
                  )}
                </div>
                <span>{user.nombre}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-shisha-ember hover:bg-shisha-ember-deep text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-shisha-ember/20 active:scale-95">
              Acceder
            </Link>
          )}
        </div>

        {/* Mobile / Tablet Controls */}
        <div className="flex lg:hidden items-center gap-4">
          {user && <NotificationBell />}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-[90] bg-shisha-bg transition-all duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col h-full pt-24 px-8 pb-10 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Link to="/mezclas" onClick={closeMenu} className="py-4 text-2xl font-black text-white border-b border-white/5 flex justify-between items-center group">
              Mezclas <span className="text-shisha-ember opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
            <Link to="/market" onClick={closeMenu} className="py-4 text-2xl font-black text-white border-b border-white/5 flex justify-between items-center group">
              Mercado <span className="text-shisha-ember opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
            <Link to="/tobaccos" onClick={closeMenu} className="py-4 text-2xl font-black text-white border-b border-white/5 flex justify-between items-center group">
              Tabacos <span className="text-shisha-ember opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
            <Link to="/mapa" onClick={closeMenu} className="py-4 text-2xl font-black text-white border-b border-white/5 flex justify-between items-center group">
              Mapa <span className="text-shisha-ember opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
            {user && (
              <Link to="/stash" onClick={closeMenu} className="py-4 text-2xl font-black text-white border-b border-white/5 flex justify-between items-center group">
                Mi Stash <span className="text-shisha-ember opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" onClick={closeMenu} className="py-4 text-2xl font-black text-shisha-ember border-b border-white/5 flex justify-between items-center">
                Admin
              </Link>
            )}
          </div>

          <div className="mt-auto pt-10 border-t border-white/10 space-y-6">
            {user ? (
              <>
                <Link to="/perfil" onClick={closeMenu} className="flex items-center gap-4 p-4 glass-panel rounded-2xl">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-shisha-ember">
                    {user.avatarUrl ? (
                      <img src={imageUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-shisha-ember/20 flex items-center justify-center font-black">{user.nombre[0]}</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black">{user.nombre}</span>
                    <span className="text-shisha-text-dim text-[10px] uppercase font-bold tracking-widest">Mi Perfil</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-rose-500/10 text-rose-500 font-black uppercase tracking-[0.2em] rounded-2xl border border-rose-500/20 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="block w-full py-5 bg-shisha-ember text-white text-center font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl">
                Acceder al Gremio
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto box-border overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mezclas" element={<MezclasList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mezcla/:id" element={<MezclaDetail />} />
          <Route path="/market" element={<MarketplaceList />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/mapa" element={<MapView />} />
          <Route path="/bar/:id" element={<BarDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/mezcla/nueva" element={<CreateMezcla />} />
            <Route path="/mezcla/editar/:id" element={<CreateMezcla />} />
            <Route path="/market/nuevo" element={<CreateProduct />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tobaccos" element={<TobaccoCatalog />} />
            <Route path="/stash" element={<StashPage />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App

