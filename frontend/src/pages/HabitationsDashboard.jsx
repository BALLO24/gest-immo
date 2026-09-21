import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Home, Building2, Map as MapIcon,
  Store, LayoutGrid, Info, Trash2, RotateCcw, Flame, ImageOff, Loader2,
  ChevronLeft, ChevronRight,
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

// CORRIGÉ : "http://localhost:5000" codé en dur — le backend renvoie déjà des
// URLs d'images complètes depuis longtemps, cette conversion ne servait plus
// à rien et aurait cassé en production si jamais empruntée.
function formatImages(data) {
  return data.map((item) => ({
    ...item,
    images: item.images?.filter(Boolean) || [],
  }));
}

const TYPE_LABELS = { maison: "Maison", appartement: "Appartement", magasin: "Magasin", terrain: "Terrain" };
const CARDS_PAR_PAGE = 9; // AJOUT : grille 3x3, évite d'afficher jusqu'à 200 cartes d'un coup

export default function HabitationsDashboard() {
  const [activeTab, setActiveTab] = useState("biens");

  // --- Tous les biens ---
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("tous");
  const [selectedAgence, setSelectedAgence] = useState("tous");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // AJOUT
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [habitations, setHabitations] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // --- Corbeille (toutes agences) ---
  const [corbeille, setCorbeille] = useState([]);
  const [pageCorbeille, setPageCorbeille] = useState(1); // AJOUT
  const [loadingCorbeille, setLoadingCorbeille] = useState(false);
  const [corbeilleChargee, setCorbeilleChargee] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchHabitations = useCallback(async () => {
    try {
      setLoading(true);
      // AJOUT : filtre agence + statut, absents avant (juste type + texte).
      const filtre = {
        limit: 200, // AJOUT : pas de limite avant — un vrai risque avec des dizaines/centaines de biens
        ...(selectedType !== "Tous" && { type: selectedType.toLowerCase() }),
        ...(selectedStatut !== "tous" && { statut: selectedStatut }),
        ...(selectedAgence !== "tous" && { agence: selectedAgence }),
      };
      const data = await API.getHabitations(filtre);
      setHabitations(formatImages(data));
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatut, selectedAgence]);

  const fetchCorbeille = useCallback(async () => {
    setLoadingCorbeille(true);
    const data = await API.getCorbeilleAdmin();
    setCorbeille(formatImages(data));
    setLoadingCorbeille(false);
    setCorbeilleChargee(true);
  }, []);

  useEffect(() => {
    fetchHabitations();
  }, [fetchHabitations]);

  useEffect(() => {
    API.getAllAgences().then(setAgences);
  }, []);

  useEffect(() => {
    if (activeTab === "corbeille" && !corbeilleChargee) fetchCorbeille();
  }, [activeTab, corbeilleChargee, fetchCorbeille]);

  const handleUpdateHabitation = (updatedItem) => {
    if (updatedItem.isDeleted) {
      setHabitations((prev) => prev.filter((h) => h._id !== updatedItem._id));
      setMessageToast("Bien archivé avec succès");
      setCorbeilleChargee(false); // AJOUT : force le rechargement de la corbeille au prochain passage sur l'onglet
    } else {
      setHabitations((prev) => prev.map((h) => (h._id === updatedItem._id ? { ...h, ...updatedItem } : h)));
      setMessageToast("Mise à jour réussie");
    }
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleRestore = async (id) => {
    setActionId(id);
    const result = await API.restaurerPropriete(id);
    setActionId(null);
    if (result) {
      setCorbeille((prev) => prev.filter((item) => item._id !== id));
      fetchHabitations();
      setMessageToast("Bien restauré avec succès !");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  // AJOUT : purgerPropriete existait côté backend depuis longtemps (admin
  // only), jamais relié à la moindre interface — voilà pourquoi.
  const handlePurge = async (id) => {
    if (!window.confirm("Supprimer DÉFINITIVEMENT ce bien ? Cette action est irréversible (photos comprises).")) return;
    setActionId(id);
    const result = await API.purgerPropriete(id);
    setActionId(null);
    if (result) {
      setCorbeille((prev) => prev.filter((item) => item._id !== id));
      setMessageToast("Bien supprimé définitivement.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const habitationsFiltrees = useMemo(() => {
    return habitations.filter((h) => {
      const q = search.toLowerCase();
      return (
        !q ||
        h.quartier?.nom?.toLowerCase().includes(q) ||
        h.quartier?.ville?.nom?.toLowerCase().includes(q) ||
        h.agence?.nom_agence?.toLowerCase().includes(q)
      );
    });
  }, [habitations, search]);

  // AJOUT : pagination côté client — les données sont déjà toutes chargées
  // (limit: 200), on découpe juste l'affichage en pages de 9 cartes.
  useEffect(() => { setPage(1); }, [search, selectedType, selectedStatut, selectedAgence]);
  const totalPagesBiens = Math.max(1, Math.ceil(habitationsFiltrees.length / CARDS_PAR_PAGE));
  const habitationsPage = habitationsFiltrees.slice((page - 1) * CARDS_PAR_PAGE, page * CARDS_PAR_PAGE);

  useEffect(() => { setPageCorbeille(1); }, [activeTab]);
  const totalPagesCorbeille = Math.max(1, Math.ceil(corbeille.length / CARDS_PAR_PAGE));
  const corbeillePage = corbeille.slice((pageCorbeille - 1) * CARDS_PAR_PAGE, pageCorbeille * CARDS_PAR_PAGE);

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

      {activeModal === "Maison" && <AddHouseModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Appartement" && <AddAppartementModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Magasin" && <AddMagasinModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}
      {activeModal === "Terrain" && <AddTerrainModal isOpen onClose={() => setActiveModal(null)} onSuccess={handleSuccess} />}

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="ml-14 md:ml-0 transition-all duration-300">
            <h1 className="text-2xl font-bold text-slate-900">
              Tableau de bord <span className="text-orange-600">Immo</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Info size={16} className="text-orange-400 shrink-0" />
              Vue d'ensemble de tous les biens, toutes agences confondues.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl shadow-sm transition-colors font-semibold text-sm"
            >
              <Plus size={24} />
              Publier un bien
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-60 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
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

        {/* AJOUT : onglets Tous les biens / Corbeille */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {[
            { id: "biens", label: "Tous les biens", icon: LayoutGrid },
            { id: "corbeille", label: "Corbeille", icon: Trash2, count: corbeilleChargee ? corbeille.length : null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
              {tab.count !== null && tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "biens" && (
          <>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-12 space-y-5">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                  <input
                    type="text"
                    placeholder="Ville, quartier, agence..."
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
                        selectedType === t.name ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                      }`}
                    >
                      {t.icon}
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AJOUT : filtres agence + statut, absents auparavant */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <select
                  value={selectedAgence}
                  onChange={(e) => setSelectedAgence(e.target.value)}
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="tous">Toutes les agences</option>
                  {agences.map((a) => (
                    <option key={a._id} value={a._id}>{a.nom_agence}</option>
                  ))}
                </select>
                <select
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="disponible">Disponible</option>
                  <option value="reserve">Réservé</option>
                  <option value="nonDisponible">Non disponible</option>
                </select>
              </div>
            </div>

            <section className="relative">
              <div className="px-2 mb-8 flex justify-between items-end">
                <h2 className="text-lg font-bold text-slate-800">
                  Résultats <span className="text-slate-400 font-medium text-lg ml-2">({habitationsFiltrees.length})</span>
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="w-full h-96 bg-gray-200 animate-pulse rounded-2xl"></div>)}
                </div>
              ) : habitationsFiltrees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Aucun bien ne correspond</h3>
                  <p className="text-slate-500 mt-2">Essayez d'élargir votre recherche.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {habitationsPage.map((habitation) => (
                      <div key={habitation._id} className="w-full flex justify-center">
                        {habitation.__t === 'maison' && <MaisonCard maison={habitation} onUpdate={handleUpdateHabitation} />}
                        {habitation.__t === 'appartement' && <AppartementCard appartement={habitation} onUpdate={handleUpdateHabitation} />}
                        {habitation.__t === 'magasin' && <MagasinCard magasin={habitation} onUpdate={handleUpdateHabitation} />}
                        {habitation.__t === 'terrain' && <TerrainCard terrain={habitation} onUpdate={handleUpdateHabitation} />}
                      </div>
                    ))}
                  </div>
                  <PaginationBar page={page} totalPages={totalPagesBiens} onChange={setPage} />
                </>
              )}
            </section>
          </>
        )}

        {/* AJOUT : corbeille admin — toutes agences confondues, avec purge définitive */}
        {activeTab === "corbeille" && (
          <section>
            <p className="text-sm text-slate-500 mb-6">
              Biens archivés par les agences, toutes confondues. Vous pouvez les restaurer, ou les supprimer définitivement (irréversible).
            </p>

            {loadingCorbeille ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => <div key={n} className="w-full h-40 bg-gray-200 animate-pulse rounded-2xl" />)}
              </div>
            ) : corbeille.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Trash2 size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Corbeille vide</h3>
                <p className="text-slate-500">Aucun bien archivé pour l'instant.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {corbeillePage.map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex">
                      <div className="w-28 h-28 shrink-0 bg-slate-100 flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" className="w-full h-full object-cover grayscale" />
                        ) : (
                          <ImageOff className="text-slate-300" size={24} />
                        )}
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{TYPE_LABELS[item.__t] || item.__t}</span>
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.quartier?.nom}, {item.quartier?.ville?.nom}</p>
                          <p className="text-xs text-slate-400 truncate">{item.agence?.nom_agence}</p>
                          <p className="text-sm text-slate-500">{item.prix?.toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => handleRestore(item._id)}
                            disabled={actionId === item._id}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                          >
                            {actionId === item._id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Restaurer
                          </button>
                          <button
                            onClick={() => handlePurge(item._id)}
                            disabled={actionId === item._id}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} /> Purger
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationBar page={pageCorbeille} totalPages={totalPagesCorbeille} onChange={setPageCorbeille} />
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// AJOUT : barre Précédent/Suivant réutilisée pour les deux onglets — les 200
// biens potentiellement chargés d'un coup s'affichaient tous en même temps
// dans la grille, sans aucun découpage.
function PaginationBar({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-orange-300 transition-colors"
      >
        <ChevronLeft size={16} /> Précédent
      </button>
      <span className="text-sm text-slate-400 font-medium">Page {page} / {totalPages}</span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-orange-300 transition-colors"
      >
        Suivant <ChevronRight size={16} />
      </button>
    </div>
  );
}
