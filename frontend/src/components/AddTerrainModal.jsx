import React, { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import { 
  LandPlot, Banknote, X, Flame, 
  Image as ImageIcon, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, Maximize
} from "lucide-react";
import API from "../api/API";

export default function AddTerrainModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    agence: agenceId || "",
    quartier: "",
    aLouer: false,
    prix: "",
    images: [],
    hot: false,
    statut: "disponible",
    documentTerrain: "Titre Foncier",
    dimensionTerrain: "",
    typeTerrain: "residentiel",
    description: "",
  };

  const [form, setForm] = useState(initialState);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agences, setAgences] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  const modalId = useId();
  const dimensionId = useId();

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
    }
  }, [isOpen]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
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

    if (!form.quartier || !form.prix || !form.agence) {
      setError("Veuillez remplir l'agence, le quartier et le prix total.");
      return;
    }

    const fd = new FormData();
    fd.append("type", "terrain");
    
    // On ajoute toutes les clés sauf images
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
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
    >
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="px-8 py-4 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-2xl" aria-hidden="true">
              <LandPlot size={28} className="text-green-600" />
            </div>
            <h2 id={modalId} className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Ajouter un terrain
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Fermer"
          >
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Emplacement & Agence</h3>
              
              {agenceId === null && (
                <SelectBlock label="Agence" value={form.agence} onChange={(v) => handleChange("agence", v)} required>
                  <option value="">Sélectionner une agence</option>
                  {agences.map(a => <option key={a._id} value={a._id}>{a.nom_agence}</option>)}
                </SelectBlock>
              )}

              <div className="grid grid-cols-2 gap-4">
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

              <InputBlock label="Prix Total (FCFA)" icon={Banknote} value={form.prix} onChange={(v) => handleChange("prix", v)} placeholder="Prix de vente" type="number" required />
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">02. Spécifications Techniques</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor={dimensionId} className="text-sm font-black text-gray-900 ml-1">Dimension (m²)</label>
                  <div className="relative">
                    <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      id={dimensionId}
                      type="text" 
                      placeholder="Ex: 20x25"
                      value={form.dimensionTerrain}
                      onChange={(e) => handleChange("dimensionTerrain", e.target.value)}
                      className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold focus:border-orange-600 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <SelectBlock label="Usage" value={form.typeTerrain} onChange={(v) => handleChange("typeTerrain", v)}>
                  <option value="residentiel">Résidentiel</option>
                  <option value="agricole">Agricole</option>
                  <option value="commercial">Commercial</option>
                </SelectBlock>
              </div>

              <SelectBlock label="Nature du Document" value={form.documentTerrain} onChange={(v) => handleChange("documentTerrain", v)}>
                <option value="Titre Foncier">Titre Foncier (TF)</option>
                <option value="Titre Provisoire">Titre Provisoire</option>
                <option value="Permis">Permis d'occuper</option>
                <option value="Bulletin">Bulletin</option>
                <option value="Lettre d'attribution">Lettre d'attribution</option>
                <option value="Autre">Autre document</option>
              </SelectBlock>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Notes complémentaires</label>
                <textarea 
                  placeholder="Proximité goudron, eau/électricité disponible, clôturé ou non..."
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[120px] transition-all shadow-sm resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* OPTIONS RAPIDES */}
          <div className="pt-6 border-t-2 border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">03. Mise en avant</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               <OptionCard label="🔥 OPPORTUNITÉ" checked={form.hot} icon={Flame} onChange={(v) => handleChange("hot", v)} isHot />
            </div>
          </div>

          {/* PHOTOS */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase mb-4 text-center">Photos du terrain (Max 3)</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {previewImages.length < 3 && (
                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-400 bg-white hover:border-orange-600 transition-all cursor-pointer flex flex-col items-center justify-center group focus-within:ring-2 focus-within:ring-green-500">
                  <ImageIcon size={32} className="text-gray-300 group-hover:text-orange-600 transition-colors" aria-hidden="true" />
                  <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                </label>
              )}
              {previewImages.map((src, i) => (
                <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white group">
                  <img src={src} className="w-full h-full object-cover" alt={`Aperçu ${i+1}`} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)} 
                    className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity outline-none focus:opacity-100"
                    aria-label="Supprimer l'image"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm shadow-lg shadow-red-200">
              <AlertCircle size={20} strokeWidth={3} aria-hidden="true" /> {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-4 pt-4 pb-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 text-gray-500 font-black hover:text-black transition-colors focus:outline-none focus:underline"
            >
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-4 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-md shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 outline-none focus:ring-4 focus:ring-orange-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                  <span>PUBLICATION EN COURS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} aria-hidden="true" />
                  <span>PUBLIER L'ANNONCE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// COMPOSANTS DE STYLE
function InputBlock({ label, icon: Icon, value, onChange, placeholder, type = "text", required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-black text-gray-900 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} aria-hidden="true" />
        <input 
          id={id}
          type={type} value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled, required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label htmlFor={id} className="text-sm font-black text-gray-900 ml-1">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      <div className="relative">
        <select 
          id={id}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none disabled:bg-gray-100 cursor-pointer transition-all shadow-sm"
        >
          {children}
        </select>
        <ChevronDown size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" aria-hidden="true" />
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
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all outline-none focus:ring-2 focus:ring-orange-400 ${
        checked 
          ? (isHot ? "bg-orange-600 border-orange-600 text-white shadow-lg" : "bg-gray-900 border-gray-900 text-white") 
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 shadow-sm"
      }`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{label}</span>
    </button>
  );
}