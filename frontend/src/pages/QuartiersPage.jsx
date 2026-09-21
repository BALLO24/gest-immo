import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, MoreVertical, Edit2, Trash2,
  Eye, ChevronLeft, ChevronRight, MapPin, Building
} from "lucide-react";

import ItemsParPageOptions from "../components/ui/ItemsParPage";
import AddQuartierModal from "../components/admin/AddQuartierModal";
import ToastSuccess from "../components/ui/ToastSuccess";
import ToastError from "../components/ui/ToastError";
import ConfirmSuppression from "../components/ui/ConfirmSuppression";
import API from "../api/API";

export default function QuartiersPage() {
  const [quartiers, setQuartiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [isOpenForm, setOpenForm] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchQuartiers = async () => {
    try {
      const response = await API.getQuartiers();
      setQuartiers(response || []);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  useEffect(() => { fetchQuartiers(); }, []);

  const filteredData = useMemo(() => {
    return quartiers.filter((q) =>
      q.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.ville?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, quartiers]);

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
      await API.deleteQuartier(idToDelete);
      await fetchQuartiers();
      setShowModalConfirm(false);
      triggerToast("Quartier supprimé avec succès");
    } catch (err) {
      triggerToast("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {toast.show && (toast.type === "success" ? <ToastSuccess message={toast.message} /> : <ToastError message={toast.message} />)}

      <ConfirmSuppression
        isOpen={showModalConfirm}
        onClose={() => setShowModalConfirm(false)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      <AddQuartierModal
        isOpen={isOpenForm}
        close={() => setOpenForm(false)}
        onSuccess={(msg) => { setOpenForm(false); fetchQuartiers(); triggerToast(msg); }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={20} className="text-orange-600" /> Quartiers
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Répertoire des zones géographiques</p>
        </div>

        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-95"
        >
          <Plus size={18} /> Ajouter un quartier
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un quartier ou une ville..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-orange-300 focus:ring-1 focus:ring-orange-300 rounded-lg transition-colors outline-none text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <ItemsParPageOptions
          value={itemsPerPage}
          onChange={(val) => { setItemPerPage(val); setCurrentPage(1); }}
          options={[10, 20, 50]}
        />
      </div>

      {/* AJOUT : cartes empilées sur mobile */}
      <div className="md:hidden space-y-2 mb-4">
        {currentItems.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-10">Aucun quartier trouvé.</p>
        ) : (
          currentItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{item.nom}</p>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">
                  <Building size={11} /> {item.ville?.nom || "Non définie"}
                </div>
              </div>
              <RowActions onDelete={() => { setIdToDelete(item._id); setShowModalConfirm(true); }} />
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Quartier</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Ville</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-5 py-3 text-sm text-slate-400">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                      {item.nom}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">
                      <Building size={12} /> {item.ville?.nom || "Non définie"}
                    </div>
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
                        <DropdownMenu onDelete={() => { setIdToDelete(item._id); setShowModalConfirm(true); setOpenDropdownId(null); }} />
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-slate-400 text-sm">
                    Aucun quartier trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={setCurrentPage}
          label={`${currentItems.length} sur ${filteredData.length} quartiers`}
        />
      </div>

      <div className="md:hidden">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={setCurrentPage}
          label={`${currentItems.length} sur ${filteredData.length}`}
        />
      </div>
    </div>
  );
}

function DropdownMenu({ onDelete }) {
  return (
    <div className="absolute right-5 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1.5 animate-in fade-in zoom-in-95 duration-100">
      <button disabled title="Fonctionnalité à venir" className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 cursor-not-allowed">
        <Eye size={15} /> Détails
      </button>
      <button disabled title="Fonctionnalité à venir" className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 cursor-not-allowed">
        <Edit2 size={15} /> Modifier
      </button>
      <hr className="my-1 border-slate-50" />
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 size={15} /> Supprimer
      </button>
    </div>
  );
}

function RowActions({ onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen((o) => !o)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}></div>
          <DropdownMenu onDelete={() => { setOpen(false); onDelete(); }} />
        </>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange, label }) {
  return (
    <div className="px-1 md:px-5 py-3 md:bg-slate-50 md:border-t md:border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 md:mt-0">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500 hover:border-orange-300 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === i + 1 ? "bg-orange-600 text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-500 hover:border-orange-300 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
