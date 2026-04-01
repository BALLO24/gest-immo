import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const rawNum = import.meta.env.VITE_NUMERO_WHATSAPP || "";
  const formattedNum = rawNum.replace(/\s+/g, "").length > 4
    ? rawNum.replace(/\s+/g, "").slice(4).match(/.{1,2}/g)?.join(" ")
    : rawNum;

  const isActive = (path) => location.pathname === path;

  return (
    <nav role="navigation" aria-label="Navigation principale" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
      {/* === TITLE BAR === */}
      <div className="win-titlebar select-none">
        <div className="flex items-center gap-2">
          {/* Mini icon */}
          <div
            className="w-4 h-4 flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#FFFFFF', color: '#000080', border: '1px solid #000' }}
            aria-hidden="true"
          >
            🏠
          </div>
          <Link to="/" className="text-white font-bold text-xs hover:underline" aria-label="ImmoMali - Accueil">
            ImmoMali - Portail Immobilier du Mali
          </Link>
        </div>
        {/* Window controls */}
        <div className="flex gap-1" aria-hidden="true">
          <button
            className="win-btn !px-1.5 !py-0 text-xs font-bold leading-none"
            title="Réduire"
            style={{ minWidth: '18px', minHeight: '16px', fontSize: '10px' }}
          >
            _
          </button>
          <button
            className="win-btn !px-1.5 !py-0 text-xs font-bold leading-none"
            title="Agrandir"
            style={{ minWidth: '18px', minHeight: '16px', fontSize: '10px' }}
          >
            □
          </button>
          <button
            className="win-btn !px-1.5 !py-0 text-xs font-bold leading-none"
            title="Fermer"
            style={{ minWidth: '18px', minHeight: '16px', fontSize: '10px', color: '#CC0000', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* === MENU BAR === */}
      <div className="win-menubar" style={{ backgroundColor: '#D4D0C8' }}>
        {/* Logo area */}
        <div className="flex items-center gap-1 mr-4 pr-3" style={{ borderRight: '2px solid #808080' }}>
          <img src="/logo.png" alt="Logo ImmoMali" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
          <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#000080' }}>ImmoMali</span>
        </div>

        {/* Desktop menu items */}
        <div className="hidden md:flex gap-0 items-center">
          <Link
            to="/"
            className={`win-menuitem ${isActive('/') ? 'bg-win2kNavy text-white' : ''}`}
          >
            <u>A</u>ccueil
          </Link>
          <Link
            to="/location"
            className={`win-menuitem ${isActive('/location') ? 'bg-win2kNavy text-white' : ''}`}
          >
            <u>L</u>ocation
          </Link>
          <Link
            to="/vente"
            className={`win-menuitem ${isActive('/vente') ? 'bg-win2kNavy text-white' : ''}`}
          >
            <u>V</u>ente
          </Link>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#808080', margin: '0 4px', borderRight: '1px solid #FFFFFF' }} aria-hidden="true"></div>

          {rawNum && (
            <a href={`tel:${rawNum}`} className="win-menuitem flex items-center gap-1">
              📞 {formattedNum}
            </a>
          )}
        </div>

        {/* Connexion button */}
        <div className="hidden md:flex ml-auto items-center gap-2">
          <Link to="/login">
            <button className="win-btn font-bold" style={{ color: '#000080' }}>
              🔑 Connexion
            </button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden ml-auto win-btn !px-2 !py-0.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* === MOBILE MENU === */}
      {menuOpen && (
        <div
          className="md:hidden win-window"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#D4D0C8',
          }}
          role="menu"
        >
          {/* Title bar for mobile popup */}
          <div className="win-titlebar">
            <span>Menu de navigation</span>
            <button
              className="win-btn !px-1 !py-0 text-xs"
              onClick={() => setMenuOpen(false)}
              style={{ minWidth: '18px', minHeight: '16px' }}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>
          <div className="p-3 flex flex-col gap-1">
            <Link to="/" role="menuitem" className="win-menuitem block py-2 border-b border-gray-400">
              📂 Accueil
            </Link>
            <Link to="/location" role="menuitem" className="win-menuitem block py-2 border-b border-gray-400">
              🏠 Location
            </Link>
            <Link to="/vente" role="menuitem" className="win-menuitem block py-2 border-b border-gray-400">
              🏡 Vente
            </Link>
            {rawNum && (
              <a href={`tel:${rawNum}`} role="menuitem" className="win-menuitem block py-2 border-b border-gray-400">
                📞 {formattedNum}
              </a>
            )}
            <div className="mt-2 pt-2">
              <Link to="/login">
                <button className="win-btn w-full" style={{ color: '#000080', fontWeight: 'bold' }}>
                  🔑 Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* === TOOLBAR / ADDRESS BAR === */}
      <div
        className="flex items-center gap-2 px-2 py-1 text-xs"
        style={{ backgroundColor: '#D4D0C8', borderBottom: '1px solid #808080' }}
        aria-label="Barre d'adresse"
      >
        <button className="win-btn !px-2 !py-0.5 text-xs" title="Précédent" aria-label="Page précédente">◀</button>
        <button className="win-btn !px-2 !py-0.5 text-xs" title="Suivant" aria-label="Page suivante">▶</button>
        <button className="win-btn !px-2 !py-0.5 text-xs" title="Actualiser" aria-label="Actualiser la page">↻</button>
        <button className="win-btn !px-2 !py-0.5 text-xs" title="Accueil" aria-label="Aller à l'accueil">🏠</button>
        <div className="flex-1 win-sunken px-2 py-0.5 bg-white text-xs" aria-label="Adresse">
          https://immomali.ml/{location.pathname.replace(/^\//, '') || ''}
        </div>
        <button className="win-btn !px-3 !py-0.5 text-xs font-bold" aria-label="Aller à l'adresse">OK</button>
      </div>
    </nav>
  );
}
