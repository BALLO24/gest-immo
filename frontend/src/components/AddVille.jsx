import React, { useState, useId } from "react";
import { createPortal } from "react-dom";
import { Map, X, Loader2, PlusCircle, Building } from "lucide-react";
import API from "../api/API";

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
      // On passe un objet propre à l'API
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
    >
      <div 
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl" aria-hidden="true">
              <Map size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 id={modalId} className="text-xl font-black text-gray-900 tracking-tight">
                Configuration Géo
              </h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Ajouter une ville</p>
            </div>
          </div>
          <button 
            onClick={close} 
            aria-label="Fermer"
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">
              Informations Territoriales
            </h3>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors z-10">
                <Building size={22} />
              </div>
              <input
                id={inputId}
                name="nom"
                type="text"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: Bamako, Kayes, Mopti..."
                className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-5 text-gray-900 font-bold text-lg focus:border-orange-600 outline-none transition-all shadow-sm placeholder:text-gray-300"
              />
              {/* Label Flottant Dynamique */}
              <label 
                htmlFor={inputId}
                className={`absolute left-12 transition-all duration-200 pointer-events-none font-black uppercase text-[10px] tracking-widest ${
                  inputValue 
                    ? "-top-2.5 text-orange-600 bg-white px-2 scale-100 opacity-100 z-20" 
                    : "top-1/2 -translate-y-1/2 opacity-0"
                }`}
              >
                Nom de la ville
              </label>
            </div>
          </div>

          {/* ACTIONS */}
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
              disabled={isSubmitting || !inputValue.trim()}
              className="flex-1 py-5 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 outline-none focus:ring-4 focus:ring-orange-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                  <span>ENREGISTREMENT...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={24} aria-hidden="true" />
                  <span>CONFIRMER</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer décoratif tricolore */}
        <div className="h-2 bg-gradient-to-r from-[#1EB53A] via-[#FCD116] to-[#CE1126]" aria-hidden="true"></div>
      </div>
    </div>,
    document.body
  );
};

export default AddVille;