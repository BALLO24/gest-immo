import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { 
  Search, Plus, Home, Building2, Map as MapIcon, 
  Store, LayoutGrid, LogOut, UserCircle, Trash2, RotateCcw,
  Loader2, ImageOff, CalendarClock,
} from "lucide-react";

// Components & API
import AddHouseModal from "../components/propriete/AddHouseModal";
import AddAppartementModal from "../components/propriete/AddAppartementModal";
import AddMagasinModal from "../components/propriete/AddMagasinModal";
import AddTerrainModal from "../components/propriete/AddTerrainModal";
import ToastSuccess from "../components/ui/ToastSuccess";
import MaisonCard from "../components/cards/MaisonCard";
import AppartementCard from "../components/cards/AppartementCard";
import MagasinCard from "../components/cards/MagasinCard";
import TerrainCard from "../components/cards/TerrainCard";
import API from "../api/API";

const BASE_URL = "https://gest-immo-three.vercel.app/"; 

const TYPE_LABELS = { maison: "Maison", appartement: "Appartement", magasin: "Magasin", terrain: "Terrain" };

function formatImages(data) {
  return data.map(item => ({
    ...item,
    images: item.images?.map(img => 
      img.startsWith('http') ? img : `${BASE_URL}/${img}`
    ) || []
  }));
}

export default function HabitationsAgence() {
  const navigate = useNavigate();

  // AJOUT : deuxième onglet pour la corbeille (restauration des biens
  // archivés). La gestion d'équipe envisagée un temps a été retirée : on
  // reste sur un seul compte de connexion par agence.
  const [activeTab, setActiveTab] = useState("annonces");

  // --- Annonces ---
  const [selectedType, setSelectedType] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [habitations, setHabitations] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Corbeille ---
  const [corbeille, setCorbeille] = useState([]);
  const [loadingCorbeille, setLoadingCorbeille] = useState(false);
  const [corbeilleChargee, setCorbeilleChargee] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const token = localStorage.getItem("authToken");
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded ? decoded.role : null;
  const agenceId = role === "agence" ? decoded.agenceId : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const fetchHabitations = useCallback(async () => {
    try {
      setLoading(true);
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) return navigate("/login");
      const decodedToken = jwtDecode(currentToken);
      const data = await API.getHabitationsByAgence(decodedToken.agenceId);
      setHabitations(formatImages(data));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchHabitations();
  }, [fetchHabitations]);

  // AJOUT : chargement paresseux — la corbeille n'est récupérée que la
  // première fois que l'onglet est ouvert.
  const fetchCorbeille = useCallback(async () => {
    setLoadingCorbeille(true);
    try {
      const data = await API.getHabitationsByAgence(agenceId, { includeDeleted: true });
      const archives = formatImages(data).filter((item) => item.deletedAt);
      setCorbeille(archives);
    } catch (error) {
      console.error('Erreur chargement corbeille:', error);
    } finally {
      setLoadingCorbeille(false);
      setCorbeilleChargee(true);
    }
  }, [agenceId]);

  useEffect(() => {
    if (activeTab === "corbeille" && !corbeilleChargee) fetchCorbeille();
  }, [activeTab, corbeilleChargee, fetchCorbeille]);

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

  // AJOUT : restaurer un bien archivé — endpoint backend existant
  // (restaurerPropriete), jamais exposé nulle part côté interface avant.
  const handleRestore = async (id) => {
    setRestoringId(id);
    const result = await API.restaurerPropriete(id);
    setRestoringId(null);
    if (result) {
      setCorbeille((prev) => prev.filter((item) => item._id !== id));
      fetchHabitations(); // le bien restauré doit réapparaître dans "Mes annonces"
      setMessageToast("Bien restauré avec succès !");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const types = [
    { name: "Tous", icon: <LayoutGrid size={16} /> },
    { name: "Maison", icon: <Home size={16} /> },
    { name: "Appartement", icon: <Building2 size={16} /> },
    { name: "Magasin", icon: <Store size={16} /> },
    { name: "Terrain", icon: <MapIcon size={16} /> },
  ];

  const tabs = [
    { id: "annonces", label: "Mes annonces", icon: LayoutGrid, count: habitations.length },
    { id: "corbeille", label: "Corbeille", icon: Trash2, count: corbeilleChargee ? corbeille.length : null },
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
                <div className="absolute left-0 md:left-auto md:right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
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
              onClick={() => navigate("/agence/demandes-visite")}
              className="flex items-center gap-2 bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 px-5 py-2.5 rounded-xl border border-gray-200 transition-all font-semibold"
              title="Demandes de visite"
            >
              <CalendarClock size={20} />
              <span className="hidden sm:inline">Visites</span>
            </button>

            <button
              onClick={() => navigate("/agence/profil")}
              className="flex items-center gap-2 bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 px-5 py-2.5 rounded-xl border border-gray-200 transition-all font-semibold"
              title="Mon profil"
            >
              <UserCircle size={20} />
              <span className="hidden sm:inline">Mon profil</span>
            </button>

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

        {/* Navigation par onglets */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-maliOrange text-maliOrange"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============ ONGLET : MES ANNONCES ============ */}
        {activeTab === "annonces" && (
          <>
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

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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

            <section className="min-h-[400px]">
              <div className="px-2 mb-8 flex justify-between items-end">
                <h2 className="text-lg font-bold text-slate-800">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                  {habitationsFiltrees.map((habitation) => (
                    <div key={habitation._id} className="w-full flex justify-center">
                      {habitation.__t === 'maison' && <MaisonCard maison={habitation} onUpdate={fetchHabitations} />}
                      {habitation.__t === 'appartement' && <AppartementCard appartement={habitation} onUpdate={fetchHabitations} />}
                      {habitation.__t === 'magasin' && <MagasinCard magasin={habitation} onUpdate={fetchHabitations} />}
                      {habitation.__t === 'terrain' && <TerrainCard terrain={habitation} onUpdate={fetchHabitations} />}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ============ ONGLET : CORBEILLE ============ */}
        {activeTab === "corbeille" && (
          <section>
            <p className="text-sm text-gray-500 mb-6">
              Les biens supprimés restent ici avant d'être définitivement effacés. Vous pouvez les restaurer à tout moment.
            </p>

            {loadingCorbeille ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => <div key={n} className="w-full h-40 bg-gray-200 animate-pulse rounded-2xl" />)}
              </div>
            ) : corbeille.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <Trash2 size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">Corbeille vide</h3>
                <p className="text-gray-500">Les biens que vous supprimez apparaîtront ici.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {corbeille.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                    <div className="w-28 h-28 shrink-0 bg-gray-100 flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover grayscale" />
                      ) : (
                        <ImageOff className="text-gray-300" size={24} />
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{TYPE_LABELS[item.__t] || item.__t}</span>
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.quartier?.nom}, {item.quartier?.ville?.nom}</p>
                        <p className="text-sm text-gray-500">{item.prix?.toLocaleString()} FCFA</p>
                      </div>
                      <button
                        onClick={() => handleRestore(item._id)}
                        disabled={restoringId === item._id}
                        className="mt-2 self-start flex items-center gap-1.5 text-xs font-bold text-maliGreen hover:text-green-700 disabled:opacity-50"
                      >
                        {restoringId === item._id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        Restaurer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
