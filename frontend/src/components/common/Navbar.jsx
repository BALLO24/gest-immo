import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-maliSand/95 backdrop-blur-sm border-b border-maliOcre/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-maliOrange"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10.5L12 4l9 6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 10.5v7.5a1 1 0 001 1h3v-5h4v5h3a1 1 0 001-1v-7.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-semibold text-lg text-maliGreen">
                MaliLogement
              </span>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-maliGreen/90 hover:text-maliGreen font-medium">
              Accueil
            </Link>
            <Link to="/" href="#" className="text-maliGreen/80 hover:text-maliGreen font-medium">
              Acheter
            </Link>
            <Link to="/location" href="#" className="text-maliGreen/80 hover:text-maliGreen font-medium">
              Louer
            </Link>
            <Link to="/vente" className="text-maliGreen/80 hover:text-maliGreen font-medium">
              A Vendre
            </Link>

          </div>

          {/* Actions + burger */}
          <div className="flex items-center gap-3">
            <Link to="/"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-maliOcre/25 text-sm font-medium bg-white/60 hover:bg-white"
            >
              <svg
                className="w-4 h-4 text-maliGreen"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Espace propriétaire
            </Link>

            <Link to="/"
              className=" hidden sm:block items-center px-4 py-2 rounded-full bg-maliOrange text-white font-semibold shadow-sm hover:bg-maliOcre transition-colors text-sm"
            >
              Déposer une annonce
            </Link>

            {/* Bouton mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-maliGreen hover:bg-maliSand/60 focus:outline-none focus:ring-2 focus:ring-maliGreen/30"
              aria-expanded={menuOpen}
              aria-label="Ouvrir le menu"
            >
              {menuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile animé */}
      <div
        className={`absolute top-16 left-0 w-full bg-maliSand/95 backdrop-blur-sm border-t border-maliOcre/15 transform transition-all duration-500 ease-in-out ${
          menuOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          <Link to="/" className="block text-maliGreen font-medium py-2">
            Accueil
          </Link>
          <Link to="/" className="block text-maliGreen font-medium py-2">
            Acheter
          </Link>
          <Link to="/location" className="block text-maliGreen font-medium py-2">
            Louer
          </Link>

          <Link to="/" className="block text-maliGreen font-medium py-2">
            Vendre
          </Link>

          <div className="pt-2">
            <Link to="/"
              className="block w-full text-center px-3 py-2 rounded-full bg-maliOrange text-white font-semibold hover:bg-maliOcre transition"
            >
              Déposer une annonce
            </Link>
          </div>

          <div className="pt-3 border-t border-maliOcre/10">
            <Link to="/"
              className="flex items-center gap-2 text-sm text-maliGreen/90 py-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"
                />
              </svg>
              Espace propriétaire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
