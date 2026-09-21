import React from "react";
import { createPortal } from "react-dom";
import { Building2, MapPin, Phone, Mail, X, Calendar, ShieldCheck } from "lucide-react";

const STATUT_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-amber-50 text-amber-700",
  suspendue: "bg-red-50 text-red-700",
};
const STATUT_LABEL = { active: "Active", inactive: "En attente", suspendue: "Suspendue" };

export default function DetailsModalAgence({ isOpen, onClose, agence }) {
  if (!isOpen || !agence) return null;

  // CORRIGÉ (bug) : la version précédente lisait agence.nomAgence,
  // agence.telephone, agence.email, agence.anneeCreation, agence.totalBiens,
  // agence.nombreAgents — aucun de ces champs n'existe sur le modèle Agence
  // réel. Résultat : la fiche affichait systématiquement les valeurs de
  // repli codées en dur ("2024", "12", "05"), jamais les vraies données,
  // pour absolument toutes les agences.
  const dateInscription = agence.createdAt
    ? new Date(agence.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
    : "—";

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">

        {/* EN-TÊTE */}
        <div className="relative h-24 bg-maliGreen shrink-0">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10 outline-none focus:ring-2 focus:ring-white/50"
          >
            <X size={20} />
          </button>

          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
              {agence.logo ? (
                <img src={agence.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={28} className="text-gray-300" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-6 pt-11 custom-scrollbar space-y-6">

          {/* NOM ET STATUT */}
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{agence.nom_agence}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                <MapPin size={14} /> {agence.adresse || "Adresse non renseignée"}
              </p>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${STATUT_STYLES[agence.statut]}`}>
              {STATUT_LABEL[agence.statut] || agence.statut}
            </span>
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ContactCard
              icon={Phone}
              label="Téléphone public"
              value={agence.telephonePublic || "Non renseigné"}
              href={agence.telephonePublic ? `tel:${agence.telephonePublic}` : null}
            />
            <ContactCard
              icon={Mail}
              label="Email public"
              value={agence.emailPublic || "Non renseigné"}
              href={agence.emailPublic ? `mailto:${agence.emailPublic}` : null}
            />
          </div>

          {/* RESPONSABLE & DATE D'INSCRIPTION — champs réels uniquement */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox icon={ShieldCheck} label="Responsable" value={agence.nom_proprietaire || "—"} />
            <InfoBox icon={Calendar} label="Membre depuis" value={dateInscription} />
          </div>

          {/* DESCRIPTION */}
          {agence.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">À propos</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {agence.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-orange-300 transition-colors">
      <div className="bg-gray-50 p-2 rounded-lg shrink-0">
        <Icon size={16} className="text-gray-500" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{content}</a> : content;
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
      <Icon size={16} className="text-orange-600 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
