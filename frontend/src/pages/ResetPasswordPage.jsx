import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/API";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!nouveauMotDePasse) e.nouveauMotDePasse = "Nouveau mot de passe requis.";
    else if (nouveauMotDePasse.length < 8) e.nouveauMotDePasse = "8 caractères minimum.";
    if (confirmation !== nouveauMotDePasse) e.confirmation = "Les mots de passe ne correspondent pas.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const response = await API.resetPassword(token, nouveauMotDePasse);
    setLoading(false);

    if (response.success) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast.error(response.error || "Ce lien de réinitialisation est invalide ou a expiré.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maliSand/40 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {success ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-maliGreen/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-maliGreen" size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mot de passe réinitialisé</h2>
            <p className="text-sm text-gray-500 mt-2">Redirection vers la connexion...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-7">
              <img src="/logo.png" alt="" className="w-12 h-12 object-contain mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h2>
              <p className="text-sm text-gray-400 mt-1">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Nouveau mot de passe</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={nouveauMotDePasse}
                    onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.nouveauMotDePasse && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.nouveauMotDePasse}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Confirmer le mot de passe</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmation && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.confirmation}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-xl shadow-sm transition-colors active:scale-[0.99] text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Réinitialisation...</>
                ) : (
                  <>Réinitialiser <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              <Link to="/login" className="text-maliGreen font-semibold hover:underline">Retour à la connexion</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
