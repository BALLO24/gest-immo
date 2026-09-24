import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  MapPin,
  Map,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  Flag,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// AJOUT : mémorise l'état réduit/déplié d'une visite à l'autre.
const STORAGE_KEY = "dashboard-sidebar-collapsed";

const SidebarDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  // CORRIGÉ : rétrécissement/agrandissement de la sidebar (desktop uniquement
  // — sur mobile, elle reste un panneau plein écran classique, rétrécir n'y
  // aurait pas de sens).
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const SidebarItem = ({ icon, text, to }) => {
    const isActive = to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        onClick={() => setIsOpen(false)}
        title={collapsed ? text : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 group ${
          collapsed ? "md:justify-center md:px-0" : ""
        } ${
          // CORRIGÉ : bg-orange-600 (générique) -> bg-maliOrange (couleur de
          // marque exacte, utilisée partout ailleurs sur le site).
          isActive
            ? "bg-maliOrange text-white shadow-sm"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className={isActive ? "text-white" : "text-white/50 group-hover:text-maliOrange"}>
          {icon}
        </span>
        <span className={`font-semibold text-sm whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>{text}</span>
      </Link>
    );
  };

  return (
    <>
      {/* BOUTON BURGER (mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-maliGreen shadow-lg rounded-xl text-white"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR — CORRIGÉ : bg-slate-900 (générique, incohérent avec le
          reste du site) remplacé par bg-maliGreen, la couleur de marque déjà
          utilisée pour la Navbar, le bandeau d'accueil, etc. */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-maliGreen border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto transition-all duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen
        ${collapsed ? "w-72 md:w-20" : "w-72"}`}
      >
        <div>
          {/* Logo + bouton de rétrécissement */}
          <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? "md:justify-center md:px-0" : "justify-between"}`}>
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="logo immo" className="w-8 h-8 object-contain rounded-md shrink-0" />
              <h1 className={`text-lg font-bold text-white tracking-tight whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
                Immo<span className="text-maliOrange">Mali</span>
              </h1>
            </div>

            {/* AJOUT : bouton de rétrécissement/agrandissement, visible
                uniquement sur desktop (md+), puisque le panneau mobile
                fonctionne déjà en plein écran/masqué. */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
              className={`hidden md:flex items-center justify-center w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 ${collapsed ? "md:absolute md:-right-3 md:top-6 md:bg-maliGreen md:border md:border-white/10 md:w-6 md:h-6" : ""}`}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <p className={`text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-4 ${collapsed ? "md:hidden" : ""}`}>
              Menu Principal
            </p>

            <SidebarItem icon={<LayoutDashboard size={19} />} text="Dashboard" to="/dashboard" />
            <SidebarItem icon={<Home size={19} />} text="Habitations" to="/dashboard/habitations" />
            <SidebarItem icon={<Building2 size={19} />} text="Agences" to="/dashboard/agences" />

            <p className={`text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6 mb-3 px-4 ${collapsed ? "md:hidden" : ""}`}>
              Localisation
            </p>
            <SidebarItem icon={<MapPin size={19} />} text="Villes" to="/dashboard/villes" />
            <SidebarItem icon={<Map size={19} />} text="Quartiers" to="/dashboard/quartiers" />

            <p className={`text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6 mb-3 px-4 ${collapsed ? "md:hidden" : ""}`}>
              Administration
            </p>
            <SidebarItem icon={<Users size={19} />} text="Utilisateurs" to="/dashboard/utilisateurs" />
            <SidebarItem icon={<CalendarClock size={19} />} text="Demandes de visite" to="/dashboard/demandes-visite" />
            <SidebarItem icon={<Flag size={19} />} text="Signalements" to="/dashboard/signalements" />
            <SidebarItem icon={<Settings size={19} />} text="Mon profil" to="/agence/profil" />
          </nav>
        </div>

        {/* Déconnexion */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={logout}
            title={collapsed ? "Déconnexion" : undefined}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-white/50 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors duration-150 font-semibold text-sm ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <LogOut size={19} />
            <span className={collapsed ? "md:hidden" : ""}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarDashboard;
