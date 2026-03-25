import React, { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import { 
  MapPin, X, PlusCircle, Loader2, 
  ChevronDown, Navigation, Building2 
} from "lucide-react";
import API from "../api/API";

const AddQuartierModal = ({ isOpen, close, onSuccess, onError }) => {
  const [villes, setVilles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: "", ville: "" });

  const modalId = useId();
  const nomId = useId();
  const villeId = useId();

  useEffect(() => {
    if (isOpen) {
      const fetchVilles = async () => {
        try {
          const response = await API.getVilles();
          setVilles(response || []);
        } catch (err) {
          console.error("Erreur villes:", err);
        }
      };
      fetchVilles();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.ville) return;

    try {
      setIsSubmitting(true);
      const response = await API.addQuartier(formData);
      
      if (response.success) {
        onSuccess(response.message);
        setFormData({ nom: "", ville: "" });
        close();
      } else {
        onError(response.message);
      }
    } catch (err) {
      onError("Erreur lors de la création du quartier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
    >
      <div 
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 transition-all animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER SECTION */}
        <div className="px-8 py-6 border-b-2 border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl" aria-hidden="true">
              <Navigation size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 id={modalId} className="text-xl font-black text-gray-900 tracking-tight">
                Découpage Urbain
              </h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nouveau Quartier</p>
            </div>
          </div>
          <button 
            onClick={close} 
            aria-label="Fermer la fenêtre"
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">Localisation du secteur</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INPUT NOM DU QUARTIER */}
              <div className="relative group">
                <label htmlFor={nomId} className="sr-only">Nom du quartier</label>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors z-10">
                  <MapPin size={20} />
                </div>
                <input
                  id={nomId}
                  type="text"
                  required
                  placeholder="Nom du quartier"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold focus:bg-white focus:border-orange-600 outline-none transition-all shadow-sm"
                />
              </div>

              {/* SELECT VILLE PARENTE */}
              <div className="relative group">
                <label htmlFor={villeId} className="sr-only">Rattacher à une ville</label>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors z-10">
                  <Building2 size={20} />
                </div>
                <select
                  id={villeId}
                  required
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="w-full appearance-none bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-10 py-4 text-gray-900 font-bold focus:bg-white focus:border-orange-600 outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="" disabled>Rattacher à une ville</option>
                  {villes.map((v) => (
                    <option key={v._id} value={v._id}>{v.nom}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              type="button" 
              onClick={close} 
              className="px-6 py-4 text-gray-400 font-black hover:text-gray-900 transition-colors text-sm uppercase tracking-widest outline-none focus:underline"
            >
              ANNULER
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-5 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 outline-none focus:ring-4 focus:ring-orange-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                  <span>TRAITEMENT...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={24} aria-hidden="true" />
                  <span>CRÉER LE QUARTIER</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ACCENT BAR - Drapeau National Style */}
        <div className="h-2 bg-gradient-to-r from-[#1EB53A] via-[#FCD116] to-[#CE1126]" aria-hidden="true"></div>
      </div>
    </div>,
    document.body
  );
};

export default AddQuartierModal;