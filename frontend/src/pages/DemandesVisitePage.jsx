import { useEffect, useState } from "react";
import { CalendarClock, Phone, User, Loader2, Building2 } from "lucide-react";
import API from "../api/API";
import toast from "react-hot-toast";

const STATUT_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "effectuee", label: "Effectuée" },
  { value: "annulee", label: "Annulée" },
];

const STATUT_STYLES = {
  en_attente: "bg-amber-50 text-amber-700 border-amber-200",
  confirmee: "bg-blue-50 text-blue-700 border-blue-200",
  effectuee: "bg-emerald-50 text-emerald-700 border-emerald-200",
  annulee: "bg-red-50 text-red-700 border-red-200",
};

// AJOUT : page entièrement nouvelle — jusqu'ici, une demande de visite se
// faisait uniquement via WhatsApp, sans aucune trace ni suivi possible côté
// agence ou admin. Le backend limite déjà les résultats à l'agence
// connectée (sauf pour un admin, qui voit tout), donc ce composant est
// partagé entre les deux contextes sans logique supplémentaire ici.
export default function DemandesVisitePage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDemandes = async () => {
    setLoading(true);
    setDemandes(await API.getDemandesVisite());
    setLoading(false);
  };

  useEffect(() => { fetchDemandes(); }, []);

  const handleStatutChange = async (id, statut) => {
    setUpdatingId(id);
    const result = await API.updateStatutDemandeVisite(id, statut);
    setUpdatingId(null);
    if (result.success) {
      setDemandes((prev) => prev.map((d) => (d._id === id ? { ...d, statut } : d)));
      toast.success("Statut mis à jour.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10">
      <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <CalendarClock size={20} className="text-orange-600" /> Demandes de visite
      </h1>
      <p className="text-slate-400 text-sm mb-6">Les demandes envoyées depuis les fiches de biens.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-orange-600" size={28} />
        </div>
      ) : demandes.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Aucune demande de visite pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => (
            <div key={d._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-slate-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-800 truncate">{d.nomClient}</p>
                  <span className="text-slate-300">·</span>
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-500">{d.telephoneClient}</p>
                </div>
                {d.propriete && (
                  <p className="text-xs text-slate-400 truncate">
                    {d.propriete.__t} — {d.propriete.quartier?.nom}, {d.propriete.quartier?.ville?.nom}
                  </p>
                )}
                {d.agence?.nom_agence && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 size={11} /> {d.agence.nom_agence}
                  </p>
                )}
                {d.dateSouhaitee && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date souhaitée : {new Date(d.dateSouhaitee).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>

              <select
                value={d.statut}
                disabled={updatingId === d._id}
                onChange={(e) => handleStatutChange(d._id, e.target.value)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${STATUT_STYLES[d.statut]}`}
              >
                {STATUT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
