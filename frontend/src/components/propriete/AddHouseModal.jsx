import React, { useEffect, useState, useId, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Home, Banknote,
  Coffee, ShoppingBag, Zap, Droplet, Car, X,
  Flame, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2,
  ChevronDown, MapPin, Crosshair, Hash,
  ListChecks, LayoutGrid, Camera,
} from "lucide-react";
import API from "../../api/API";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_MB = 5;

const TABS = [
  { id: "general", label: "Général", icon: LayoutGrid },
  { id: "localisation", label: "Localisation", icon: MapPin },
  { id: "caracteristiques", label: "Caractéristiques", icon: ListChecks },
  { id: "photos", label: "Photos", icon: Camera },
];

export default function AddHouseModal({ isOpen, onClose, onSuccess, agenceId = null }) {
  const initialState = {
    agence: agenceId || "",
    quartier: "",
    typeOffre: "location",
    prix: "",
    codeReference: "",
    images: [],
    misEnAvant: false,
    statut: "disponible",
    etage: "",
    nombreChambres: "",
    nombreSallesBain: "",
    nombreSalons: "",
    cuisine: false,
    magasin: false,
    compteurEDMSepare: false,
    compteurEauSepare: false,
    coursUnique: false,
    motoParking: false,
    description: "",
    lat: "",
    lng: "",
  };

  const [form, setForm] = useState(initialState);
  const [activeTab, setActiveTab] = useState("general");
  const [previewImages, setPreviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [agences, setAgences] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [locatingMe, setLocatingMe] = useState(false);

  const modalTitleId = useId();
  const descriptionId = useId();
  const priceId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoadingRefData(true);
        try {
          const [v, q, a] = await Promise.all([
            API.getVilles(),
            API.getQuartiers(),
            API.getAllAgences()
          ]);
          setVilles(v); setQuartiers(q); setAgences(a);
        } catch (err) {
          console.error("Erreur chargement data:", err);
        } finally {
          setLoadingRefData(false);
        }
      };
      loadData();
      setActiveTab("general");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => previewImages.forEach((src) => URL.revokeObjectURL(src));
  }, [previewImages]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addFiles = useCallback((fileList) => {
    setImageError(null);
    const incoming = Array.from(fileList);
    const rejected = [];
    const valid = incoming.filter((file) => {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} : pas une image`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name} : dépasse ${MAX_IMAGE_SIZE_MB} Mo`);
        return false;
      }
      return true;
    });

    setForm((prev) => {
      const placesRestantes = MAX_IMAGES - prev.images.length;
      const accepted = valid.slice(0, placesRestantes);
      if (valid.length > accepted.length) {
        rejected.push(`Limite de ${MAX_IMAGES} photos atteinte`);
      }
      if (rejected.length > 0) setImageError(rejected.join(" · "));
      if (accepted.length === 0) return prev;
      setPreviewImages((prevPreviews) => [...prevPreviews, ...accepted.map((f) => URL.createObjectURL(f))]);
      return { ...prev, images: [...prev.images, ...accepted] };
    });
  }, []);

  const handleImages = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const newFiles = [...prev.images];
      newFiles.splice(index, 1);
      return { ...prev, images: newFiles };
    });
    setPreviewImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setImageError(null);
  };

  const utiliserMaPosition = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur ce navigateur.");
      return;
    }
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleChange("lat", pos.coords.latitude.toFixed(6));
        handleChange("lng", pos.coords.longitude.toFixed(6));
        setLocatingMe(false);
      },
      () => {
        setError("Impossible de récupérer votre position (autorisation refusée ou signal indisponible).");
        setLocatingMe(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.agence) {
      setActiveTab("general");
      setError("Veuillez sélectionner une agence.");
      return;
    }
    if (!form.prix || Number(form.prix) <= 0) {
      setActiveTab("general");
      setError("Le prix doit être supérieur à 0.");
      return;
    }
    if (!form.quartier) {
      setActiveTab("localisation");
      setError("Veuillez sélectionner un quartier.");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== 'images' && form[key] !== "") fd.append(key, form[key]);
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
      } else {
        setError("La création a échoué. Vérifiez les champs et réessayez.");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const prixFormate = form.prix
    ? new Intl.NumberFormat("fr-FR").format(Number(form.prix)) + " FCFA"
    : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-xl flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-7 h-7 object-contain" aria-hidden="true" />
            <h2 id={modalTitleId} className="text-lg font-bold text-gray-900 tracking-tight">Maison</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black outline-none focus:ring-2 focus:ring-orange-500"
          >
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
                activeTab === tab.id
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
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
              <SelectBlock label="Statut" value={form.statut} onChange={(v) => handleChange("statut", v)}>
                <option value="disponible">✅ Disponible</option>
                <option value="nonDisponible">❌ Pas disponible</option>
                <option value="reserve">🤝 Réservé</option>
              </SelectBlock>

              {agenceId === null && (
                <SelectBlock label="Agence" value={form.agence} onChange={(v) => handleChange("agence", v)} required disabled={loadingRefData}>
                  <option value="">{loadingRefData ? "Chargement..." : "Sélectionner une agence"}</option>
                  {agences.map(a => <option key={a._id} value={a._id}>{a.nom_agence}</option>)}
                </SelectBlock>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor={priceId} className="text-sm font-semibold text-gray-700 ml-1">Prix & Transaction</label>
                <div className="flex items-stretch border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-600 transition-colors">
                  <select
                    aria-label="Type de transaction"
                    value={form.typeOffre}
                    onChange={(e) => handleChange("typeOffre", e.target.value)}
                    className="bg-gray-50 border-r border-gray-200 px-3 text-sm text-gray-900 outline-none cursor-pointer"
                  >
                    <option value="location">Location</option>
                    <option value="vente">Vente</option>
                  </select>
                  <div className="relative flex-1 bg-white flex items-center">
                    <Banknote className="ml-3 text-gray-300" size={18} aria-hidden="true" />
                    <input
                      id={priceId}
                      type="number"
                      min="0"
                      placeholder="Montant"
                      required
                      className="w-full pl-2 pr-3 py-3 text-base text-gray-900 outline-none"
                      value={form.prix}
                      onChange={(e) => handleChange("prix", e.target.value)}
                    />
                    <span className="pr-3 text-xs font-medium text-gray-400">FCFA</span>
                  </div>
                </div>
                {prixFormate && <p className="text-xs text-gray-400 ml-1">{prixFormate}</p>}
              </div>

              <SelectBlock label="Position (si dans un ensemble)" value={form.etage} onChange={(v) => handleChange("etage", v)}>
                <option value="">Bien autonome (cours entière)</option>
                <option value={0}>Rez de chaussée</option>
                <option value={1}>1er étage</option>
                <option value={2}>2ème étage</option>
                <option value={3}>3ème étage</option>
                <option value={4}>4ème étage</option>
                <option value={5}>5ème étage et plus</option>
              </SelectBlock>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1.5">
                  <Hash size={14} className="text-gray-300" />
                  Référence interne <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: MAI-2026-014"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-orange-600 outline-none transition-colors"
                  value={form.codeReference}
                  onChange={(e) => handleChange("codeReference", e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "localisation" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-3">
                <SelectBlock label="Ville" value={villeSelected} onChange={(v) => { setVilleSelected(v); handleChange("quartier", ""); }} disabled={loadingRefData}>
                  <option value="">{loadingRefData ? "..." : "Sélectionner"}</option>
                  {villes.map(v => <option key={v._id} value={v._id}>{v.nom}</option>)}
                </SelectBlock>

                <SelectBlock
                  label="Quartier"
                  value={form.quartier}
                  onChange={(v) => handleChange("quartier", v)}
                  disabled={!villeSelected || loadingRefData}
                  required
                >
                  <option value="">Sélectionner</option>
                  {quartiers.filter(q => q.ville?._id === villeSelected).map(q => (
                    <option key={q._id} value={q._id}>{q.nom}</option>
                  ))}
                </SelectBlock>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    Coordonnées GPS <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
                  </span>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <button
                    type="button"
                    onClick={utiliserMaPosition}
                    disabled={locatingMe}
                    className="flex items-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    {locatingMe ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                    Utiliser ma position actuelle
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number" step="any" placeholder="Latitude" value={form.lat}
                      onChange={(e) => handleChange("lat", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-orange-600 outline-none"
                    />
                    <input
                      type="number" step="any" placeholder="Longitude" value={form.lng}
                      onChange={(e) => handleChange("lng", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-orange-600 outline-none"
                    />
                  </div>
                </div>
              </div>
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
                <label htmlFor={descriptionId} className="text-sm font-semibold text-gray-700 ml-1">Description libre</label>
                <textarea
                  id={descriptionId}
                  placeholder="Détails supplémentaires (état, accès, etc...)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:border-orange-600 outline-none h-24 transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Commodités incluses</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="group" aria-label="Liste des commodités">
                  <OptionCard label="Cuisine" checked={form.cuisine} icon={Coffee} onChange={(v) => handleChange("cuisine", v)} />
                  <OptionCard label="Magasin" checked={form.magasin} icon={ShoppingBag} onChange={(v) => handleChange("magasin", v)} />
                  <OptionCard label="EDM Sép." checked={form.compteurEDMSepare} icon={Zap} onChange={(v) => handleChange("compteurEDMSepare", v)} />
                  <OptionCard label="Eau Sép." checked={form.compteurEauSepare} icon={Droplet} onChange={(v) => handleChange("compteurEauSepare", v)} />
                  <OptionCard label="Unique" checked={form.coursUnique} icon={Home} onChange={(v) => handleChange("coursUnique", v)} />
                  <OptionCard label="Parking" checked={form.motoParking} icon={Car} onChange={(v) => handleChange("motoParking", v)} />
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
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`w-28 h-28 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group focus-within:ring-2 focus-within:ring-orange-500 ${
                      isDragging ? "border-orange-600 bg-orange-50" : "border-gray-300 bg-white hover:border-orange-500"
                    }`}
                  >
                    <ImageIcon size={28} className={`transition-colors ${isDragging ? "text-orange-600" : "text-gray-300 group-hover:text-orange-600"}`} aria-hidden="true" />
                    <span className="sr-only">Ajouter une photo</span>
                    <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                  </label>
                )}
                {previewImages.map((src, i) => (
                  <div key={src} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm border-2 border-white group">
                    <img src={src} className="w-full h-full object-cover" alt={`Prévisualisation ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Supprimer l'image ${i + 1}`}
                      className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              {imageError && <p role="alert" className="mt-3 text-xs font-semibold text-red-600">{imageError}</p>}
              <p className="mt-3 text-xs text-gray-400">Formats image, {MAX_IMAGE_SIZE_MB} Mo max par photo. Glissez-déposez ou cliquez pour choisir.</p>
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
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={18} /> Publication...</>
              ) : (
                <><CheckCircle2 size={18} /> Publier</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function NumberBox({ label, value, onChange }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold text-gray-500 text-center uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-center text-gray-900 text-lg focus:border-orange-600 focus:bg-white outline-none transition-colors"
        placeholder="0"
      />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children, disabled, required }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label htmlFor={id} className={`text-sm font-semibold text-gray-700 ml-1 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
        {label} {required && <span className="text-orange-600">*</span>}
        {disabled && <span className="sr-only">(Sélectionnez d'abord une ville)</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-required={required}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-orange-600 outline-none disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer transition-colors disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronDown size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${disabled ? 'opacity-30' : ''}`} />
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
        checked
          ? (isHot ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-900 border-gray-900 text-white")
          : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-semibold uppercase text-center leading-none">{label}</span>
    </button>
  );
}
