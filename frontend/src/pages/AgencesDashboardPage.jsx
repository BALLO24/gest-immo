import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Edit2, Trash2, Eye,
  ChevronLeft, ChevronRight, Store, User, Phone, Mail
} from "lucide-react";

import ItemsParPageOptions from "../components/ui/ItemsParPage";
import AddAgenceModal from "../components/admin/AddAgenceModal";
import ToastSuccess from "../components/ui/ToastSuccess";
import ToastError from "../components/ui/ToastError";
import ConfirmSuppression from "../components/ui/ConfirmSuppression";
import UpdateAgenceModal from "../components/admin/UpdateAgenceModal";
import DetailsModalAgence from "../components/admin/DetailsModalAgence";
import API from "../api/API";

const STATUT_BADGE = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-amber-50 text-amber-700",
  suspendue: "bg-red-50 text-red-700",
};
const STATUT_LABEL = { active: "Active", inactive: "En attente", suspendue: "Suspendue" };

export default function AgencesDashboardPage() {
  const [searchParams] = useSearchParams();
  const [agences, setAgences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFiltre, setStatutFiltre] = useState(searchParams.get("statut") || "tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [isOpenForm, setOpenForm] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [selectedAgence, setSelectedAgence] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchAgences = async () => {
    try {
      const response = await API.getAllAgences();
      setAgences(response || []);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  useEffect(() => { fetchAgences(); }, []);

  const filteredData = useMemo(() => {
    return agences.filter((a) => {
      const matchStatut = statutFiltre === "tous" || a.statut === statutFiltre;
      const matchSearch = [a.nom_agence, a.nom_proprietaire, a.email]
        .some(val => val?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchStatut && matchSearch;
    });
  }, [searchTerm, statutFiltre, agences]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;
    try {
      setIsDeleting(true);
      await API.deleteAgence(idToDelete);
      await fetchAgences();
      setShowModalConfirm(false);
      triggerToast("Agence supprimée avec succès");
    } catch (err) {
      triggerToast("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetails = (item) => { setSelectedAgence(item); setShowDetailsModal(true); setOpenDropdownId(null); };
  const openEdit = (item) => { setShowUpdateModal(true); setIdToDelete(item._id); setOpenDropdownId(null); };
  const openDelete = (item) => { setIdToDelete(item._id); setShowModalConfirm(true); setOpenDropdownId(null); };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {toast.show && (toast.type === "success" ? <ToastSuccess message={toast.message} /> : <ToastError message={toast.message} />)}

      <ConfirmSuppression
        isOpen={showModalConfirm}
        onClose={() => setShowModalConfirm(false)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
      <UpdateAgenceModal
        isOpen={showUpdateModal}
        agenceData={agences.find(a => a._id === idToDelete)}
        onClose={() => setShowUpdateModal(false)}
        onSuccess={(msg) => { setShowUpdateModal(false); fetchAgences(); triggerToast(msg); }}
        onError={(msg) => triggerToast(msg, "error")}
      />
      <AddAgenceModal
        isOpen={isOpenForm}
        onClose={() => setOpenForm(false)}
        onSuccess={(msg) => { setOpenForm(false); fetchAgences(); triggerToast(msg); }}
        onError={(msg) => triggerToast(msg, "error")}
      />
      <DetailsModalAgence
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        agence={selectedAgence}
      />

      {/* EN-TÊTE — allégé */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Store size={20} className="text-orange-600" /> Agences
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestion des partenaires immobiliers</p>
        </div>

        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-95"
        >
          <Plus size={18} /> Enregistrer une agence
        </button>
      </div>

      {/* FILTRE RAPIDE PAR STATUT */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { value: "tous", label: "Toutes" },
          { value: "active", label: "Actives" },
          { value: "inactive", label: "En attente" },
          { value: "suspendue", label: "Suspendues" },
        ].map((s) => {
          const count = s.value === "tous" ? agences.length : agences.filter((a) => a.statut === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => { setStatutFiltre(s.value); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statutFiltre === s.value ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {s.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statutFiltre === s.value ? "bg-white/20" : "bg-slate-100"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* RECHERCHE & OPTIONS */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher une agence, email ou nom..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-orange-300 focus:ring-1 focus:ring-orange-300 rounded-lg transition-colors outline-none text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <ItemsParPageOptions
          value={itemsPerPage}
          onChange={(val) => { setItemPerPage(val); setCurrentPage(1); }}
          options={[5, 10, 20]}
        />
      </div>

      {/* AJOUT : cartes sur mobile */}
      <div className="md:hidden space-y-2 mb-4">
        {currentItems.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-10">Aucune agence trouvée.</p>
        ) : (
          currentItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{item.nom_agence}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <User size={11} /> {item.nom_proprietaire} {item.prenom_proprietaire}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_BADGE[item.statut]}`}>
                  {STATUT_LABEL[item.statut]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><Phone size={11} /> {item.numero_telephone}</span>
                {item.email && <span className="flex items-center gap-1 truncate"><Mail size={11} /> {item.email}</span>}
              </div>
              <div className="flex gap-4 pt-2 border-t border-slate-50">
                <button onClick={() => openDetails(item)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Eye size={13} /> Fiche
                </button>
                <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Edit2 size={13} /> Éditer
                </button>
                <button onClick={() => openDelete(item)} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 ml-auto">
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABLEAU — allégé, visible à partir de md */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Agence</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Propriétaire</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{item.nom_agence}</span>
                      <span className="text-[11px] text-slate-400">ID: {item._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <User size={13} className="text-slate-300" />
                      {item.nom_proprietaire} {item.prenom_proprietaire}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} /> {item.numero_telephone}
                      </div>
                      {item.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail size={11} /> {item.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUT_BADGE[item.statut]}`}>
                      {STATUT_LABEL[item.statut]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === item._id ? null : item._id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openDropdownId === item._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                        <div className="absolute right-5 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                          <button onClick={() => openDetails(item)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Eye size={15} /> Fiche complète
                          </button>
                          <button onClick={() => openEdit(item)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Edit2 size={15} /> Éditer
                          </button>
                          <hr className="my-1 border-slate-50" />
                          <button onClick={() => openDelete(item)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} /> Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-sm">Aucune agence trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Total : {filteredData.length} agence{filteredData.length > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500 hover:border-orange-300 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-semibold text-slate-600 mx-1">Page {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500 hover:border-orange-300 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination mobile */}
      <div className="md:hidden flex items-center justify-between gap-3 mt-2">
        <p className="text-xs text-slate-400">Page {currentPage} / {totalPages}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
