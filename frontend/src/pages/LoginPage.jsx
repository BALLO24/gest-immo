import { useState } from "react";

/**
 * LoginPage.jsx
 * Page de connexion stylée, responsive et accessible.
 *
 * Remarques :
 * - Utilise Tailwind CSS et les couleurs personnalisées `maliOrange`, `maliGreen`, `maliSand`.
 *   Si ces classes n'existent pas, remplace par ex. `bg-orange-500 text-green-600` ou configure tailwind.config.js.
 */

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email ou téléphone
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const inputBase =
    "w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange";

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v) => /^[+\d]?(?:[\d\s-().]){7,}$/.test(v);

  function validate() {
    const e = {};
    if (!identifier.trim()) {
      e.identifier = "Email ou numéro de téléphone requis.";
    } else if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      e.identifier = "Entrez un email ou un numéro de téléphone valide.";
    }

    if (!password) {
      e.password = "Mot de passe requis.";
    } else if (password.length < 6) {
      e.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);

    if (!validate()) return;

    setLoading(true);
    // Simulation de requête (remplace par appel API réel)
    setTimeout(() => {
      setLoading(false);
      // Pour l'exemple on accepte si password === "password123"
      if (password === "password123") {
        setNotice({ type: "success", text: "Connexion réussie — redirection..." });
        // ici tu pourrais rediriger: navigate('/dashboard')
      } else {
        setNotice({ type: "error", text: "Identifiants incorrects — réessaye." });
      }
    }, 800);
  }

  function handleSocial(provider) {
    // Simulé — remplace par flux OAuth réel
    alert(`Connexion via ${provider} (à implémenter)`);
  }

  // Password strength simplifiée
  const passStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  })();

  return (
    <div className="min-h-screen sm:flex items-center justify-center bg-gradient-to-br from-maliGreen via-maliSand to-maliOrange px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left / Branding */}
        <div className="hidden lg:flex flex-col justify-center gap-2 px-8 sm:py-10 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Bienvenue sur <span className="text-maliOrange">MaliImmo</span>
            </h1>
            <p className="mt-2 text-white/90 max-w-md">
              Connecte-toi pour gérer tes annonces, sauvegarder des recherches et contacter directement les propriétaires.
            </p>
          </div>

          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 text-white/90">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">
                ✓
              </span>
              <span className="font-medium">Tableau de bord simple & rapide</span>
            </li>
            <li className="flex items-center gap-3 text-white/90">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">
                🗂
              </span>
              <span className="font-medium">Gestion des annonces</span>
            </li>
            <li className="flex items-center gap-3 text-white/90">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white">
                🔔
              </span>
              <span className="font-medium">Alertes & favoris</span>
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

        {/* Right / Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Se connecter</h2>
          <p className="text-sm text-gray-500 mb-6">
            Utilise ton email ou ton numéro de téléphone pour te connecter.
          </p>

          {/* Notice */}
          {notice && (
            <div
              role="status"
              className={`mb-4 text-sm px-4 py-3 rounded-md ${
                notice.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Identifier */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email ou téléphone
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`${inputBase} mt-2`}
                placeholder="ex: abdoul@example.com ou +223 77 00 00 00"
                aria-invalid={errors.identifier ? "true" : "false"}
                aria-describedby={errors.identifier ? "err-identifier" : undefined}
              />
            </label>
            {errors.identifier && (
              <p id="err-identifier" className="text-sm text-red-600 mb-3">
                {errors.identifier}
              </p>
            )}

            {/* Password */}
            <label className="block mb-2 text-sm font-medium text-gray-700 relative">
              Mot de passe
              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-12`}
                  placeholder="••••••••"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "err-password" : undefined}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-2 py-1 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    // eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.11-5.88M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    // eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            {errors.password && (
              <p id="err-password" className="text-sm text-red-600 mb-3">
                {errors.password}
              </p>
            )}

            {/* Password strength */}
            {password && (
              <div className="mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`w-8 h-1 rounded-full transition ${
                          passStrength > i ? "bg-maliGreen" : "bg-gray-200"
                        }`}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {["Très faible", "Faible", "Moyen", "Fort"][Math.max(0, Math.min(3, passStrength - 1))] || "Très faible"}
                  </div>
                </div>
              </div>
            )}

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-maliOrange focus:ring-maliOrange"
                />
                <span>Se souvenir de moi</span>
              </label>

              <a href="#" className="text-sm text-maliGreen hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-maliOrange text-white font-semibold shadow hover:bg-maliOcre transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* OR */}
          <div className="flex items-center gap-3 my-6">
            <hr className="flex-1 border-gray-200" />
            <span className="text-sm text-gray-500">ou</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocial("Google")}
              className="flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition"
              aria-label="Se connecter avec Google"
            >
              {/* simple Google icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 11.5v3.9h5.3c-.3 1.6-1.9 4.6-5.3 4.6-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.5C17.2 4 14.8 3 12 3 6.5 3 2 7.5 2 13s4.5 10 10 10c5 0 9-3.6 9.9-8.3.1-.7.1-1.3.1-1.7H12z" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>

            <button
              onClick={() => handleSocial("Facebook")}
              className="flex items-center justify-center gap-2 py-2 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 hover:shadow-sm transition"
              aria-label="Se connecter avec Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#1877F2" d="M22 12.07C22 6.48 17.52 2 11.93 2 6.33 2 2 6.48 2 12.07 2 17.1 5.66 21.25 10.44 22v-7.02H7.9v-2.9h2.54V9.3c0-2.5 1.5-3.87 3.76-3.87 1.09 0 2.22.2 2.22.2v2.45h-1.25c-1.23 0-1.61.76-1.61 1.54v1.86h2.74l-.44 2.9h-2.3V22C18.34 21.25 22 17.1 22 12.07z" />
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          {/* Signup link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a href="#" className="text-maliGreen font-medium hover:underline">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
