import React, { useState, useId } from "react";
import { createPortal } from "react-dom";
import { Map, X, Loader2, PlusCircle } from "lucide-react";
import API from "../../api/API";

const AddVille = ({ isOpen, close, onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const modalId = useId();
  const inputId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await API.addVille({ nom: inputValue.trim() });

      if (response.success) {
        onSuccess(response.message);
        setInputValue("");
        close();
      } else {
        onError(response.message);
      }
    } catch (err) {
      console.error(err);
      onError("Une erreur est survenue lors de l'ajout de la ville.");
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
              <Map size={20} className="text-orange-600" />
            </div>
            <h3 id={modalId} className="text-lg font-bold text-gray-900 tracking-tight">
              Nouvelle ville
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 ml-0.5">Nom de la ville</label>
            <input
              id={inputId}
              name="nom"
              type="text"
              required
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: Bamako, Kayes, Mopti..."
              className="w-full mt-1.5 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-orange-600 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="px-5 py-3 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !inputValue.trim()}
              className="flex-1 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={18} /> Enregistrement...</>
              ) : (
                <><PlusCircle size={18} /> Confirmer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddVille;
