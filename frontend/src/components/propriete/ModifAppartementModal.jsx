import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin, Banknote, Coffee, Monitor, Wind, Wifi, X, Flame,
  Image as ImageIcon, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, Zap, Pencil, Home,
  ListChecks, LayoutGrid, Camera,
} from "lucide-react";
import API from "../../api/API";

const TABS = [
  { id: "general", label: "Général", icon: LayoutGrid },
  { id: "localisation", label: "Localisation", icon: MapPin },
  { id: "caracteristiques", label: "Caractéristiques", icon: ListChecks },
  { id: "photos", label: "Photos", icon: Camera },
];

export default function ModifAppartementModal({ isOpen, onClose, onSuccess, appartement }) {
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  useEffect(() => {
    if (isOpen && appartement) {
      setForm({
        ...appartement,
        agence: appartement.agence?._id || appartement.agence,
        quartier: appartement.quartier?._id || appartement.quartier,
      });
      setVilleSelected(appartement.quartier?.ville?._id || "");
      setActiveTab("general");

      const loadData = async () => {
        try {
          const [v, q] = await Promise.all([API.getVilles(), API.getQuartiers()]);
          setVilles(v); setQuartiers(q);
        } catch (err) { console.error("Erreur chargement data:", err); }
      };
      loadData();
    }
  }, [isOpen, appartement]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.quartier) {
      setActiveTab("localisation");
      setError("Le quartier est obligatoire.");
      return;
    }
    if (!form.prix) {
      setActiveTab("general");
      setError("Le prix est obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      const { images, __v, _id, __t, ...payload } = form;
      const finalPayload = {
        ...payload,
        prix: Number(payload.prix),
        nombreChambres: Number(payload.nombreChambres || 1),
        nombreSalons: Number(payload.nombreSalons || 1),
        nombreSallesBain: Number(payload.nombreSallesBain || 1),
      };

      const response = await API.updateHabitation(appartement._id, finalPayload);
      if (response) onSuccess(response);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !form) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl"><Pencil size={20} className="text-blue-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Modifier l'appartement</h2>
              <p className="text-gray-400 text-xs">Réf: #{appartement._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
            <X size={22} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-2 shrink-0 overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">

          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <SelectBlock label="Statut de l'appartement" value={form.statut} onChange={(v) => handleChange("statut", v)}>
                <option value="disponible">✅ Disponible</option>
                <option value="nonDisponible">❌ Occupé / Indisponible</option>
                {/* CORRIGÉ : option manquante, existe pourtant dans le modèle
                    et dans le formulaire d'ajout. */}
                <option value="reserve">🤝 Réservé</option>
              </SelectBlock>

              <SelectBlock label="Position" value={form.etage} onChange={(v) => handleChange("etage", v)}>
                <option value="">Sélectionner</option>
                <option value={0}>Rez de chaussée</option>
                <option value={1}>1er étage</option>
                <option value={2}>2ème étage</option>
                <option value={3}>3ème étage</option>
                <option value={4}>4ème étage</option>
                <option value={5}>5ème étage et plus</option>
              </SelectBlock>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Prix & Type de contrat</label>
                  <div className="flex items-stretch border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-600 transition-colors">
                    <select
                      value={form.typeOffre}
                      onChange={(e) => handleChange("typeOffre", e.target.value)}
                      className="bg-gray-50 border-r border-gray-200 px-3 text-sm text-gray-900 outline-none cursor-pointer"
                    >
                      <option value="location">Location</option>
                      <option value="vente">Vente</option>
                    </select>
                    <div className="relative flex-1 bg-white flex items-center">
                      <Banknote className="ml-3 text-gray-300" size={18} />
                      <input
                        type="number"
                        placeholder={form.typeOffre === "vente" ? "Prix de vente" : "Prix / Mois"}
                        className="w-full pl-2 pr-3 py-3 text-base text-gray-900 outline-none"
                        value={form.prix}
                        onChange={(e) => handleChange("prix", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {form.typeOffre === "location" && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Prix / Jour</label>
                      <input type="number" placeholder="0" className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-orange-600 outline-none" value={form.prixParJour} onChange={(e) => handleChange("prixParJour", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Prix / Heure</label>
                      <input type="number" placeholder="0" className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-orange-600 outline-none" value={form.prixParHeure} onChange={(e) => handleChange("prixParHeure", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "localisation" && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
              <SelectBlock label="Ville" value={villeSelected} onChange={(v) => { setVilleSelected(v); handleChange("quartier", ""); }}>
                <option value="">Sélectionner</option>
                {villes.map(v => <option key={v._id} value={v._id}>{v.nom}</option>)}
              </SelectBlock>
              <SelectBlock label="Quartier" value={form.quartier} onChange={(v) => handleChange("quartier", v)} disabled={!villeSelected}>
                <option value="">Sélectionner</option>
                {quartiers.filter(q => q.ville?._id === villeSelected).map(q => (
                  <option key={q._id} value={q._id}>{q.nom}</option>
                ))}
              </SelectBlock>
            </div>
          )}

          {activeTab === "caracteristiques" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-3 gap-3">
                <NumberBox label="Chambres" value={form.nombreChambres} onChange={(v) => handleChange("nombreChambres", v)} />
                <NumberBox label="Salons" value={form.nombreSalons} onChange={(v) => handleChange("nombreSalons", v)} />
                <NumberBox label="Douches" value={form.nombreSallesBain} onChange={(v) => handleChange("nombreSallesBain", v)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Description détaillée</label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-orange-600 outline-none h-24 transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Services & Énergie</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <OptionCard label="Cuisine" checked={form.cuisine} icon={Coffee} onChange={(v) => handleChange("cuisine", v)} />
                  <OptionCard label="Meublé" checked={form.meuble} icon={Monitor} onChange={(v) => handleChange("meuble", v)} />
                  <OptionCard label="Clim" checked={form.climatisation} icon={Wind} onChange={(v) => handleChange("climatisation", v)} />
                  <OptionCard label="Wifi" checked={form.connexionInternet} icon={Wifi} onChange={(v) => handleChange("connexionInternet", v)} />
                  <OptionCard label="Groupe" checked={form.energieSecours} icon={Zap} onChange={(v) => handleChange("energieSecours", v)} />
                  <OptionCard label="Unique" checked={form.coursUnique} icon={MapPin} onChange={(v) => handleChange("coursUnique", v)} />
                  <OptionCard label="En vedette" checked={form.misEnAvant} icon={Flame} onChange={(v) => handleChange("misEnAvant", v)} isHot />
                </div>
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="animate-in fade-in duration-150">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon size={14} /> Photos de l'appartement
              </h3>
              <div className="flex flex-wrap gap-4">
                {form.images?.map((src, i) => (
                  <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                    <img src={src} className="w-full h-full object-cover" alt={`Photo ${i + 1}`} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">La modification des photos n'est pas encore disponible depuis cet écran.</p>
            </div>
          )}
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
              className="flex-1 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="animate-spin" size={18} /> Mise à jour...</> : <><CheckCircle2 size={18} /> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function NumberBox({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-500 text-center uppercase tracking-wide">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-center text-gray-900 text-lg focus:border-orange-600 outline-none transition-colors" />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-orange-600 outline-none disabled:bg-gray-50 cursor-pointer transition-colors">
          {children}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function OptionCard({ label, checked, onChange, icon: Icon, isHot }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-colors ${checked ? (isHot ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-900 border-gray-900 text-white") : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"}`}>
      <Icon size={18} />
      <span className="text-[10px] font-semibold uppercase text-center leading-none">{label}</span>
    </button>
  );
}
