import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Style commun pour la cohérence visuelle
  const navBgStyle = "bg-maliSand/95 backdrop-blur-sm";

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`${navBgStyle} border-b border-maliOcre/20 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- LOGO --- */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
              <svg className="w-8 h-8 text-maliOrange" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.5v7.5a1 1 0 001 1h3v-5h4v5h3a1 1 0 001-1v-7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-semibold text-lg text-maliGreen">MaliLogement</span>
            </Link>
          </div>

          {/* --- MENU DESKTOP --- */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="text-maliGreen/90 hover:text-maliGreen font-medium transition-colors">Accueil</Link>
            <Link to="/location" className="text-maliGreen/80 hover:text-maliGreen font-medium transition-colors">A Louer</Link>
            <Link to="/vente" className="text-maliGreen/80 hover:text-maliGreen font-medium transition-colors">A Vendre</Link>

            {/* Bouton de connexion Desktop */}
            <Link 
              to="/login"
              className="group relative px-5 py-2.5 bg-gradient-to-r from-maliGreen to-maliOrange text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <div className="flex items-center justify-center gap-2 relative z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm tracking-wide">Se connecter</span>
              </div>
            </Link>
          </div>

          {/* --- BURGER MOBILE --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-maliGreen hover:bg-maliSand/60 transition-colors focus:outline-none"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE ANIMÉ --- */}
      {/* Ici on réutilise navBgStyle pour garantir l'identité visuelle */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full ${navBgStyle} border-b border-maliOcre/15 shadow-xl transform transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-5 py-6 space-y-5">
          <Link to="/" onClick={closeMenu} className="block text-maliGreen font-semibold text-lg border-b border-maliOcre/5 pb-2">Accueil</Link>
          <Link to="/location" onClick={closeMenu} className="block text-maliGreen font-semibold text-lg border-b border-maliOcre/5 pb-2">Louer</Link>
          <Link to="/vente" onClick={closeMenu} className="block text-maliGreen font-semibold text-lg border-b border-maliOcre/5 pb-2">Vendre</Link>
          
          {/* Se connecter style onglet */}
          <Link to="/login" onClick={closeMenu} className="flex items-center gap-3 text-maliOrange font-bold text-lg pb-2 border-b border-maliOcre/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Se connecter
          </Link>

        </div>
      </div>
    </nav>
  );
}