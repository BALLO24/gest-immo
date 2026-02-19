import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { 
  Search, Plus, Home, Building2, Map as MapIcon, 
  Store, LayoutGrid, LogOut 
} from "lucide-react";

// Components & API
import AddHouseModal from "../components/AddHouseModal";
import AddAppartementModal from "../components/AddAppartementModal";
import AddMagasinModal from "../components/AddMagasinModal";
import AddTerrainModal from "../components/AddTerrainModal";
import ToastSuccess from "../components/ToastSuccess";
import MaisonCard from "../components/cards/MaisonCard";
import AppartementCard from "../components/cards/AppartementCard";
import MagasinCard from "../components/cards/MagasinCard";
import TerrainCard from "../components/cards/TerrainCard";
import API from "../api/API";

// URL de base pour les images (à adapter selon ton backend)
const BASE_URL = "http://localhost:5000"; 

export default function HabitationsAgence() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [habitations, setHabitations] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const fetchHabitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return navigate("/login");
      
      const decodedToken = jwtDecode(token);
      const data = await API.getHabitationsByAgence(decodedToken.agenceId);

      // Traitement des images pour s'assurer qu'elles s'affichent correctement
      const formattedData = data.map(item => ({
        ...item,
        images: item.images?.map(img => 
          img.startsWith('http') ? img : `${BASE_URL}/${img}`
        ) || []
      }));

      setHabitations(formattedData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("authToken");
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded ? decoded.role : null;
  const agenceId = role === "agence" ? decoded.agenceId : null;

  useEffect(() => {
    fetchHabitations();
  }, []);

  const habitationsFiltrees = useMemo(() => {
    return habitations.filter((h) => {
      const typeStr = h.__t?.toLowerCase() || "";
      const matchType = selectedType === "Tous" || typeStr === selectedType.toLowerCase();
      const matchSearch = h.titre?.toLowerCase().includes(search.toLowerCase()) || 
                          h.quartier?.nom?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [habitations, selectedType, search]);

  const handleSuccess = (message) => {
    setActiveModal(null);
    fetchHabitations();
    setMessageToast(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const types = [
    { name: "Tous", icon: <LayoutGrid size={16} /> },
    { name: "Maison", icon: <Home size={16} /> },
    { name: "Appartement", icon: <Building2 size={16} /> },
    { name: "Magasin", icon: <Store size={16} /> },
    { name: "Terrain", icon: <MapIcon size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {showSuccessToast && <ToastSuccess message={messageToast} />}

      {/* Modals */}
      {activeModal === "Maison" && <AddHouseModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} agenceId={agenceId}/>}
      {activeModal === "Appartement" && <AddAppartementModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} agenceId={agenceId}/>}
      {activeModal === "Magasin" && <AddMagasinModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} agenceId={agenceId}/>}
      {activeModal === "Terrain" && <AddTerrainModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} agenceId={agenceId}/>}

      <main className="w-full max-w-full mx-auto p-4 md:p-8">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tableau de bord</h1>
            <p className="text-gray-500 font-medium">Gestion de votre parc immobilier</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all font-semibold"
              >
                <Plus size={20} />
                <span>Ajouter</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                  {types.slice(1).map((t) => (
                    <button
                      key={t.name}
                      onClick={() => { setActiveModal(t.name); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-none"
                    >
                      <span className="text-orange-500">{t.icon}</span>
                      <span className="font-medium text-sm">{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 px-5 py-2.5 rounded-xl border border-gray-200 transition-all font-semibold"
              title="Se déconnecter"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>

        {/* RECHERCHE & FILTRES */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre ou quartier..."
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 transition-all outline-none text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedType(t.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedType === t.name
                    ? "bg-orange-100 text-orange-700 shadow-sm"
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {t.icon}
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* LISTE DES BIENS */}
        <section className="min-h-[400px]">
          <div className="px-2 mb-8 flex justify-between items-end">
            <h2 className="text-2xl font-black text-slate-800">
              Résultats <span className="text-slate-400 font-medium text-lg ml-2">({habitationsFiltrees.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-full h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : habitationsFiltrees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Search size={48} className="text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">Aucun résultat</h3>
              <p className="text-gray-500">Essayez d'ajuster vos critères de recherche.</p>
            </div>
          ) : (
            /* Grille optimisée : centrée sur mobile, colonnes sur desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {habitationsFiltrees.map((habitation) => (
                <div key={habitation._id} className="w-full flex justify-center">
                  {habitation.__t === 'maison' && <MaisonCard maison={habitation} />}
                  {habitation.__t === 'appartement' && <AppartementCard appartement={habitation} />}
                  {habitation.__t === 'magasin' && <MagasinCard magasin={habitation} />}
                  {habitation.__t === 'terrain' && <TerrainCard terrain={habitation} />}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}