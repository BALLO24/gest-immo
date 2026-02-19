import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  Home, MapPin, Banknote, Users, Bath, Sofa, 
  Coffee, ShoppingBag, Zap, Droplet, Car, X, 
  Flame, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2,
  ChevronDown, Pencil
} from "lucide-react";
import API from "../api/API";

export default function ModifHouseModal({ isOpen, onClose, onSuccess, maison }) {
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  useEffect(() => {
    if (isOpen && maison) {
      setForm({
        ...maison,
        agence: maison.agence?._id || maison.agence,
        quartier: maison.quartier?._id || maison.quartier,
        statut: maison.statut === "nonDisponible" ? "nonDisponible" : "disponible"
      });
      setVilleSelected(maison.quartier?.ville?._id || "");

      const loadData = async () => {
        try {
          const [v, q] = await Promise.all([API.getVilles(), API.getQuartiers()]);
          setVilles(v);
          setQuartiers(q);
        } catch (err) { console.error("Erreur chargement data:", err); }
      };
      loadData();
    }
  }, [isOpen, maison]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.quartier || !form.prix) {
      setError("Le quartier et le prix sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const { images, __v, _id, ...payload } = form;
      const finalPayload = {
        ...payload,
        prix: Number(payload.prix),
        nombreChambres: Number(payload.nombreChambres || 1),
        nombreSallesBain: Number(payload.nombreSallesBain || 1),
        nombreSalon: Number(payload.nombreSalon || 1),
      };

      const response = await API.updateHabitation(maison._id, finalPayload);
      
      if (response) {
        onSuccess(response); 
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !form) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl"><Pencil size={28} className="text-blue-600" /></div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Modifier le bien</h2>
              <p className="text-gray-500 font-bold text-sm">Réf: #{maison._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Informations Globales</h3>
              <SelectBlock label="Statut du bien" value={form.statut} onChange={(v) => handleChange("statut", v)}>
                  <option value="disponible">✅ Disponible</option>
                  <option value="nonDisponible">❌ Pas disponible</option>
              </SelectBlock>

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
                    <input 
                      type="number"
                      className="w-full pl-3 pr-4 py-4 text-lg font-black text-gray-900 outline-none"
                      value={form.prix || ""}
                      onChange={(e) => handleChange("prix", e.target.value)}
                    />
                    <span className="pr-4 text-xs font-black text-gray-400">FCFA</span>
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
                <label className="text-sm font-black text-gray-900 ml-1">Description libre</label>
                <textarea 
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[115px] transition-all resize-none shadow-sm"
                  value={form.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* COMMODITÉS */}
          <div className="pt-6 border-t-2 border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">03. Commodités incluses</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <OptionCard label="Cuisine" checked={form.cuisine} icon={Coffee} onChange={(v) => handleChange("cuisine", v)} />
              <OptionCard label="Magasin" checked={form.magasin} icon={ShoppingBag} onChange={(v) => handleChange("magasin", v)} />
              <OptionCard label="EDM Sép." checked={form.compteurEDMSepare} icon={Zap} onChange={(v) => handleChange("compteurEDMSepare", v)} />
              <OptionCard label="Eau Sép." checked={form.compteurEauSepare} icon={Droplet} onChange={(v) => handleChange("compteurEauSepare", v)} />
              <OptionCard label="Unique" checked={form.coursUnique} icon={Home} onChange={(v) => handleChange("coursUnique", v)} />
              <OptionCard label="Parking" checked={form.motoParking} icon={Car} onChange={(v) => handleChange("motoParking", v)} />
              <OptionCard label="🔥 HOT" checked={form.hot} icon={Flame} onChange={(v) => handleChange("hot", v)} isHot />
            </div>
          </div>

          {/* PHOTOS (LECTURE SEULE) */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Photos actuelles</h3>
            <div className="flex flex-wrap gap-4">
              {form.images?.map((src, i) => (
                <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                  <img src={src} className="w-full h-full object-cover grayscale-[0.3] cursor-not-allowed" alt="habitation" />
                </div>
              ))}
            </div>
          </div>

          {error && <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 font-black text-sm"><AlertCircle size={20} /> {error}</div>}

          <div className="flex items-center gap-4 pt-4 pb-2">
            <button type="button" onClick={onClose} className="px-8 py-5 text-gray-500 font-black">ANNULER</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-5 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
              {submitting ? "MODIFICATION..." : "ENREGISTRER LES MODIFICATIONS"}
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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-gray-500 text-center uppercase">{label}</label>
      <input type="number" value={value || 0} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-4 text-center font-black text-gray-900 text-xl focus:border-orange-600 outline-none" />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm font-black text-gray-900 ml-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:border-orange-600 outline-none disabled:bg-gray-100 cursor-pointer transition-all">
          {children}
        </select>
        <ChevronDown size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function OptionCard({ label, checked, onChange, icon: Icon, isHot }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${checked ? (isHot ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-900 border-gray-900 text-white") : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"}`}>
      <Icon size={20} />
      <span className="text-[10px] font-black uppercase text-center">{label}</span>
    </button>
  );
}