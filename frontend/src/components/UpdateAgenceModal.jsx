import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, UserCircle, Phone, Mail, X, 
  CheckCircle2, AlertCircle, Loader2,
  Briefcase, TextQuote, Lock, User, Eye, EyeOff, Save
} from "lucide-react";
import API from "../api/API";

export default function UpdateAgenceModal({ isOpen, onClose, onSuccess, agenceData }) {
  const [form, setForm] = useState({
    nom_agence: "",
    nom_proprietaire: "",
    // prenom_proprietaire: "",
    numero_telephone: "",
    email: "",
    nomUtilisateur: "",
    password: "", // On le laisse vide par défaut pour l'update
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Charger les données de l'agence quand le modal s'ouvre
  useEffect(() => {
    if (agenceData && isOpen) {
      setForm({
        nom_agence: agenceData.nom_agence || "",
        nom_proprietaire: agenceData.nom_proprietaire || "",
        // prenom_proprietaire: agenceData.prenom_proprietaire || "",
        numero_telephone: agenceData.numero_telephone || "",
        email: agenceData.email || "",
        nomUtilisateur: agenceData.nomUtilisateur || "",
        password: "", // On ne charge jamais le hash du mot de passe
        description: agenceData.description || "",
      });
    }
  }, [agenceData, isOpen]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nom_agence || !form.nom_proprietaire || !form.nomUtilisateur) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      setSubmitting(true);
      
      // On prépare les données : si le password est vide, on ne l'envoie pas
      const updatedData = { ...form };
      if (!updatedData.password) delete updatedData.password;

      const response = await API.updateAgence(agenceData._id, updatedData); 
      
      if (response) {
        onSuccess("Informations de l'agence mises à jour !");
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Building2 size={28} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Modifier l'Agence</h2>
              <p className="text-gray-500 font-bold text-sm">ID: {agenceData?._id?.substring(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            
            {/* SECTION 01: AGENCE */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">01. Identité de l'Agence</h3>
              <InputBlock 
                label="Nom de l'agence commerciale" 
                icon={Building2} 
                value={form.nom_agence} 
                onChange={(v) => handleChange("nom_agence", v)} 
              />
            </div>

            {/* SECTION 02: RESPONSABLE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">02. Contact Responsable</h3>
                <InputBlock 
                  label="Nom" icon={Briefcase} 
                  value={form.nom_proprietaire} 
                  onChange={(v) => handleChange("nom_proprietaire", v)} 
                />
              <InputBlock 
                label="Téléphone" icon={Phone} 
                value={form.numero_telephone} 
                onChange={(v) => handleChange("numero_telephone", v)} 
                type="tel"
              />
            </div>

            {/* SECTION 03: ACCÈS (MODIFICATION) */}
            <div className="space-y-6 bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">03. Sécurité & Accès</h3>
              <InputBlock 
                label="Nom d'utilisateur" icon={User} 
                value={form.nomUtilisateur} 
                onChange={(v) => handleChange("nomUtilisateur", v)} 
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">
                  Nouveau mot de passe <span className="text-gray-400 font-normal text-xs">(Optionnel)</span>
                </label>
                <div className="relative shadow-sm rounded-2xl overflow-hidden">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                    className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-12 py-4 text-gray-900 font-bold text-base focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 04: DESCRIPTION */}
            <div className="md:col-span-2 space-y-6">
              <InputBlock 
                label="Adresse Email Professionnelle" 
                icon={Mail} 
                value={form.email} 
                onChange={(v) => handleChange("email", v)} 
                type="email"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Description de l'agence</label>
                <div className="relative">
                  <TextQuote className="absolute left-4 top-4 text-gray-400" size={20} />
                  <textarea 
                    className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold focus:border-blue-600 outline-none h-[100px] transition-all shadow-sm resize-none"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl flex items-center gap-3 font-bold text-sm">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 pb-2 border-t-2 border-gray-100">
            <button type="button" onClick={onClose} className="px-8 py-5 text-gray-500 font-black hover:text-black transition-colors">
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <Save />}
              {submitting ? "MISE À JOUR..." : "SAUVEGARDER LES MODIFICATIONS"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// Réutilisation du même InputBlock pour la cohérence
function InputBlock({ label, icon: Icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-black text-gray-900 ml-1">{label}</label>
      <div className="relative shadow-sm rounded-2xl overflow-hidden">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type={type} value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold text-base focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 shadow-sm"
        />
      </div>
    </div>
  );
}