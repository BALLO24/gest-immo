import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Home, AlertCircle, CheckCircle2, Clock, Trash2,
  Eye, TrendingUp, Users, Loader2, ArrowRight,
} from "lucide-react";
import API from "../api/API";

// AJOUT : cette page était un placeholder de 7 lignes ("Welcome to the Home
// Dashboard"), sans la moindre donnée réelle. Branchée sur le nouvel
// endpoint /api/stats, qui exploite des champs qu'on a construits tout au
// long du projet (statut d'agence, statut/type de bien, vues) sans jamais
// les faire remonter nulle part côté admin.

const TYPE_LABELS = { maison: "Maisons", appartement: "Appartements", magasin: "Magasins", terrain: "Terrains" };

export default function HomeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-600" size={32} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
        <AlertCircle className="text-gray-300" size={40} />
        <p className="text-gray-500">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const agencesEnAttente = stats.agences.parStatut.inactive || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Tableau de bord <span className="text-orange-600">Admin</span>
      </h1>
      <p className="text-slate-500 mb-10">Vue d'ensemble de la plateforme.</p>

      {/* AJOUT : bandeau d'alerte visible en priorité s'il y a des agences en
          attente de validation — avant, rien ne signalait ça nulle part,
          il fallait aller fouiller dans la liste des agences pour s'en apercevoir. */}
      {agencesEnAttente > 0 && (
        <Link
          to="/dashboard/agences?statut=inactive"
          className="flex items-center justify-between gap-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-6 py-4 mb-8 hover:bg-orange-100 transition-colors"
        >
          <span className="flex items-center gap-3 font-semibold">
            <Clock size={20} />
            {agencesEnAttente} agence{agencesEnAttente > 1 ? "s" : ""} en attente de validation
          </span>
          <ArrowRight size={18} />
        </Link>
      )}

      {/* CARTES DE STATS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={Building2}
          label="Agences actives"
          value={stats.agences.parStatut.active || 0}
          sub={`${stats.agences.total} au total`}
          color="green"
        />
        <StatCard
          icon={Home}
          label="Biens disponibles"
          value={stats.proprietes.parStatut.disponible || 0}
          sub={`${stats.proprietes.total} au total`}
          color="orange"
        />
        <StatCard
          icon={Users}
          label="Comptes utilisateurs"
          value={stats.totalUsers}
          color="blue"
        />
        <StatCard
          icon={Trash2}
          label="Biens archivés"
          value={stats.proprietes.archivees}
          sub="À examiner dans Habitations"
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RÉPARTITION PAR TYPE */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Biens par type</h2>
          <div className="space-y-3">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = stats.proprietes.parType[key] || 0;
              const pct = stats.proprietes.total ? Math.round((count / stats.proprietes.total) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP BIENS LES PLUS VUS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Biens les plus consultés
          </h2>
          {stats.topVues.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune donnée pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {stats.topVues.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">
                      {TYPE_LABELS[item.__t] || item.__t} · {item.quartier?.nom}, {item.quartier?.ville?.nom}
                    </p>
                    <p className="text-slate-400">{item.prix?.toLocaleString()} FCFA</p>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-orange-600 shrink-0 ml-3">
                    <Eye size={14} /> {item.vues}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RACCOURCIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link to="/dashboard/agences" className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-5 py-4 hover:border-orange-300 transition-colors text-slate-700 font-semibold">
          <Building2 size={18} className="text-orange-500" /> Gérer les agences
        </Link>
        <Link to="/dashboard/habitations" className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-5 py-4 hover:border-orange-300 transition-colors text-slate-700 font-semibold">
          <Home size={18} className="text-orange-500" /> Gérer les biens
        </Link>
        <Link to="/dashboard/utilisateurs" className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-5 py-4 hover:border-orange-300 transition-colors text-slate-700 font-semibold">
          <Users size={18} className="text-orange-500" /> Gérer les comptes
        </Link>
      </div>
    </div>
  );
}

const COLOR_MAP = {
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  blue: "bg-blue-50 text-blue-600",
  gray: "bg-slate-100 text-slate-500",
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${COLOR_MAP[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
