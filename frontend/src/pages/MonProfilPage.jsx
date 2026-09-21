import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, Mail, Building2, MapPin, Image, TextQuote, ArrowLeft, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/API";

// AJOUT : page qui manquait entièrement — il n'existait aucun moyen pour une
// agence connectée de consulter ou modifier son propre profil (contact
// public, adresse, logo...) sans passer par un admin. Branchée sur
// GET/PUT /api/auth/profile, qui existaient côté backend mais n'étaient
// appelés par rien côté frontend.
export default function MonProfilPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isAgence, setIsAgence] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    numero_telephone: "",
    email: "",
    nom_agence: "",
    nom_proprietaire: "",
    description: "",
    telephonePublic: "",
    emailPublic: "",
    adresse: "",
    logo: "",
  });

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return navigate("/login");

      const user = await API.getProfile();
      if (!user) {
        setNotice({ type: "error", text: "Impossible de charger votre profil." });
        setLoading(false);
        return;
      }

      setIsAgence(user.role === "agence" && !!user.agence);
      setForm({
        nom: user.nom || "",
        numero_telephone: user.numero_telephone || "",
        email: user.email || "",
        nom_agence: user.agence?.nom_agence || "",
        nom_proprietaire: user.agence?.nom_proprietaire || "",
        description: user.agence?.description || "",
        telephonePublic: user.agence?.telephonePublic || "",
        emailPublic: user.agence?.emailPublic || "",
        adresse: user.agence?.adresse || "",
        logo: user.agence?.logo || "",
      });
      setLoading(false);
    })();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const result = await API.updateProfile(form);
    setSaving(false);

    // CORRIGÉ : la confirmation était un encart fixe dans la page (il fallait
    // remonter en haut pour la voir). Un toast est plus visible et cohérent
    // avec le reste de l'app (déjà utilisé sur les cartes de biens).
    if (result.success) {
      toast.success(result.message || "Profil mis à jour avec succès.");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-maliOrange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-6"
        >
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Mon profil</h1>
          <p className="text-sm text-gray-500 mb-6">
            Gérez vos identifiants de connexion{isAgence && " et les informations publiques de votre agence"}.
          </p>

          {notice && (
            <div className={`mb-6 text-sm px-4 py-3 rounded-md ${notice.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-maliOrange">Identifiants de connexion</h2>
              <Field label="Votre nom" icon={User} value={form.nom} onChange={(v) => handleChange("nom", v)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Téléphone de connexion" icon={Phone} type="tel" value={form.numero_telephone} onChange={(v) => handleChange("numero_telephone", v)} />
                <Field label="Email de connexion" icon={Mail} type="email" value={form.email} onChange={(v) => handleChange("email", v)} />
              </div>
              <p className="text-xs text-gray-400">
                Pour changer votre mot de passe, rendez-vous sur la page <Link to="/change" className="text-maliOrange underline">dédiée</Link>.
              </p>
            </section>

            {isAgence && (
              <section className="space-y-4 pt-6 border-t border-gray-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-maliOrange">Profil de l'agence</h2>
                <Field label="Nom de l'agence" icon={Building2} value={form.nom_agence} onChange={(v) => handleChange("nom_agence", v)} />
                <Field label="Nom du responsable" icon={User} value={form.nom_proprietaire} onChange={(v) => handleChange("nom_proprietaire", v)} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Téléphone public (annonces)"
                    icon={Phone}
                    type="tel"
                    value={form.telephonePublic}
                    onChange={(v) => handleChange("telephonePublic", v)}
                    hint="Visible par les clients sur vos annonces"
                  />
                  <Field
                    label="Email public (annonces)"
                    icon={Mail}
                    type="email"
                    value={form.emailPublic}
                    onChange={(v) => handleChange("emailPublic", v)}
                    hint="Visible par les clients sur vos annonces"
                  />
                </div>

                <Field label="Adresse du siège" icon={MapPin} value={form.adresse} onChange={(v) => handleChange("adresse", v)} />
                <Field label="Logo (URL de l'image)" icon={Image} value={form.logo} onChange={(v) => handleChange("logo", v)} placeholder="https://..." />

                <label className="block text-sm">
                  <span className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                    <TextQuote size={16} /> Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-maliOrange text-sm resize-none"
                  />
                </label>
              </section>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-maliOrange text-white font-semibold hover:bg-maliOcre transition disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text", placeholder, hint }) {
  return (
    <label className="block text-sm">
      <span className="flex items-center gap-2 text-gray-700 font-medium mb-1">
        <Icon size={16} /> {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-maliOrange text-sm"
      />
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}
