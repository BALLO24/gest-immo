import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImSpinner } from "react-icons/im";
import API from "../api/API";
import {
  Home,
  DollarSign,
  Sofa,
  X,
  Flame,
} from "lucide-react";

export default function AddTerrainModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    titre: "",
    quartier: "",
    aLouer:false,
    prix: "",
    images: [],
    hot: false,
    statut: "disponible",
    documentTerrain: null,
    dimensionTerrain: "",
    typeTerrain: "",
    description: "",
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");

  useEffect(() => {
    fetchVilles();
    fetchQuartiers();
  }, []);

  const fetchVilles = async () => {
    try {
      const data = await API.getVilles();
      setVilles(data);
    } catch (err) {
      console.error("Erreur récupération villes:", err);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const data = await API.getQuartiers();
      setQuartiers(data);
    } catch (err) {
      console.error("Erreur récupération quartiers:", err);
    }
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setForm((prev) => ({ ...prev, images: files }));
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    const newFiles = [...form.images];
    const newPreviews = [...previewImages];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setForm((prev) => ({ ...prev, images: newFiles }));
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.titre || !form.quartier || !form.prix) {
      setError("Veuillez remplir au minimum le titre, le quartier et le prix.");
      return;
    }

    const fd = new FormData();
    fd.append("type", "terrain");
    fd.append("titre", form.titre);
    fd.append("quartier", form.quartier);
    fd.append("aLouer",false)
    fd.append("prix", form.prix);
    fd.append("hot", form.hot);
    fd.append("statut", form.statut);
    fd.append("documentTerrain", form.documentTerrain);
    fd.append("dimensionTerrain", form.dimensionTerrain);
    fd.append("typeTerrain", form.typeTerrain);
    fd.append("description",form.description);

    form.images.forEach((file) => fd.append("images", file));

    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Terrain ajouté avec succès !");
        setForm({
            titre: "",
            quartier: "",
            aLouer:false,
            prix: "",
            dimension:"",
            images: [],
            hot: false,
            statut: "disponible",
            dimensionTerrain: "",
            typeTerrain: "",
            description: "",
        });
        setPreviewImages([]);
        setVilleSelected("");
        setSubmitting(false);
        setSuccess(true);
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.message || "Erreur lors de la création");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50">
      <div className="bg-gray-900 text-white rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-maliOrange transition text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-maliOrange">
          Ajouter un terrain
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {error && <div className="col-span-2 text-sm bg-red-600/20 text-red-300 px-3 py-2 rounded">{error}</div>}
          {success && <div className="col-span-2 text-sm bg-green-600/20 text-green-300 px-3 py-2 rounded">{success}</div>}

          {/* Titre */}
          <FloatingInput
            label="Titre"
            type="text"
            value={form.titre}
            onChange={(e) => handleChange("titre", e.target.value)}
            icon={Home}
          />

          {/* Ville */}
          <div>
            <label className="block text-white font-semibold mb-1">Ville</label>
            <select
              value={villeSelected}
              className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
              onChange={(e) => {
                setVilleSelected(e.target.value);
                handleChange("quartier", ""); // reset quartier
              }}
            >
              <option value="" disabled>Choisir une ville</option>
              {villes.map((ville) => (
                <option key={ville._id} value={ville._id}>{ville.nom}</option>
              ))}
            </select>
          </div>

          {/* Quartier */}
          <div>
            <label className="block text-white font-semibold mb-1">Quartier</label>
            <select
              value={form.quartier}
              className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
              onChange={(e) => handleChange("quartier", e.target.value)}
              disabled={!villeSelected}
            >
              <option value="" disabled>Choisir un quartier</option>
              {quartiers
                .filter((q) => q.ville && q.ville._id === villeSelected)
                .map((q) => (
                  <option key={q._id} value={q._id}>{q.nom}</option>
                ))}
            </select>
          </div>

          {/* Prix */}
          <FloatingInput
            label="Prix (XOF)"
            type="number"
            value={form.prix}
            onChange={(e) => handleChange("prix", e.target.value)}
            icon={DollarSign}
          />
          {/* Dimension */}
          <FloatingInput
            label="Dimension"
            type="text"
            value={form.dimensionTerrain}
            onChange={(e) => handleChange("dimensionTerrain", e.target.value)}
            icon={DollarSign}
          />
          
            {/* Type de papier */}
           <div>
              <label className="block text-white font-semibold mb-1">Type de papier</label>
              <select 
                  name="documentTerrain" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>handleChange("documentTerrain", e.target.value)}
              >
                <option value="Titre Foncier" className="bg-maliOrange/60" >Titre Foncier</option>
                <option value="Titre Provisoire" className="bg-maliOrange/60" >Titre Provisoire</option>
                <option value="Permis" className="bg-maliOrange/60" >Permis</option>
                <option value="Bulletin" className="bg-maliOrange/60" >Bulletin</option>
                <option value="Lettre d'attribution" className="bg-maliOrange/60" >Lettre d'attribution</option>
                <option value="Autre" className="bg-maliOrange/60" >Autre</option>
              </select>
            </div>

            {/* Type de terrain */}
           <div>
              <label className="block text-white font-semibold mb-1">Type de terrain</label>
              <select 
                  name="typeTerrain" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>handleChange("typeTerrain", e.target.value)}
              >
                <option value="residentiel" className="bg-maliOrange/60" >residentiel</option>
                <option value="agricole" className="bg-maliOrange/60" >agricole</option>
              </select>
            </div>

          {/* Checkboxes */}
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <Checkbox label="Mettre en avant" checked={form.hot} onChange={(v) => handleChange("hot", v)} icon={Flame} />
          </div>
          <FloatingInput
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            icon={Sofa}
          />


          {/* Images */}
          <div className="col-span-2">
            <label className="block mb-1 text-white/70">Images (max 3)</label>
            <input type="file" multiple accept="image/*" onChange={handleImages} className="w-full bg-gray-800 p-2 rounded-lg" />
            {previewImages.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover rounded-lg shadow" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`${submitting ? "cursor-not-allowed" : ""} col-span-2 mt-4 px-6 py-2 bg-maliOrange hover:bg-maliOrange/90 rounded-xl font-semibold`}
            disabled={submitting}
          >
            {submitting ? <ImSpinner className="animate-spin inline-block w-5 h-5 mr-2" /> : "Ajouter"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

function FloatingInput({ label, icon: Icon, value, onChange, type }) {
  return (
    <div className="relative w-full">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-maliOrange" size={18} />}
      <input type={type} value={value} onChange={onChange} placeholder=" " className="w-full bg-gray-800 text-white rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-maliOrange peer" />
      <label className={`absolute left-10 transition-all duration-200 pointer-events-none ${value ? "-top-2.5 text-maliOrange text-xs bg-gray-900 px-1" : "top-3 text-white/50 text-sm"} peer-focus:-top-2.5 peer-focus:text-maliOrange peer-focus:text-xs peer-focus:bg-gray-900 peer-focus:px-1`}>
        {label}
      </label>
    </div>
  );
}

function Checkbox({ label, checked, onChange, icon: Icon }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-maliOrange w-4 h-4 md:w-5 md:h-5" />
      {Icon && <Icon className="text-maliOrange" size={16} />}
      <span className="text-white">{label}</span>
    </label>
  );
}
