import React, { useState } from "react";
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
  LayoutDashboard
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SidebarDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // Composant interne pour les items
  const SidebarItem = ({ icon, text, to }) => {
    // Logique corrigée : Si c'est le dashboard exact ou si l'URL commence par le chemin (mais pas juste "/")
    const isActive = to === "/dashboard" 
      ? location.pathname === "/dashboard" 
      : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-orange-500"}`}>
          {icon}
        </span>
        <span className="font-bold text-sm">{text}</span>
      </Link>
    );
  };

  return (
    <>
      {/* --- BOUTON BURGER (Mobile uniquement) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-slate-900 shadow-xl rounded-2xl border border-slate-800 text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- OVERLAY --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR FONCÉE --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:min-h-screen`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-900/20">
              M
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Mali<span className="text-orange-500">Logement</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
            
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/dashboard" />
            <SidebarItem icon={<Home size={20} />} text="Habitations" to="/dashboard/habitations" />
            <SidebarItem icon={<Building2 size={20} />} text="Agences" to="/dashboard/agences" />
            
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">Localisation</p>
            <SidebarItem icon={<MapPin size={20} />} text="Villes" to="/dashboard/villes" />
            <SidebarItem icon={<Map size={20} />} text="Quartiers" to="/dashboard/quartiers" />
            
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">Administration</p>
            <SidebarItem icon={<Users size={20} />} text="Utilisateurs" to="/dashboard/utilisateurs" />
            <SidebarItem icon={<Settings size={20} />} text="Paramètres" to="/dashboard/settings" />
          </nav>
        </div>

        {/* Bouton Déconnexion */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-bold text-sm"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarDashboard;