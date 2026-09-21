import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MapPin, Banknote,
  Coffee, Zap, X,
  Flame, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2,
  ChevronDown, Wifi, Wind, Monitor,
  ListChecks, LayoutGrid, Camera,
} from "lucide-react";
import API from "../../api/API";

const MAX_IMAGES = 3;

const TABS = [
  { id: "general", label: "Général", icon: LayoutGrid },
  { id: "localisation", label: "Localisation", icon: MapPin },
  { id: "caracteristiques", label: "Caractéristiques", icon: ListChecks },
  { id: "photos", label: "Photos", icon: Camera },
];

export default function AddAppartementModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    agence: agenceId || "",
    quartier: "",
    typeOffre: "location",
    prix: "",
    prixParJour: "",
    prixParHeure: "",
    images: [],
    misEnAvant: false,
    statut: "disponible",
    etage: "",
    nombreChambres: "",
    nombreSallesBain: "",
    nombreSalons: "",
    cuisine: false,
    magasin: false,
    meuble: false,
    climatisation: false,
    connexionInternet: false,
    energieSecours: false,
    coursUnique: false,
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [activeTab, setActiveTab] = useState("general");
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agences, setAgences] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [v, q, a] = await Promise.all([
            API.getVilles(),
            API.getQuartiers(),
            API.getAllAgences()
          ]);
          setVilles(v); setQuartiers(q); setAgences(a);
        } catch (err) { console.error("Erreur chargement data:", err); }
      };
      loadData();
      setActiveTab("general");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => previewImages.forEach((src) => URL.revokeObjectURL(src));
  }, [previewImages]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - form.images.length);
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
    setPreviewImages((prev) => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newFiles = [...form.images];
    newFiles.splice(index, 1);
    setForm(prev => ({ ...prev, images: newFiles }));
    setPreviewImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  // AJOUT : puisque les onglets sont libres, un champ requis peut se trouver
  // dans un onglet jamais ouvert — on y renvoie directement.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.agence) {
      setActiveTab("general");
      setError("Veuillez sélectionner une agence.");
      return;
    }
    if (!form.prix) {
      setActiveTab("general");
      setError("Veuillez indiquer un prix.");
      return;
    }
    if (!form.quartier) {
      setActiveTab("localisation");
      setError("Veuillez sélectionner un quartier.");
      return;
    }

    const fd = new FormData();
    fd.append("type", "appartement");
    fd.append("agence", form.agence);
    fd.append("quartier", form.quartier);
    fd.append("typeOffre", form.typeOffre);
    fd.append("prix", form.prix);
    if (form.typeOffre === "location") {
      fd.append("prixParJour", form.prixParJour || 0);
      fd.append("prixParHeure", form.prixParHeure || 0);
    }
    fd.append("misEnAvant", form.misEnAvant);
    fd.append("statut", form.statut);
    fd.append("etage", form.etage || "");
    fd.append("nombreChambres", form.nombreChambres || 0);
    fd.append("nombreSallesBain", form.nombreSallesBain || 0);
    fd.append("nombreSalons", form.nombreSalons || 0);
    fd.append("cuisine", form.cuisine);
    fd.append("magasin", form.magasin);
    fd.append("meuble", form.meuble);
    fd.append("climatisation", form.climatisation);
    fd.append("connexionInternet", form.connexionInternet);
    fd.append("energieSecours", form.energieSecours);
    fd.append("coursUnique", form.coursUnique);
    fd.append("description", form.description);

    form.images.forEach((file) => fd.append("images", file));

    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Appartement ajouté avec succès !");
        setForm(initialState);
        setPreviewImages([]);
        setVilleSelected("");
        onClose();
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4" role="dialog" aria-modal="true">
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Appartement</h2>
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
                activeTab === tab.id ? "border-orange-600 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === "photos" && previewImages.length > 0 && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{previewImages.length}</span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 custom-scrollbar space-y-6 flex-1">

          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {agenceId === null && (
                <SelectBlock label="Agence" value={form.agence} onChange={(v) => handleChange("agence", v)} required>
                  <option value="">Sélectionner une agence</option>
                  {agences.map(a => <option key={a._id} value={a._id}>{a.nom_agence}</option>)}
                </SelectBlock>
              )}

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
                  <label className="text-sm font-semibold text-gray-700 ml-1">Prix & Transaction</label>
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
                      <label className="text-xs font-medium text-gray-500 ml-1">Prix / Jour <span className="text-gray-400">(optionnel)</span></label>
                      <input type="number" placeholder="0" className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-orange-600 outline-none" value={form.prixParJour} onChange={(e) => handleChange("prixParJour", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">Prix / Heure <span className="text-gray-400">(optionnel)</span></label>
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

              <SelectBlock label="Quartier" value={form.quartier} onChange={(v) => handleChange("quartier", v)} disabled={!villeSelected} required>
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
                <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                <textarea
                  placeholder="Équipements, services inclus, accessibilité..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-orange-600 outline-none h-24 transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Commodités de l'appartement</h3>
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Photos du bien</h3>
                <span className="text-xs font-medium text-gray-400">{previewImages.length}/{MAX_IMAGES} photos</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {previewImages.length < MAX_IMAGES && (
                  <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-orange-500 transition-colors cursor-pointer flex flex-col items-center justify-center group">
                    <ImageIcon size={28} className="text-gray-300 group-hover:text-orange-600 transition-colors" />
                    <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                  </label>
                )}
                {previewImages.map((src, i) => (
                  <div key={src} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border-2 border-white group">
                    <img src={src} className="w-full h-full object-cover" alt={`Prévisualisation ${i + 1}`} />
                    <button type="button" onClick={() => removeImage(i)} aria-label={`Supprimer l'image ${i + 1}`} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Glissez-déposez ou cliquez pour choisir, {MAX_IMAGES} photos maximum.</p>
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
            <button type="button" onClick={onClose} className="px-5 py-3 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="animate-spin" size={18} /> Publication...</> : <><CheckCircle2 size={18} /> Publier</>}
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
      <input
        type="number" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-center text-gray-900 text-lg focus:border-orange-600 outline-none transition-colors"
        placeholder="0"
      />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled, required }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className={`text-sm font-semibold text-gray-700 ml-1 ${disabled ? 'opacity-50' : ''}`}>
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-orange-600 outline-none disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer transition-colors"
        >
          {children}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function OptionCard({ label, checked, onChange, icon: Icon, isHot }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-colors ${
        checked ? (isHot ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-900 border-gray-900 text-white") : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold uppercase text-center leading-none">{label}</span>
    </button>
  );
}
