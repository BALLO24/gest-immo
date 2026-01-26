import { useState } from "react";

/**
 * RegistrationPage.jsx
 * Page d'inscription stylée et responsive.
 *
 * Remplace la simulation setTimeout par un appel réel à ton API (fetch / axios).
 */

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState(""); // email ou téléphone
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputBase =
    "w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange";

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v) => /^[+\d]?(?:[\d\s-().]){7,}$/.test(v);

  const passwordStrength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s; // 0..4
  };

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = "Le nom complet est requis.";
    if (!identifier.trim()) e.identifier = "Email ou téléphone requis.";
    else if (!isValidEmail(identifier) && !isValidPhone(identifier))
      e.identifier = "Entrez un email ou un numéro de téléphone valide.";

    if (!password) e.password = "Mot de passe requis.";
    else if (password.length < 8) e.password = "Le mot de passe doit contenir au moins 8 caractères.";

    if (confirm !== password) e.confirm = "Les mots de passe ne correspondent pas.";

    if (!acceptedTerms) e.terms = "Vous devez accepter les conditions d'utilisation.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);
    if (!validate()) return;

    setLoading(true);
    // TODO: Remplace cette simulation par fetch/axios vers ton API:
    // fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ fullName, identifier, password }) })
    setTimeout(() => {
      setLoading(false);
      // simulation réussite
      setNotice({ type: "success", text: "Inscription réussie — vérifie ton email ou connecte-toi." });
      // reset (optionnel)
      // setFullName(""); setIdentifier(""); setPassword(""); setConfirm(""); setAcceptedTerms(false);
    }, 900);
  }

  function handleSocial(provider) {
    alert(`Inscription via ${provider} (à implémenter : OAuth)`);
  }

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maliGreen via-maliSand to-maliOrange px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - branding */}
        <div className="hidden lg:flex flex-col justify-center gap-6 px-8 py-10 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Rejoins <span className="text-maliOrange">MaliImmo</span>
            </h1>
            <p className="mt-2 text-white/90 max-w-md">
              Crée un compte pour publier des annonces, suivre des biens et recevoir des alertes personnalisées.
            </p>
          </div>

          <ul className="mt-4 space-y-3 text-white/90">
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">✓</span>
              <span className="font-medium">Simple & sécurisé</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">🔒</span>
              <span className="font-medium">Protection des données</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">⚡</span>
              <span className="font-medium">Expérience rapide</span>
            </li>
          </ul>
          <div className="mt-6">
            <img
              src="/images/image1.jpg"
              alt="illustration"
              className="w-full rounded-lg object-cover h-40 shadow-inner"
              style={{ objectPosition: "center" }}
            />
          </div>
        </div>

        {/* Right - form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>
          <p className="text-sm text-gray-500 mb-6">Utilise ton email ou ton numéro, et choisis un mot de passe sécurisé.</p>

          {notice && (
            <div role="status" className={`mb-4 text-sm px-4 py-3 rounded-md ${notice.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label className="block mb-3 text-sm">
              <span className="text-gray-700 font-medium">Nom complet</span>
              <input className={`${inputBase} mt-2`} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Abdoul W." />
              {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
            </label>

            <label className="block mb-3 text-sm">
              <span className="text-gray-700 font-medium">Email ou téléphone</span>
              <input className={`${inputBase} mt-2`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="ex: abdoul@example.com ou +223 77 00 00 00" />
              {errors.identifier && <p className="text-sm text-red-600 mt-1">{errors.identifier}</p>}
            </label>

            <label className="block mb-3 text-sm relative">
              <span className="text-gray-700 font-medium">Mot de passe</span>
              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-12`}
                  placeholder="Au moins 8 caractères"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-2 py-1 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none">
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}

              {/* strength */}
              {password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`w-8 h-1 rounded-full ${passwordStrength(password) > i ? "bg-maliGreen" : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {["Très faible", "Faible", "Moyen", "Fort"][Math.max(0, Math.min(3, passwordStrength(password) - 1))] || "Très faible"}
                  </div>
                </div>
              )}
            </label>

            <label className="block mb-3 text-sm">
              <span className="text-gray-700 font-medium">Confirme le mot de passe</span>
              <input className={`${inputBase} mt-2`} value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Répète le mot de passe" />
              {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>}
            </label>

            <label className="flex items-center gap-3 text-sm mb-4">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-maliOrange focus:ring-maliOrange" />
              <span className="text-gray-600">J'accepte les <a href="#" className="text-maliGreen underline">conditions d'utilisation</a></span>
              {errors.terms && <p className="text-sm text-red-600 mt-2">{errors.terms}</p>}
            </label>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-maliOrange text-white font-semibold shadow hover:bg-maliOcre transition">
              {loading ? "Création en cours..." : "Créer un compte"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <hr className="flex-1 border-gray-200" />
            <span className="text-sm text-gray-500">ou</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSocial("Google")} className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="#EA4335" d="M12 11.5v3.9h5.3c-.3 1.6-1.9 4.6-5.3 4.6-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.5C17.2 4 14.8 3 12 3 6.5 3 2 7.5 2 13s4.5 10 10 10c5 0 9-3.6 9.9-8.3.1-.7.1-1.3.1-1.7H12z" /></svg>
              Google
            </button>
            <button onClick={() => handleSocial("Facebook")} className="flex items-center justify-center gap-2 py-2 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 hover:shadow-sm transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="#1877F2" d="M22 12.07C22 6.48 17.52 2 11.93 2 6.33 2 2 6.48 2 12.07 2 17.1 5.66 21.25 10.44 22v-7.02H7.9v-2.9h2.54V9.3c0-2.5 1.5-3.87 3.76-3.87 1.09 0 2.22.2 2.22.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54v1.86h2.74l-.44 2.9h-2.3V22C18.34 21.25 22 17.1 22 12.07z" /></svg>
              Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà inscrit ? <a href="/login" className="text-maliGreen font-medium hover:underline">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}
