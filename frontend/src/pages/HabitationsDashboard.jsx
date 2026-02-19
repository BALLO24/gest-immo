import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Plus, Home, Building2, Map as MapIcon, 
  Store, LayoutGrid, Info 
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

const BASE_URL = "http://localhost:5000"; 

export default function HabitationsDashboard() {
  const [selectedType, setSelectedType] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const fetchHabitations = async (filtre = {}) => {
    try {
      setLoading(true);
      const data = await API.getHabitations(filtre);
      
      const formattedData = data.map(item => ({
        ...item,
        images: item.images?.map(img => 
          img.startsWith('http') ? img : `${BASE_URL}/${img}`
        ) || []
      }));

      setHabitations(formattedData);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitations();
  }, []);

  // CETTE FONCTION GÈRE MAINTENANT LA MISE À JOUR ET LA SUPPRESSION
  const handleUpdateHabitation = (updatedItem) => {
    // 1. CAS SUPPRESSION : Si l'objet contient le flag isDeleted
    if (updatedItem.isDeleted) {
      setHabitations((prev) => prev.filter((h) => h._id !== updatedItem._id));
      setMessageToast("Bien supprimé avec succès");
    } 
    // 2. CAS MISE À JOUR : Logique classique
    else {
      const formattedItem = {
        ...updatedItem,
        images: updatedItem.images?.map(img => {
          if (!img) return "";
          if (img.startsWith('http')) return img;
          // Si c'est un nouvel upload ou un chemin relatif
          return img.includes('drive.google.com') ? img : `${BASE_URL}/${img}`;
        }) || []
      };

      setHabitations((prevHabitations) =>
        prevHabitations.map((h) => 
          h._id === formattedItem._id ? formattedItem : h
        )
      );
      setMessageToast("Mise à jour réussie");
    }

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const habitationsFiltrees = useMemo(() => {
    return habitations.filter((h) => {
      const typeStr = h.__t?.toLowerCase() || "";
      const matchType = selectedType === "Tous" || typeStr === selectedType.toLowerCase();
      const matchSearch = 
        h.titre?.toLowerCase().includes(search.toLowerCase()) || 
        h.quartier?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        h.quartier?.ville?.nom?.toLowerCase().includes(search.toLowerCase());
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {showSuccessToast && <ToastSuccess message={messageToast} onClose={() => setShowSuccessToast(false)} />}

      {/* Modals Dynamiques */}
      {activeModal === "Maison" && <AddHouseModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Appartement" && <AddAppartementModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Magasin" && <AddMagasinModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Terrain" && <AddTerrainModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="ml-14 md:ml-0 transition-all duration-300">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Tableau de bord <span className="text-orange-600">Immo</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Info size={16} className="text-orange-400 shrink-0" />
              Vue d'ensemble de tous les biens disponibles.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all transform hover:-translate-y-1 font-bold"
            >
              <Plus size={24} />
              Publier un bien
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-60 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                {types.slice(1).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => { setActiveModal(t.name); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors border-b border-slate-50 last:border-none group"
                  >
                    <span className="p-2 bg-slate-50 rounded-lg text-orange-500 group-hover:bg-orange-100">{t.icon}</span>
                    <span className="font-bold text-sm">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEARCH & FILTERS BOX */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-12">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
              <input
                type="text"
                placeholder="Ville, quartier, titre du bien..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 transition-all outline-none text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {types.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedType(t.name)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedType === t.name
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {t.icon}
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <section className="relative">
          <div className="px-2 mb-8 flex justify-between items-end">
            <h2 className="text-2xl font-black text-slate-800">
              Résultats <span className="text-slate-400 font-medium text-lg ml-2">({habitationsFiltrees.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="w-full h-96 bg-gray-200 animate-pulse rounded-[2.5rem]"></div>
              ))}
            </div>
          ) : habitationsFiltrees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Aucun bien ne correspond</h3>
              <p className="text-slate-500 mt-2">Essayez d'élargir votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {habitationsFiltrees.map((habitation) => (
                <div key={habitation._id} className="w-full flex justify-center">
                  {habitation.__t === 'maison' && <MaisonCard maison={habitation} onUpdate={handleUpdateHabitation}/>}
                  {habitation.__t === 'appartement' && <AppartementCard appartement={habitation} onUpdate={handleUpdateHabitation}/>}
                  {habitation.__t === 'magasin' && <MagasinCard magasin={habitation} onUpdate={handleUpdateHabitation}/>}
                  {habitation.__t === 'terrain' && <TerrainCard terrain={habitation} onUpdate={handleUpdateHabitation}/>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}