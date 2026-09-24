import React, { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import {
  Banknote, X, Flame, MapPin,
  Image as ImageIcon, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, Maximize,
  ListChecks, LayoutGrid, Camera,
} from "lucide-react";
import API from "../../api/API";

const TABS = [
  { id: "general", label: "Général", icon: LayoutGrid },
  { id: "localisation", label: "Localisation", icon: MapPin },
  { id: "caracteristiques", label: "Caractéristiques", icon: ListChecks },
  { id: "photos", label: "Photos", icon: Camera },
];

export default function AddTerrainModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    agence: agenceId || "",
    quartier: "",
    typeOffre: "vente",
    prix: "",
    images: [],
    misEnAvant: false,
    statut: "disponible",
    documentTerrain: "Titre Foncier",
    dimensionTerrain: "",
    typeTerrain: "residentiel",
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

  const modalId = useId();

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

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setForm(prev => ({ ...prev, images: files }));
    setPreviewImages(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    const newFiles = [...form.images];
    const newPreviews = [...previewImages];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setForm(prev => ({ ...prev, images: newFiles }));
    setPreviewImages(newPreviews);
  };

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
      setError("Veuillez indiquer le prix total.");
      return;
    }
    if (!form.quartier) {
      setActiveTab("localisation");
      setError("Veuillez sélectionner un quartier.");
      return;
    }

    const fd = new FormData();
    fd.append("type", "terrain");
    Object.keys(form).forEach(key => {
      if (key !== 'images') fd.append(key, form[key]);
    });
    form.images.forEach((file) => fd.append("images", file));

    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Terrain référencé avec succès !");
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4" role="dialog" aria-modal="true" aria-labelledby={modalId}>
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" aria-hidden="true" />
            <h2 id={modalId} className="text-lg font-bold text-gray-900 tracking-tight">Terrain</h2>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-green-500">
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

              <InputBlock label="Prix Total (FCFA)" icon={Banknote} value={form.prix} onChange={(v) => handleChange("prix", v)} placeholder="Prix de vente" type="number" required />

              <SelectBlock label="Usage" value={form.typeTerrain} onChange={(v) => handleChange("typeTerrain", v)}>
                <option value="residentiel">Résidentiel</option>
                <option value="agricole">Agricole</option>
                <option value="commercial">Commercial</option>
              </SelectBlock>

              <SelectBlock label="Nature du document" value={form.documentTerrain} onChange={(v) => handleChange("documentTerrain", v)}>
                <option value="Titre Foncier">Titre Foncier (TF)</option>
                <option value="Titre Provisoire">Titre Provisoire</option>
                <option value="Permis">Permis d'occuper</option>
                <option value="Bulletin">Bulletin</option>
                <option value="Lettre d'attribution">Lettre d'attribution</option>
                <option value="Autre">Autre document</option>
              </SelectBlock>
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
            <div className="space-y-5 animate-in fade-in duration-150">
              <InputBlock label="Dimension (m²)" icon={Maximize} value={form.dimensionTerrain} onChange={(v) => handleChange("dimensionTerrain", v)} placeholder="Ex: 20x25" />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Notes complémentaires</label>
                <textarea
                  placeholder="Proximité goudron, eau/électricité disponible, clôturé ou non..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-orange-600 outline-none h-24 transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Mise en avant</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <OptionCard label="Opportunité" checked={form.misEnAvant} icon={Flame} onChange={(v) => handleChange("misEnAvant", v)} isHot />
                </div>
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Photos du terrain</h3>
                <span className="text-xs font-medium text-gray-400">{previewImages.length}/6 photos</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {previewImages.length < 3 && (
                  <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-orange-500 transition-colors cursor-pointer flex flex-col items-center justify-center group focus-within:ring-2 focus-within:ring-green-500">
                    <ImageIcon size={28} className="text-gray-300 group-hover:text-orange-600 transition-colors" aria-hidden="true" />
                    <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                  </label>
                )}
                {previewImages.map((src, i) => (
                  <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border-2 border-white group">
                    <img src={src} className="w-full h-full object-cover" alt={`Aperçu ${i + 1}`} />
                    <button type="button" onClick={() => removeImage(i)} aria-label={`Supprimer l'image ${i + 1}`} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:opacity-100">
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Glissez-déposez ou cliquez pour choisir, 6 photos maximum.</p>
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

function InputBlock({ label, icon: Icon, value, onChange, placeholder, type = "text", required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
        <input
          id={id}
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-gray-900 text-sm focus:border-orange-600 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled, required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-orange-600 outline-none disabled:bg-gray-50 cursor-pointer transition-colors"
        >
          {children}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}

function OptionCard({ label, checked, onChange, icon: Icon, isHot }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-orange-400 ${
        checked ? (isHot ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-900 border-gray-900 text-white") : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="text-[10px] font-semibold uppercase text-center leading-none">{label}</span>
    </button>
  );
}
