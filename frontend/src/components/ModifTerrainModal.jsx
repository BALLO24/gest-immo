import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  LandPlot, Banknote, X, Flame, 
  Image as ImageIcon, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, Maximize, Save, RefreshCw
} from "lucide-react";
import API from "../api/API";

export default function ModifTerrainModal({ isOpen, onClose, terrain, onSuccess }) {
  const [form, setForm] = useState({
    agence: "",
    quartier: "",
    prix: "",
    hot: false,
    statut: "disponible",
    documentTerrain: "Titre Foncier",
    dimensionTerrain: "",
    typeTerrain: "residentiel",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  useEffect(() => {
    if (isOpen && terrain) {
      setForm({
        agence: terrain.agence?._id || terrain.agence || "",
        quartier: terrain.quartier?._id || terrain.quartier || "",
        prix: terrain.prix || "",
        hot: terrain.hot || false,
        statut: terrain.statut || "disponible",
        documentTerrain: terrain.documentTerrain || "Titre Foncier",
        dimensionTerrain: terrain.dimensionTerrain || "",
        typeTerrain: terrain.typeTerrain || "residentiel",
        description: terrain.description || "",
      });
      setVilleSelected(terrain.quartier?.ville?._id || "");
      
      const loadLocality = async () => {
        try {
          const [v, q] = await Promise.all([API.getVilles(), API.getQuartiers()]);
          setVilles(v);
          setQuartiers(q);
        } catch (err) { console.error("Erreur localités:", err); }
      };
      loadLocality();
    }
  }, [isOpen, terrain]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // On utilise un objet simple si pas d'upload d'images, 
    // ou FormData si ton API l'exige systématiquement.
    const updateData = { ...form };

    try {
      const res = await API.updateHabitation(terrain._id, updateData);
      if (res) {
        onSuccess(res);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <LandPlot size={28} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Modifier Terrain</h2>
              <p className="text-gray-500 font-bold text-sm">Édition des informations foncières</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* GAUCHE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">01. Emplacement & Prix</h3>
              
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

              <InputBlock label="Prix Total (XOF)" icon={Banknote} value={form.prix} onChange={(v) => handleChange("prix", v)} type="number" />
              
              <SelectBlock label="Statut" value={form.statut} onChange={(v) => handleChange("statut", v)}>
                <option value="disponible">Disponible</option>
                <option value="vendu">Vendu</option>
              </SelectBlock>
            </div>

            {/* DROITE */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-4">02. Spécifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <InputBlock label="Dimension" icon={Maximize} value={form.dimensionTerrain} onChange={(v) => handleChange("dimensionTerrain", v)} />
                <SelectBlock label="Usage" value={form.typeTerrain} onChange={(v) => handleChange("typeTerrain", v)}>
                  <option value="residentiel">Résidentiel</option>
                  <option value="agricole">Agricole</option>
                </SelectBlock>
              </div>

              <SelectBlock label="Document" value={form.documentTerrain} onChange={(v) => handleChange("documentTerrain", v)}>
                <option value="Titre Foncier">Titre Foncier</option>
                <option value="Permis">Permis d'occuper</option>
                <option value="Lettre d'attribution">Lettre d'attribution</option>
              </SelectBlock>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-900 ml-1">Notes</label>
                <textarea 
                  className="w-full bg-white border-2 border-gray-300 rounded-2xl p-4 text-gray-900 font-bold focus:border-orange-600 outline-none h-[100px] transition-all resize-none shadow-sm"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* OPTIONS RAPIDES */}
          <div className="flex items-center gap-4">
             <button
              type="button"
              onClick={() => handleChange("hot", !form.hot)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all font-black text-sm ${
                form.hot ? "bg-orange-600 border-orange-600 text-white shadow-lg" : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              <Flame size={18} /> OPPORTUNITÉ 🔥
            </button>
          </div>

          {/* PHOTOS EN LECTURE SEULE - AVANT LE BOUTON */}
          <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Photos rattachées (Lecture seule)</h3>
            <div className="flex gap-4">
              {terrain?.images?.slice(0, 3).map((img, i) => (
                <div key={i} className="relative w-32 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                  <img src={img} className="w-full h-full object-cover grayscale-[0.5]" alt="terrain" />
                </div>
              ))}
              {(!terrain?.images || terrain.images.length === 0) && (
                <p className="text-sm font-bold text-gray-400 italic">Aucune image disponible</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-8 py-5 text-gray-500 font-black hover:text-black transition-colors">
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-5 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
              {submitting ? "SAUVEGARDE..." : "ENREGISTRER LES MODIFICATIONS"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// COMPOSANTS DE STYLE
function InputBlock({ label, icon: Icon, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-black text-gray-900 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
        <input 
          type={type} value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-900 font-bold focus:border-orange-600 outline-none transition-all shadow-sm"
        />
      </div>
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
          className="w-full appearance-none bg-white border-2 border-gray-300 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:border-orange-600 outline-none disabled:bg-gray-100 cursor-pointer transition-all shadow-sm"
        >
          {children}
        </select>
        <ChevronDown size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}