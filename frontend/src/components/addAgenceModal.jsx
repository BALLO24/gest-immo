import React, {useState } from "react";
import { createPortal } from "react-dom";
import { ImSpinner } from "react-icons/im";

import API from "../api/API";
import {
  Home,
  DollarSign,
  Users,
  Sofa,
} from "lucide-react";

export default function AddAgenceModal({ isOpen, onClose, onSuccess}) {
  const [form, setForm] = useState({
    nom_agence : "",
    nom_proprietaire: "",
    prenom_proprietaire : "",
    numero_telephone : "",
    email : "",
    statut: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);



  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.titre || !form.quartier || !form.prix) {
      setError("Veuillez remplir au minimum le titre, le quartier et le prix.");
      return;
    }

    const fd = new FormData();
    fd.append("nom_agence", form.nom_agence);
    fd.append("nom_proprietaire", form.nom_proprietaire);
    fd.append("prenom_proprietaire", form.prenom_proprietaire);
    fd.append("numero_telephone", form.numero_telephone);
    fd.append("email", form.email);
    fd.append("statut", form.statut);
    fd.append("description",form.description);


    try {
      setSubmitting(true);
      const response = await API.addHabitation(fd);
      if (response) {
        onSuccess("Maison ajoutée avec succès !");
        setForm({
          nom_agence : "",
          nom_proprietaire: "",
          prenom_proprietaire: "",
          numero_telephone : "",
          email : "",
          statut: "",
          description: "",
        });
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
          Ajouter une agence
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {error && <div className="col-span-2 text-sm bg-red-600/20 text-red-300 px-3 py-2 rounded">{error}</div>}
          {success && <div className="col-span-2 text-sm bg-green-600/20 text-green-300 px-3 py-2 rounded">{success}</div>}

          <FloatingInput
            label="Nom  de l'agence"
            type="text"
            value={form.nom_agence}
            onChange={(e) => handleChange("nom_agence", e.target.value)}
            icon={Home}
          />
          <FloatingInput
            label="Nom  du propriétaire"
            type="text"
            value={form.nom_proprietaire}
            onChange={(e) => handleChange("nom_proprietaire", e.target.value)}
            icon={Home}
          />

          <FloatingInput
            label="Téléphone"
            type="tel"
            value={form.numero_telephone1}
            onChange={(e) => handleChange("numero_telephone", e.target.value)}
            icon={DollarSign}
          />

          <FloatingInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            icon={Users}
          />

          <FloatingInput
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            icon={Sofa}
          />

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


