import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Map, X, CheckCircle2, Loader2, PlusCircle, Building } from "lucide-react";
import API from "../api/API";

const AddVille = ({ isOpen, close, onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataObj = Object.fromEntries(formData.entries());

    try {
      setIsSubmitting(true);
      const response = await API.addVille(dataObj);
      
      if (response.success) {
        onSuccess(response.message);
        setInputValue(""); // Reset le champ
        close();
      } else {
        onError(response.message);
      }
    } catch (err) {
      console.error(err);
      onError("Une erreur est survenue lors de l'ajout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <Map size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Configuration Géo</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Ajouter une ville</p>
            </div>
          </div>
          <button 
            onClick={close} 
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">Informations Territoriales</h3>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                <Building size={22} />
              </div>
              <input
                name="nom"
                type="text"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: Bamako, Kayes, Mopti..."
                className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-5 text-gray-900 font-bold text-lg focus:border-orange-600 outline-none transition-all shadow-sm placeholder:text-gray-300"
              />
              <label className={`absolute left-12 transition-all duration-200 pointer-events-none font-black uppercase text-[10px] tracking-widest ${
                inputValue ? "-top-2.5 text-orange-600 bg-white px-2 scale-100" : "top-1/2 -translate-y-1/2 opacity-0"
              }`}>
                Nom de la ville
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              type="button" 
              onClick={close} 
              className="px-6 py-4 text-gray-400 font-black hover:text-gray-900 transition-colors text-sm"
            >
              ANNULER
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-5 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <PlusCircle size={24} />
              )}
              {isSubmitting ? "ENREGISTREMENT..." : "CONFIRMER"}
            </button>
          </div>
        </form>

        {/* Petit footer décoratif */}
        <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"></div>
      </div>
    </div>,
    document.body
  );
};

export default AddVille;