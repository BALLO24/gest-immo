import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Fermer le menu si on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navBgStyle = "bg-maliSand/95 backdrop-blur-md";
  
  // Formatage sécurisé du numéro : +223 70 00 00 00
  const rawNum = import.meta.env.VITE_NUMERO_WHATSAPP || "";
  const formattedNum = rawNum.replace(/\s+/g, "").length > 4 
    ? rawNum.replace(/\s+/g, "").slice(4).match(/.{1,2}/g)?.join(" ") 
    : rawNum;

  return (
    <nav className={`${navBgStyle} border-b border-maliOcre/20 sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LOGO --- */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group" aria-label="ImmoMali - Retour à l'accueil">
              {/* <div className="p-1.5 bg-maliOrange/10 rounded-lg group-hover:bg-maliOrange/20 transition-colors">
                <svg className="w-7 h-7 text-maliOrange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div> */}
              <img src="/logo.png" alt="Logo ImmoMali" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-xl tracking-tight text-maliGreen">ImmoMali</span>
            </Link>
          </div>

          {/* --- MENU DESKTOP --- */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className={`px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === "/" ? "text-maliOrange" : "text-maliGreen/80 hover:text-maliOrange"}`}>
              Accueil
            </Link>
            <Link to="/location" className={`px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === "/location" ? "text-maliOrange" : "text-maliGreen/80 hover:text-maliOrange"}`}>
              À Louer
            </Link>
            <Link to="/vente" className={`px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === "/vente" ? "text-maliOrange" : "text-maliGreen/80 hover:text-maliOrange"}`}>
              À Vendre
            </Link>

            <div className="h-6 w-[1px] bg-maliOcre/20 mx-2"></div>

            {/* Numéro de téléphone */}
            <a href={`tel:${rawNum}`} className="flex items-center gap-2 text-maliGreen font-bold hover:text-maliOrange transition-colors">
              <div className="w-8 h-8 rounded-full bg-maliGreen/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-maliGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm font-mono">{formattedNum}</span>
            </a>

            {/* Bouton Connexion */}
            <Link 
              to="/login"
              className="ml-4 px-6 py-2 bg-maliGreen text-white text-sm font-bold rounded-full shadow-md hover:bg-maliOrange hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              Connexion
            </Link>
          </div>

          {/* --- BURGER MOBILE --- */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              className="p-2 rounded-lg text-maliGreen hover:bg-maliOcre/10 transition-colors"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      <div
        className={`md:hidden absolute top-[64px] left-0 w-full ${navBgStyle} border-b border-maliOcre/15 shadow-2xl transition-all duration-300 origin-top ${
          menuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          <Link to="/" className="text-maliGreen font-bold text-xl hover:text-maliOrange transition-colors">Accueil</Link>
          <Link to="/location" className="text-maliGreen font-bold text-xl hover:text-maliOrange transition-colors">Louer</Link>
          <Link to="/vente" className="text-maliGreen font-bold text-xl hover:text-maliOrange transition-colors">Vendre</Link>
          
          <div className="h-[1px] bg-maliOcre/10 w-full"></div>

          <a href={`tel:${rawNum}`} className="flex items-center gap-4 text-maliGreen font-bold text-lg">
            <div className="w-10 h-10 rounded-full bg-maliOrange/10 flex items-center justify-center text-maliOrange">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            {formattedNum}
          </a>

          <Link 
            to="/login" 
            className="w-full py-4 bg-maliGreen text-white text-center font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </nav>
  );
}