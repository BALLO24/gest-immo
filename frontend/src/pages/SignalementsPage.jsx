import { useEffect, useState } from "react";
import { Flag, Loader2, Building2 } from "lucide-react";
import API from "../api/API";
import toast from "react-hot-toast";

const MOTIF_LABELS = {
  fraude: "Annonce frauduleuse",
  deja_indisponible: "Bien déjà loué/vendu",
  informations_incorrectes: "Informations incorrectes",
  autre: "Autre",
};

const STATUT_OPTIONS = [
  { value: "nouveau", label: "Nouveau" },
  { value: "en_cours", label: "En cours" },
  { value: "traite", label: "Traité" },
  { value: "rejete", label: "Rejeté" },
];

const STATUT_STYLES = {
  nouveau: "bg-red-50 text-red-700 border-red-200",
  en_cours: "bg-amber-50 text-amber-700 border-amber-200",
  traite: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejete: "bg-slate-100 text-slate-500 border-slate-200",
};

// AJOUT : page entièrement nouvelle — réservée à l'admin (la modération
// d'annonces concerne la plateforme dans son ensemble, pas la gestion
// d'une agence en particulier).
export default function SignalementsPage() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSignalements = async () => {
    setLoading(true);
    setSignalements(await API.getSignalements());
    setLoading(false);
  };

  useEffect(() => { fetchSignalements(); }, []);

  const handleStatutChange = async (id, statut) => {
    setUpdatingId(id);
    const result = await API.updateStatutSignalement(id, statut);
    setUpdatingId(null);
    if (result.success) {
      setSignalements((prev) => prev.map((s) => (s._id === id ? { ...s, statut } : s)));
      toast.success("Statut mis à jour.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10">
      <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <Flag size={20} className="text-red-500" /> Signalements
      </h1>
      <p className="text-slate-400 text-sm mb-6">Annonces signalées par des visiteurs.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-orange-600" size={28} />
        </div>
      ) : signalements.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Aucun signalement pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <div key={s._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-red-600">{MOTIF_LABELS[s.motif]}</span>
                </div>
                {s.propriete && (
                  <p className="text-xs text-slate-400 truncate">
                    {s.propriete.__t} — {s.propriete.quartier?.nom}, {s.propriete.quartier?.ville?.nom}
                    {s.propriete.statut && <span className="ml-1.5 italic">(statut du bien : {s.propriete.statut})</span>}
                  </p>
                )}
                {s.agence?.nom_agence && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 size={11} /> {s.agence.nom_agence}
                  </p>
                )}
                {s.message && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-2.5">{s.message}</p>}
                {s.contactSignaleur && (
                  <p className="text-xs text-slate-400 mt-1.5">Contact du signaleur : {s.contactSignaleur}</p>
                )}
                <p className="text-xs text-slate-300 mt-1.5">{new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              <select
                value={s.statut}
                disabled={updatingId === s._id}
                onChange={(e) => handleStatutChange(s._id, e.target.value)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${STATUT_STYLES[s.statut]}`}
              >
                {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
