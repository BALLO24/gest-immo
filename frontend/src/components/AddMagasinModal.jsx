import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Store, MapPin, Banknote, Bath, X, Flame, 
  Image as ImageIcon, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, Zap, Droplet, MessageSquare
} from "lucide-react";
import API from "../api/API";

export default function AddMagasinModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    // titre: "",
    agence: agenceId || "",
    quartier: "",
    aLouer: true,
    prix: "",
    images: [],
    hot: false,
    toiletteInterne: "",
    statut: "disponible",
    position: "",
    compteurEDMSepare: false,
    compteurEauSepare: false,
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
    fd.append("type", "magasin");
    fd.append("agence", form.agence);
    // fd.append("titre", form.titre);
    fd.append("quartier", form.quartier);
    fd.append("aLouer", form.aLouer);
    fd.append("prix", form.prix);
    fd.append("position", form.position || "");
    fd.append("toiletteInterne", form.toiletteInterne || 0);
    fd.append("hot", form.hot);
    fd.append("statut", form.statut);
    fd.append("compteurEDMSepare", form.compteurEDMSepare);
    fd.append("compteurEauSepare", form.compteurEauSepare);
    fd.append("description", form.description);
    //fd.append("toiletteInterne", form.toiletteInterne);

    form.images.forEach((file) => fd.append("images", file));

    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Magasin ajouté avec succès !");
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-8 py-2 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-2 rounded-2xl">
              <Store size={28} className="text-orange-600" />
            </div>
            <div>
              <h2 className="sm:text-2xl font-black text-gray-900 tracking-tight">Ajouter un magasin</h2>
              {/* <p className="text-gray-500 font-bold text-sm">Nouvel espace commercial</p> */}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Localisation & Agence</h3>
              
              {/* <InputBlock label="Nom du Magasin / Titre" icon={Store} value={form.titre} onChange={(v) => handleChange("titre", v)} placeholder="Ex: Boutique Prêt-à-porter" /> */}
              
              {agenceId === null && <SelectBlock label="Agence" value={form.agence} onChange={(v) => handleChange("agence", v)}>
                <option value="">Sélectionner une agence</option>
                {agences.map(a => <option key={a._id} value={a._id}>{a.nom_agence}</option>)}
              </SelectBlock>}

              <div className="grid grid-cols-2 gap-4">
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

              {/* Transaction & Prix */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Prix & Type</label>
                <div className="flex items-stretch border-2 border-gray-300 rounded-2xl overflow-hidden focus-within:border-orange-600 transition-all shadow-sm">
                  <select 
                    value={form.aLouer} 
                    onChange={(e) => handleChange("aLouer", e.target.value === "true")}
                    className="bg-gray-50 border-r-2 border-gray-300 px-4 text-sm font-black text-gray-900 outline-none cursor-pointer"
                  >
                    <option value="true">Location</option>
                    <option value="false">Vente</option>
                  </select>
                  <div className="relative flex-1 bg-white flex items-center">
                    <Banknote className="ml-4 text-gray-400" size={20} />
                    <input type="number" placeholder="Prix (XOF)" className="w-full pl-3 pr-4 py-4 text-lg font-black text-gray-900 outline-none" value={form.prix} onChange={(e) => handleChange("prix", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">02. Caractéristiques</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <NumberBox label="Toilettes interne" value={form.toiletteInterne} onChange={(v) => handleChange("toiletteInterne", v)} />
                {/* <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 text-center uppercase tracking-tighter">Toilettes Internes</label>
                  <select 
                    value={form.toiletteInterne} 
                    onChange={(e) => handleChange("toiletteInterne", e.target.value === "true")}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-4 px-4 text-center font-black text-gray-900 text-base focus:border-orange-600 outline-none"
                  >
                    <option value="true">OUI</option>
                    <option value="false">NON</option>
                  </select>
                </div> */}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Description Commerciale</label>
                <textarea 
                  placeholder="Surface, visibilité, flux piéton, parking..."
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[155px] transition-all shadow-sm resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* COMMODITÉS */}
          <div className="pt-6 border-t-2 border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">03. Installations & Options</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <OptionCard label="Compteur EDM Séparé" checked={form.compteurEDMSepare} icon={Zap} onChange={(v) => handleChange("compteurEDMSepare", v)} />
              <OptionCard label="Compteur Eau Séparé" checked={form.compteurEauSepare} icon={Droplet} onChange={(v) => handleChange("compteurEauSepare", v)} />
              <OptionCard label="🔥 TOP EMPLACEMENT" checked={form.hot} icon={Flame} onChange={(v) => handleChange("hot", v)} isHot />
            </div>
          </div>

          {/* PHOTOS */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase mb-4 text-center">Photos Vitrine (Max 3)</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {previewImages.length < 3 && (
                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-400 bg-white hover:border-orange-600 transition-all cursor-pointer flex flex-col items-center justify-center group">
                  <ImageIcon size={32} className="text-gray-300 group-hover:text-orange-600 transition-colors" />
                  <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                </label>
              )}
              {previewImages.map((src, i) => (
                <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-white group">
                  <img src={src} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={28} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm shadow-lg shadow-red-200">
              <AlertCircle size={20} strokeWidth={3} /> {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-4 pt-4 pb-2">
            <button type="button" onClick={onClose} className="px-8 py-5 text-gray-500 font-black hover:text-black transition-colors">
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-5 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
              {submitting ? "ENREGISTREMENT..." : "PUBLIER LE MAGASIN"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// COMPOSANTS REUTILISABLES (Design System)
function InputBlock({ label, icon: Icon, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-black text-gray-900 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
        <input 
          type="text" value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );
}

function NumberBox({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[10px] font-black text-gray-500 text-center uppercase tracking-tighter">{label}</label>
      <input 
        type="number" value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-4 text-center font-black text-gray-900 text-xl focus:border-orange-600 outline-none transition-all"
        placeholder="0"
      />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm font-black text-gray-900 ml-1">{label}</label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none disabled:bg-gray-100 cursor-pointer transition-all shadow-sm"
        >
          {children}
        </select>
        <ChevronDown size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function OptionCard({ label, checked, onChange, icon: Icon, isHot }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
        checked 
          ? (isHot ? "bg-orange-600 border-orange-600 text-white shadow-lg" : "bg-gray-900 border-gray-900 text-white") 
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 shadow-sm"
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{label}</span>
    </button>
  );
}