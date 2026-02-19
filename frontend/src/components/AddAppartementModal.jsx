import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Home, MapPin, Banknote, Users, Bath, Sofa, 
  Coffee, ShoppingBag, Zap, Droplet, Car, X, 
  Flame, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2,
  ChevronDown, Wifi, Wind, Waves, Trees, Monitor
} from "lucide-react";
import API from "../api/API";

export default function AddAppartementModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    // titre: "",
    agence: agenceId || "",
    quartier: "",
    aLouer: true,
    prix: "",
    prixParJour: "",
    prixParHeure: "",
    images: [],
    hot: false,
    statut: "disponible",
    position: "",
    nombreChambres: "",
    nombreSallesBain: "",
    nombreSalon: "",
    cuisine: false,
    magasin: false,
    jardin: false,
    // piscine: false,
    meuble: false,
    climatisation: false,
    // balcon: false,
    connexionInternet: false,
    energieSecours: false,
    coursUnique: false,
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
    fd.append("type", "appartement");
    fd.append("agence", form.agence);
    // fd.append("titre", form.titre);
    fd.append("quartier", form.quartier);
    fd.append("aLouer", form.aLouer);
    fd.append("prix", form.prix);
    fd.append("prixParJour", form.prixParJour || 0);
    fd.append("prixParHeure", form.prixParHeure || 0);
    fd.append("hot", form.hot);
    fd.append("statut", form.statut);
    fd.append("position", form.position || "");
    fd.append("nombreChambres", form.nombreChambres || 0);
    fd.append("nombreSallesBain", form.nombreSallesBain || 0);
    fd.append("nombreSalon", form.nombreSalon || 0);
    fd.append("cuisine", form.cuisine);
    fd.append("magasin", form.magasin);
    // fd.append("jardin", form.jardin);
    // fd.append("piscine", form.piscine);
    fd.append("meuble", form.meuble);
    fd.append("climatisation", form.climatisation);
    // fd.append("balcon", form.balcon);
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-8 py-2 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-2 rounded-2xl">
              <Sofa size={28} className="text-orange-600" />
            </div>
            <div>
              <h2 className="sm:text-2xl font-black text-gray-900 tracking-tight">Ajouter un appartement</h2>
              {/* <p className="text-gray-500 font-bold text-sm">Nouveau référencement immobilier</p> */}
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
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Informations Globales</h3>
              
              {/* <InputBlock label="Titre de l'annonce" icon={Home} value={form.titre} onChange={(v) => handleChange("titre", v)} placeholder="Ex: Studio Meublé ACI 2000" /> */}
              
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
                <SelectBlock label="Position" value={form.position} onChange={(v) => handleChange("position", v)}>
                  <option value="">Sélectionner</option>
                <option value={0}>Rez de chaussée</option>
                <option value={1}>1er étage</option>
                <option value={2}>2ème étage</option>
                <option value={3}>3ème étage</option>
                <option value={4}>4ème étage</option>
                <option value={5}>5ème étage et plus</option>
                </SelectBlock>


              {/* Tarification Multi-options */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-gray-900 ml-1">Prix & Transaction</label>
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
                      <input type="number" placeholder="Prix / Mois" className="w-full pl-3 pr-4 py-4 text-lg font-black text-gray-900 outline-none" value={form.prix} onChange={(e) => handleChange("prix", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Prix / Jour</label>
                    <input type="number" placeholder="0" className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-orange-600 outline-none" value={form.prixParJour} onChange={(e) => handleChange("prixParJour", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Prix / Heure</label>
                    <input type="number" placeholder="0" className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-900 focus:border-orange-600 outline-none" value={form.prixParHeure} onChange={(e) => handleChange("prixParHeure", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">02. Détails & Description</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <NumberBox label="Chambres" value={form.nombreChambres} onChange={(v) => handleChange("nombreChambres", v)} />
                <NumberBox label="Salons" value={form.nombreSalon} onChange={(v) => handleChange("nombreSalon", v)} />
                <NumberBox label="Douches" value={form.nombreSallesBain} onChange={(v) => handleChange("nombreSallesBain", v)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Description</label>
                <textarea 
                  placeholder="Équipements, services inclus, accessibilité..."
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[155px] transition-all resize-none shadow-sm"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* COMMODITÉS */}
          <div className="pt-6 border-t-2 border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">03. Commodités de l'appartement</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <OptionCard label="Cuisine" checked={form.cuisine} icon={Coffee} onChange={(v) => handleChange("cuisine", v)} />
              <OptionCard label="Meublé" checked={form.meuble} icon={Monitor} onChange={(v) => handleChange("meuble", v)} />
              <OptionCard label="Clim" checked={form.climatisation} icon={Wind} onChange={(v) => handleChange("climatisation", v)} />
              <OptionCard label="Wifi" checked={form.connexionInternet} icon={Wifi} onChange={(v) => handleChange("connexionInternet", v)} />
              {/* <OptionCard label="Piscine" checked={form.piscine} icon={Waves} onChange={(v) => handleChange("piscine", v)} /> */}
              {/* <OptionCard label="Jardin" checked={form.jardin} icon={Trees} onChange={(v) => handleChange("jardin", v)} /> */}
              {/* <OptionCard label="Balcon" checked={form.balcon} icon={Home} onChange={(v) => handleChange("balcon", v)} /> */}
              <OptionCard label="Groupe" checked={form.energieSecours} icon={Zap} onChange={(v) => handleChange("energieSecours", v)} />
              <OptionCard label="Unique" checked={form.coursUnique} icon={MapPin} onChange={(v) => handleChange("coursUnique", v)} />
              <OptionCard label="🔥 HOT" checked={form.hot} icon={Flame} onChange={(v) => handleChange("hot", v)} isHot />
            </div>
          </div>

          {/* PHOTOS */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-900 uppercase mb-4">Photos (Max 3)</h3>
            <div className="flex flex-wrap gap-4">
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
              {submitting ? "ENREGISTREMENT..." : "PUBLIER L'APPARTEMENT"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// RÉUTILISATION DES COMPOSANTS DE STYLE (InputBlock, NumberBox, etc.)
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
          className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none transition-all"
        />
      </div>
    </div>
  );
}

function NumberBox({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
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
          className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold text-base focus:border-orange-600 outline-none disabled:bg-gray-100 cursor-pointer transition-all"
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
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter">{label}</span>
    </button>
  );
}