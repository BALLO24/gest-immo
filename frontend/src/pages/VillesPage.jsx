import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, Search, MoreVertical, Edit2, Trash2, 
  Eye, ChevronLeft, ChevronRight, Building2, Map 
} from "lucide-react";

// Components & API
import ItemsParPageOptions from "../components/ItemsParPage";
import AddVille from "../components/AddVille";
import ToastSuccess from "../components/ToastSuccess";
import ToastError from "../components/ToastError";
import ConfirmSuppression from "../components/ConfirmSuppression";
import API from "../api/API";

export default function VillesPage() {
  const navigate = useNavigate();
  const [villes, setVilles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Modals & Toasts
  const [isOpenForm, setOpenForm] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchVilles = async () => {
    try {
      const response = await API.getVilles();
      setVilles(response || []);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  useEffect(() => { fetchVilles(); }, []);

  // Filtrage intelligent optimisé
  const filteredData = useMemo(() => {
    return villes.filter((v) => 
      v.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, villes]);

  // Pagination
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
      await API.deleteVille(idToDelete);
      await fetchVilles();
      setShowModalConfirm(false);
      triggerToast("Ville supprimée avec succès");
    } catch (err) {
      triggerToast("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Notifications */}
      {toast.show && (toast.type === "success" ? <ToastSuccess message={toast.message} /> : <ToastError message={toast.message} />)}
      
      <ConfirmSuppression 
        isOpen={showModalConfirm} 
        onClose={() => setShowModalConfirm(false)} 
        isDeleting={isDeleting} 
        onConfirm={handleConfirmDelete} 
      />

      <AddVille 
        isOpen={isOpenForm} 
        close={() => setOpenForm(false)} 
        onSuccess={(msg) => { setOpenForm(false); fetchVilles(); triggerToast(msg); }} 
        onError={(msg) => triggerToast(msg, "error")}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="text-orange-600" /> Gestion des Villes
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">Administration des centres urbains</p>
        </div>

        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Nouvelle Ville
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une ville..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 rounded-xl transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-4">
          <ItemsParPageOptions
            value={itemsPerPage}
            onChange={(val) => { setItemPerPage(val); setCurrentPage(1); }}
            options={[5, 10, 20, 50]}
          />
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Index</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nom de la Ville</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-400">
                    #{(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                        <Map size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                        {item.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === item._id ? null : item._id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openDropdownId === item._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                        <div className="absolute right-6 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Eye size={16} /> Détails
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Edit2 size={16} /> Modifier
                          </button>
                          <hr className="my-1 border-slate-50" />
                          <button 
                            onClick={() => { setIdToDelete(item._id); setShowModalConfirm(true); setOpenDropdownId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} /> Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">
                    Aucune ville trouvée...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500">
            Affichage <span className="text-slate-900">{currentItems.length}</span> sur <span className="text-slate-900">{filteredData.length}</span> villes
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 text-slate-600 hover:border-orange-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? "bg-orange-600 text-white shadow-md shadow-orange-100" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 text-slate-600 hover:border-orange-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}