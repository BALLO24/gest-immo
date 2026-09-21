import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2, Phone, Mail, X,
  AlertCircle, Loader2,
  Briefcase, TextQuote, Lock, User, Eye, EyeOff, Save,
  CheckCircle2, Clock, Ban,
} from "lucide-react";
import API from "../../api/API";

export default function UpdateAgenceModal({ isOpen, onClose, onSuccess, agenceData }) {
  const [form, setForm] = useState({
    nom_agence: "",
    nom_proprietaire: "",
    numero_telephone: "",
    email: "",
    nomUtilisateur: "",
    password: "",
    description: "",
    statut: "active",
    telephonePublic: "",
    emailPublic: "",
    adresse: "",
    logo: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!agenceData?._id || !isOpen) return;

    setLoadingDetails(true);
    API.getAgenceById(agenceData._id).then((details) => {
      const agence = details?.agence || agenceData;
      const user = details?.user;
      setForm({
        nom_agence: agence.nom_agence || "",
        nom_proprietaire: agence.nom_proprietaire || "",
        numero_telephone: user?.numero_telephone || "",
        email: user?.email || "",
        nomUtilisateur: user?.nom || "",
        password: "",
        description: agence.description || "",
        statut: agence.statut || "active",
        telephonePublic: agence.telephonePublic || "",
        emailPublic: agence.emailPublic || "",
        adresse: agence.adresse || "",
        logo: agence.logo || "",
      });
      setLoadingDetails(false);
    });
  }, [agenceData?._id, isOpen]);

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
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl"><Building2 size={20} className="text-blue-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Modifier l'agence</h2>
              <p className="text-gray-400 text-xs">ID: {agenceData?._id?.substring(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 custom-scrollbar space-y-6 flex-1">

          {loadingDetails && (
            <div className="flex items-center gap-2.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm font-medium">
              <Loader2 className="animate-spin" size={16} />
              Chargement des identifiants de connexion...
            </div>
          )}

          {/* IDENTITÉ */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Identité de l'agence</h3>
            <InputBlock label="Nom de l'agence commerciale" icon={Building2} value={form.nom_agence} onChange={(v) => handleChange("nom_agence", v)} />
            <div className="grid grid-cols-2 gap-3">
              <InputBlock label="Responsable" icon={Briefcase} value={form.nom_proprietaire} onChange={(v) => handleChange("nom_proprietaire", v)} />
              <InputBlock label="Téléphone" icon={Phone} value={form.numero_telephone} onChange={(v) => handleChange("numero_telephone", v)} type="tel" />
            </div>
          </div>

          {/* SÉCURITÉ & ACCÈS */}
          <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-600">Sécurité & accès</h3>
            {/* Permet à l'admin d'activer une agence auto-inscrite (statut
                "inactive" par défaut, en attente de validation). */}
            <div>
              <label className="text-sm font-semibold text-gray-700 ml-0.5">Statut du compte</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5" role="radiogroup" aria-label="Statut du compte">
                <StatutOption
                  value="active" current={form.statut} onSelect={(v) => handleChange("statut", v)}
                  icon={CheckCircle2} label="Active" activeClass="bg-emerald-50 border-emerald-500 text-emerald-700"
                />
                <StatutOption
                  value="inactive" current={form.statut} onSelect={(v) => handleChange("statut", v)}
                  icon={Clock} label="En attente" activeClass="bg-amber-50 border-amber-500 text-amber-700"
                />
                <StatutOption
                  value="suspendue" current={form.statut} onSelect={(v) => handleChange("statut", v)}
                  icon={Ban} label="Suspendue" activeClass="bg-red-50 border-red-500 text-red-700"
                />
              </div>
            </div>
            <InputBlock label="Nom d'utilisateur" icon={User} value={form.nomUtilisateur} onChange={(v) => handleChange("nomUtilisateur", v)} />
            <div>
              <label className="text-sm font-semibold text-gray-700 ml-0.5">
                Nouveau mot de passe <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Laisser vide pour ne pas changer"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:border-blue-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <InputBlock label="Email (compte de connexion)" icon={Mail} value={form.email} onChange={(v) => handleChange("email", v)} type="email" />
          </div>

          {/* PROFIL PUBLIC */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Profil public (affiché sur les annonces)</h3>
            <div className="grid grid-cols-2 gap-3">
              <InputBlock label="Téléphone public" icon={Phone} value={form.telephonePublic} onChange={(v) => handleChange("telephonePublic", v)} type="tel" />
              <InputBlock label="Email public" icon={Mail} value={form.emailPublic} onChange={(v) => handleChange("emailPublic", v)} type="email" />
            </div>
            <InputBlock label="Adresse du siège" icon={Building2} value={form.adresse} onChange={(v) => handleChange("adresse", v)} />
            <InputBlock label="Logo (URL de l'image)" icon={Building2} value={form.logo} onChange={(v) => handleChange("logo", v)} placeholder="https://..." />
            <div>
              <label className="text-sm font-semibold text-gray-700 ml-0.5">Description de l'agence</label>
              <div className="relative mt-1.5">
                <TextQuote className="absolute left-3.5 top-3.5 text-gray-300" size={18} aria-hidden="true" />
                <textarea
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-blue-600 outline-none h-24 transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          {error && (
            <div role="alert" className="mb-3 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-5 py-3 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-colors">Annuler</button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="animate-spin" size={18} /> Mise à jour...</> : <><Save size={18} /> Sauvegarder</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function InputBlock({ label, icon: Icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 ml-0.5">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:border-blue-600 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

// AJOUT : remplace le <select> par un groupe d'options cliquables — 3 choix
// bien distincts (avec déjà une icône/couleur associée chacun), plus lisible
// et plus rapide à sélectionner qu'un menu déroulant à ouvrir.
function StatutOption({ value, current, onSelect, icon: Icon, label, activeClass }) {
  const isActive = current === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onSelect(value)}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-colors ${
        isActive ? activeClass : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      <Icon size={18} />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
