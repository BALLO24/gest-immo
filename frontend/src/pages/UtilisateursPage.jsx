import { useEffect, useState } from "react";
import { Users, Shield, Building2, Loader2, ChevronDown, Search } from "lucide-react";
import API from "../api/API";
import toast from "react-hot-toast";

// AJOUT : page entièrement nouvelle. La sidebar promettait un lien
// "Utilisateurs" vers une route qui n'a jamais existé (404 garantie). Vue en
// lecture sur tous les comptes de connexion (admins + agences), avec un
// contrôle de statut par COMPTE — distinct du statut de l'AGENCE (une agence
// peut être active alors qu'on veut suspendre un seul compte compromis, sans
// couper toute l'agence).
const STATUT_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "suspendue", label: "Suspendu" },
];

const STATUT_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-amber-50 text-amber-700 border-amber-200",
  suspendue: "bg-red-50 text-red-700 border-red-200",
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFiltre, setRoleFiltre] = useState("tous");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await API.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatutChange = async (userId, statut) => {
    setUpdatingId(userId);
    const result = await API.updateUserStatut(userId, statut);
    setUpdatingId(null);
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, statut } : u)));
      toast.success("Statut mis à jour.");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour.");
    }
  };

  const usersFiltres = users.filter((u) => {
    const matchRole = roleFiltre === "tous" || u.role === roleFiltre;
    const q = search.toLowerCase();
    const matchSearch =
      u.nom?.toLowerCase().includes(q) ||
      u.numero_telephone?.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.agence?.nom_agence?.toLowerCase().includes(q);
    return matchRole && (!q || matchSearch);
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <Users size={20} className="text-orange-600" /> Utilisateurs
      </h1>
      <p className="text-slate-400 text-sm mb-6">Tous les comptes de connexion — administrateurs et agences.</p>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Nom, téléphone, email, agence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 rounded-lg pl-10 pr-4 py-2 text-sm outline-none border border-transparent focus:border-orange-300 focus:ring-1 focus:ring-orange-300"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "tous", label: "Tous", icon: Users },
            { value: "admin", label: "Admins", icon: Shield },
            { value: "agence", label: "Agences", icon: Building2 },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFiltre(f.value)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                roleFiltre === f.value ? "bg-orange-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-orange-600" size={28} />
        </div>
      ) : usersFiltres.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Aucun utilisateur ne correspond.</div>
      ) : (
        <>
          {/* AJOUT : cartes empilées sur mobile, plus lisible qu'un tableau
              à faire défiler horizontalement sur un petit écran. */}
          <div className="md:hidden space-y-2">
            {usersFiltres.map((u) => (
              <div key={u._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.nom}</p>
                    <p className="text-xs text-slate-400">{u.numero_telephone}</p>
                    {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {u.role === "admin" ? <Shield size={11} /> : <Building2 size={11} />}
                    {u.role === "admin" ? "Admin" : "Agence"}
                  </span>
                </div>
                {u.agence && (
                  <p className="text-xs text-slate-400 mb-2">
                    {u.agence.nom_agence}
                    {u.agence.statut !== "active" && <span className="ml-1 text-amber-600">({u.agence.statut})</span>}
                  </p>
                )}
                <div className="relative inline-block pt-2 border-t border-slate-50 w-full">
                  <select
                    value={u.statut}
                    disabled={updatingId === u._id}
                    onChange={(e) => handleStatutChange(u._id, e.target.value)}
                    className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer outline-none mt-1 ${STATUT_STYLES[u.statut]}`}
                  >
                    {STATUT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 translate-y-[2px] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

        <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-400 uppercase text-xs tracking-wide">
                <th className="px-5 py-3 font-semibold">Nom</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Rôle</th>
                <th className="px-5 py-3 font-semibold">Agence</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usersFiltres.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-800">{u.nom}</td>
                  <td className="px-5 py-3 text-slate-500">
                    <div>{u.numero_telephone}</div>
                    {u.email && <div className="text-xs text-slate-400">{u.email}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.role === "admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {u.role === "admin" ? <Shield size={12} /> : <Building2 size={12} />}
                      {u.role === "admin" ? "Admin" : "Agence"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {u.agence ? (
                      <span>
                        {u.agence.nom_agence}
                        {u.agence.statut !== "active" && (
                          <span className="ml-1.5 text-xs text-amber-600">({u.agence.statut})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="relative inline-block">
                      <select
                        value={u.statut}
                        disabled={updatingId === u._id}
                        onChange={(e) => handleStatutChange(u._id, e.target.value)}
                        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer outline-none ${STATUT_STYLES[u.statut]}`}
                      >
                        {STATUT_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Le statut ici agit sur le <strong>compte de connexion</strong> uniquement. Pour désactiver le profil public d'une agence entière, utilisez la page Agences.
      </p>
    </div>
  );
}
