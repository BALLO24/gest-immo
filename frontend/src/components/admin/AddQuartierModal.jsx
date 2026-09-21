import React, { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, PlusCircle, Loader2, ChevronDown, Building2 } from "lucide-react";
import API from "../../api/API";

const AddQuartierModal = ({ isOpen, close, onSuccess, onError }) => {
  const [villes, setVilles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: "", ville: "" });

  const modalId = useId();
  const nomId = useId();
  const villeId = useId();

  useEffect(() => {
    if (isOpen) {
      API.getVilles().then(setVilles).catch((err) => console.error("Erreur villes:", err));
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
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2 rounded-xl" aria-hidden="true">
              <MapPin size={20} className="text-orange-600" />
            </div>
            <h3 id={modalId} className="text-lg font-bold text-gray-900 tracking-tight">
              Nouveau quartier
            </h3>
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor={nomId} className="text-sm font-semibold text-gray-700 ml-0.5">Nom du quartier</label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
              <input
                id={nomId}
                type="text"
                required
                autoFocus
                placeholder="Ex: Badalabougou"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-orange-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor={villeId} className="text-sm font-semibold text-gray-700 ml-0.5">Ville</label>
            <div className="relative mt-1.5">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} aria-hidden="true" />
              <select
                id={villeId}
                required
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full appearance-none pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-orange-600 outline-none cursor-pointer transition-colors"
              >
                <option value="" disabled>Sélectionner une ville</option>
                {villes.map((v) => (
                  <option key={v._id} value={v._id}>{v.nom}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-5 py-3 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={18} /> Traitement...</>
              ) : (
                <><PlusCircle size={18} /> Créer le quartier</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddQuartierModal;
