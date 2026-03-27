import React, { useEffect, useState, useId } from "react";
import { createPortal } from "react-dom";
import { 
  Home, Banknote, 
  Coffee, ShoppingBag, Zap, Droplet, Car, X, 
  Flame, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2,
  ChevronDown,
} from "lucide-react";
import API from "../api/API";

export default function AddHouseModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    agence: agenceId || "",
    quartier: "",
    aLouer: true,
    prix: "",
    images: [],
    hot: false,
    statut: "disponible",
    position: "",
    nombreChambres: "",
    nombreSallesBain: "",
    nombreSalon: "",
    cuisine: false,
    magasin: false,
    compteurEDMSepare: false,
    compteurEauSepare: false,
    coursUnique: false,
    motoParking: false,
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

  const modalTitleId = useId();
  const descriptionId = useId();
  const priceId = useId();

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
      setError("Veuillez remplir au minimum le nom de l'agence, le quartier et le prix.");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== 'images') fd.append(key, form[key]);
    });
    fd.append("type", "maison");
    form.images.forEach((file) => fd.append("images", file));

    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Maison ajoutée avec succès !");
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
      aria-labelledby={modalTitleId}
    >
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="px-8 py-4 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div aria-hidden="true">
              {/* <Home size={28} className="text-orange-600" /> */}
              <img src="/logo.png" alt="logo immo" className="w-7 h-7 object-contain -mt-1" aria-hidden="true" />
            </div>
            <h2 id={modalTitleId} className="text-lg font-black text-gray-900 tracking-tight">
              Maison
            </h2>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Fermer la fenêtre"
            className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-orange-500"
          >
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Informations Globales</h3>
              
              <SelectBlock 
                label="Statut" 
                value={form.statut} 
                onChange={(v) => handleChange("statut", v)}
              >
                <option value="disponible">✅ Disponible</option>
                <option value="pas disponible">❌ Pas disponible</option>
              </SelectBlock>

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
                
                <SelectBlock 
                  label="Quartier" 
                  value={form.quartier} 
                  onChange={(v) => handleChange("quartier", v)} 
                  disabled={!villeSelected}
                  required
                >
                  <option value="">Sélectionner</option>
                  {quartiers.filter(q => q.ville?._id === villeSelected).map(q => (
                    <option key={q._id} value={q._id}>{q.nom}</option>
                  ))}
                </SelectBlock>
              </div>

              <SelectBlock label="Position" value={form.position} onChange={(v) => handleChange("position", v)}>
                <option value="">Sélectionner (Étage)</option>
                <option value={0}>Rez de chaussée</option>
                <option value={1}>1er étage</option>
                <option value={2}>2ème étage</option>
                <option value={3}>3ème étage</option>
                <option value={4}>4ème étage</option>
                <option value={5}>5ème étage et plus</option>
              </SelectBlock>

              <div className="flex flex-col gap-2">
                <label htmlFor={priceId} className="text-sm font-black text-gray-900 ml-1">Prix & Transaction</label>
                <div className="flex items-stretch border-2 border-gray-300 rounded-2xl overflow-hidden focus-within:border-orange-600 transition-all shadow-sm">
                  <select 
                    aria-label="Type de transaction"
                    value={form.aLouer} 
                    onChange={(e) => handleChange("aLouer", e.target.value === "true")}
                    className="bg-gray-50 border-r-2 border-gray-300 px-4 text-sm font-black text-gray-900 outline-none cursor-pointer"
                  >
                    <option value="true">Location</option>
                    <option value="false">Vente</option>
                  </select>
                  <div className="relative flex-1 bg-white flex items-center">
                    <Banknote className="ml-4 text-gray-400" size={20} aria-hidden="true" />
                    <input 
                      id={priceId}
                      type="number"
                      placeholder="Montant"
                      required
                      className="w-full pl-3 pr-4 py-4 text-lg font-black text-gray-900 outline-none"
                      value={form.prix}
                      onChange={(e) => handleChange("prix", e.target.value)}
                    />
                    <span className="pr-4 text-xs font-black text-gray-400" aria-label="Francs CFA">FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">02. Détails du Bien</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <NumberBox label="Chambres" value={form.nombreChambres} onChange={(v) => handleChange("nombreChambres", v)} />
                <NumberBox label="Salons" value={form.nombreSalon} onChange={(v) => handleChange("nombreSalon", v)} />
                <NumberBox label="Douches" value={form.nombreSallesBain} onChange={(v) => handleChange("nombreSallesBain", v)} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={descriptionId} className="text-sm font-black text-gray-900 ml-1">Description libre</label>
                <textarea 
                  id={descriptionId}
                  placeholder="Détails supplémentaires (état, accès, etc...)"
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[115px] transition-all resize-none shadow-sm"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">03. Commodités incluses</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" role="group" aria-label="Liste des commodités">
              <OptionCard label="Cuisine" checked={form.cuisine} icon={Coffee} onChange={(v) => handleChange("cuisine", v)} />
              <OptionCard label="Magasin" checked={form.magasin} icon={ShoppingBag} onChange={(v) => handleChange("magasin", v)} />
              <OptionCard label="EDM Sép." checked={form.compteurEDMSepare} icon={Zap} onChange={(v) => handleChange("compteurEDMSepare", v)} />
              <OptionCard label="Eau Sép." checked={form.compteurEauSepare} icon={Droplet} onChange={(v) => handleChange("compteurEauSepare", v)} />
              <OptionCard label="Unique" checked={form.coursUnique} icon={Home} onChange={(v) => handleChange("coursUnique", v)} />
              <OptionCard label="Parking" checked={form.motoParking} icon={Car} onChange={(v) => handleChange("motoParking", v)} />
              <OptionCard label="🔥 HOT" checked={form.hot} icon={Flame} onChange={(v) => handleChange("hot", v)} isHot />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase mb-4">Photos (Max 3)</h3>
            <div className="flex flex-wrap gap-4">
              {previewImages.length < 3 && (
                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-400 bg-white hover:border-orange-600 transition-all cursor-pointer flex flex-col items-center justify-center group focus-within:ring-2 focus-within:ring-orange-500">
                  <ImageIcon size={32} className="text-gray-300 group-hover:text-orange-600 transition-colors" aria-hidden="true" />
                  <span className="sr-only">Ajouter une photo</span>
                  <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                </label>
              )}
              {previewImages.map((src, i) => (
                <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white group">
                  <img src={src} className="w-full h-full object-cover" alt={`Prévisualisation ${i + 1}`} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)} 
                    aria-label={`Supprimer l'image ${i + 1}`}
                    className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div 
              role="alert" 
              className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm shadow-lg shadow-red-200"
            >
              <AlertCircle size={20} strokeWidth={3} aria-hidden="true" /> {error}
            </div>
          )}

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
              className="flex-1 py-4 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-sm sm:text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 outline-none focus:ring-4 focus:ring-orange-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                  <span>...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} aria-hidden="true" />
                  <span>PUBLIER</span>
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

// --- SOUS-COMPOSANTS ---

function NumberBox({ label, value, onChange }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] font-black text-gray-500 text-center uppercase tracking-tighter">
        {label}
      </label>
      <input 
        id={id}
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-4 text-center font-black text-gray-900 text-xl focus:border-orange-600 focus:bg-white outline-none transition-all"
        placeholder="0"
      />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled, required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label htmlFor={id} className={`text-sm font-black text-gray-900 ml-1 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
        {label} {required && <span className="text-orange-600" aria-hidden="true">*</span>}
        {disabled && <span className="sr-only">(Sélectionnez d'abord une ville)</span>}
      </label>
      <div className="relative">
        <select 
          id={id}
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-required={required}
          className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer transition-all disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronDown size={22} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${disabled ? 'opacity-30' : ''}`} aria-hidden="true" />
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
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{label}</span>
    </button>
  );
}