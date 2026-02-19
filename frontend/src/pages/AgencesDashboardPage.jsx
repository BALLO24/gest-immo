import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, Search, MoreVertical, Edit2, Trash2, Eye, 
  ChevronLeft, ChevronRight, Store, User, Phone, Mail 
} from "lucide-react";

// Components & API
import ItemsParPageOptions from "../components/ItemsParPage";
import AddAgenceModal from "../components/addAgenceModal";
import ToastSuccess from "../components/ToastSuccess";
import ToastError from "../components/ToastError";
import ConfirmSuppression from "../components/ConfirmSuppression";
import UpdateAgenceModal from "../components/UpdateAgenceModal";
import DetailsModalAgence from "../components/DetailsModalAgence";
import API from "../api/API";

export default function AgencesDashboardPage() {
  const navigate = useNavigate();
  const [agences, setAgences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Modals & States
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
    return agences.filter((a) => 
      [a.nom_agence, a.nom_proprietaire, a.email]
        .some(val => val?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, agences]);

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

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Store className="text-orange-600" /> Annuaire des Agences
          </h1>
          <p className="text-slate-500 text-sm font-medium">Gestion et partenaires immobiliers</p>
        </div>

        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Enregistrer une agence
        </button>
      </div>

      {/* SEARCH & FILTERS CARD */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une agence, email ou nom..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 rounded-xl transition-all outline-none text-sm"
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

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Agence</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Propriétaire</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700">{item.nom_agence}</span>
                      <span className="text-[11px] text-orange-600 font-bold uppercase tracking-tighter">ID: {item._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <User size={14} className="text-slate-400" />
                      {item.nom_proprietaire} {item.prenom_proprietaire}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Phone size={12} /> {item.numero_telephone}
                      </div>
                      {item.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail size={12} /> {item.email}
                        </div>
                      )}
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
                          <button onClick={() => { setSelectedAgence(item); setShowDetailsModal(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Eye size={16} /> Fiche Complète
                          </button>
                          <button onClick={() => { setShowUpdateModal(true); setIdToDelete(item._id); setOpenDropdownId(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Edit2 size={16} /> Éditer
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
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500 italic">
            Total agences : {filteredData.length}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-xs font-black text-slate-700 mx-2">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}