import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Loader2, ArrowRight, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/API";

const INDICATIF = "+223";

export default function ForgotPasswordPage() {
  // AJOUT : même bascule que sur la page de connexion, pour les mêmes
  // raisons — un préfixe +223 visuel fixe ne peut pas cohabiter avec la
  // saisie d'un email dans le même champ.
  const [mode, setMode] = useState("telephone");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const chiffresTelephone = telephone.replace(/\D/g, "");
  const identifiantEnvoye = mode === "telephone" ? `${INDICATIF}${chiffresTelephone}` : email.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "telephone" && !chiffresTelephone) {
      setError("Numéro de téléphone requis.");
      return;
    }
    if (mode === "email" && !email.trim()) {
      setError("Email requis.");
      return;
    }
    setError("");
    setLoading(true);

    const response = await API.forgotPassword(identifiantEnvoye);
    setLoading(false);

    if (response.success) {
      setSent(true);
    } else {
      toast.error(response.error || "Une erreur est survenue.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maliSand/40 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-maliGreen/10 flex items-center justify-center mb-4">
              <MailCheck className="text-maliGreen" size={28} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Vérifiez vos emails</h2>
            <p className="text-sm text-gray-500 mt-2">
              Si un compte associé à <strong>{identifiantEnvoye}</strong> existe et possède un email, un lien de
              réinitialisation valable 1 heure vient de lui être envoyé.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Pas d'email renseigné sur votre compte ? Contactez l'administrateur pour réinitialiser votre mot de passe.
            </p>
            <Link to="/login" className="mt-6 text-sm font-semibold text-maliGreen hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-7">
              <img src="/logo.png" alt="" className="w-12 h-12 object-contain mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
              <p className="text-sm text-gray-400 mt-1">
                Indiquez votre numéro de téléphone ou votre email, nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">
                    {mode === "telephone" ? "Numéro de téléphone" : "Email"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode(mode === "telephone" ? "email" : "telephone")}
                    className="text-xs font-semibold text-maliGreen hover:underline"
                  >
                    {mode === "telephone" ? "Utiliser un email" : "Utiliser un numéro"}
                  </button>
                </div>

                {mode === "telephone" ? (
                  <div className="relative mt-1.5 flex items-center">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 z-10" size={18} aria-hidden="true" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pr-2 border-r border-gray-200">{INDICATIF}</span>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-[4.75rem] pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors"
                      placeholder="77 00 00 00"
                      autoComplete="username"
                    />
                  </div>
                ) : (
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors"
                      placeholder="contact@monagence.com"
                      autoComplete="username"
                    />
                  </div>
                )}
                {error && <p className="text-xs text-red-600 mt-1 ml-0.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-xl shadow-sm transition-colors active:scale-[0.99] text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Envoi en cours...</>
                ) : (
                  <>Envoyer le lien <ArrowRight size={16} /></>
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
