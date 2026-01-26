import { useEffect, useState } from "react";

/**
 * ChangePasswordPage.jsx
 * - Gère deux modes :
 *   1) resetToken present (reset via lien email) => demande seulement nouveau mot de passe + confirmation
 *   2) pas de token (user connecté) => demande ancien mot de passe + nouveau + confirmation
 *
 * - Validation client, indications de force, simulation d'API.
 * - Usage : <ChangePasswordPage /> ou <ChangePasswordPage resetToken="..." />
 */

export default function ChangePasswordPage({ resetToken: propToken }) {
  // detect token from prop or query param
  const [token, setToken] = useState(propToken || null);
  useEffect(() => {
    if (!propToken) {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      if (t) setToken(t);
    }
  }, [propToken]);

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const passStrength = (() => {
    if (!newPass) return 0;
    let s = 0;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    return s;
  })();

  function validate() {
    const e = {};
    // if no token, require current
    if (!token && !current) e.current = "Mot de passe actuel requis.";
    if (!newPass) e.newPass = "Nouveau mot de passe requis.";
    else if (newPass.length < 8) e.newPass = "Au moins 8 caractères.";
    if (newPass !== confirm) e.confirm = "Les mots de passe ne correspondent pas.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);
    if (!validate()) return;
    setLoading(true);

    // Simulated API behavior:
    setTimeout(() => {
      setLoading(false);
      // If not token and current is wrong (simulate), reject
      if (!token && current !== "current-password") {
        setNotice({ type: "error", text: "Mot de passe actuel incorrect." });
      } else {
        setNotice({ type: "success", text: "Mot de passe mis à jour avec succès." });
        setCurrent("");
        setNewPass("");
        setConfirm("");
        // If reset token flow, you may want to redirect to login
      }
    }, 900);
  }

  return (
    <div className="min-h-screen sm:flex py-6 items-center justify-center bg-gradient-to-br from-maliGreen via-maliSand to-maliOrange px-4 sm:py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Changer le mot de passe</h2>
        <p className="text-sm text-gray-500 mb-6">
          {token ? "Vous réinitialisez votre mot de passe via le lien reçu par email." : "Changez votre mot de passe actuel pour sécuriser votre compte."}
        </p>

        {notice && (
          <div role="status" className={`mb-4 text-sm px-4 py-3 rounded-md ${notice.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
            {notice.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!token && (
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Mot de passe actuel
              <input
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                type={show ? "text" : "password"}
                className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-200 bg-white/95 text-gray-900 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                placeholder="Votre mot de passe actuel"
                aria-invalid={errors.current ? "true" : "false"}
                aria-describedby={errors.current ? "err-current" : undefined}
              />
            </label>
          )}
          {errors.current && <p id="err-current" className="text-sm text-red-600 mb-3">{errors.current}</p>}

          <label className="block mb-3 text-sm font-medium text-gray-700">
            Nouveau mot de passe
            <div className="mt-2 relative">
              <input
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                type={show ? "text" : "password"}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/95 text-gray-900 focus:outline-none focus:ring-2 focus:ring-maliOrange pr-12"
                placeholder="Au moins 8 caractères, 1 majuscule, 1 chiffre"
                aria-invalid={errors.newPass ? "true" : "false"}
                aria-describedby={errors.newPass ? "err-new" : undefined}
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-2 py-1 rounded-md text-gray-600 hover:text-gray-800 focus:outline-none">
                {show ? "Masquer" : "Voir"}
              </button>
            </div>
          </label>
          {errors.newPass && <p id="err-new" className="text-sm text-red-600 mb-3">{errors.newPass}</p>}

          {/* Strength */}
          {newPass && (
            <div className="mb-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1 w-[140px]">
                  {[0,1,2,3].map((i) => (
                    <span key={i} className={`w-8 h-1 rounded-full ${passStrength > i ? "bg-maliGreen" : "bg-gray-200"}`} />
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {["Très faible","Faible","Moyen","Fort"][Math.max(0, Math.min(3, passStrength-1))] || "Très faible"}
                </div>
              </div>
            </div>
          )}

          <label className="block mb-4 text-sm font-medium text-gray-700">
            Confirmer le nouveau mot de passe
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={show ? "text" : "password"}
              className="w-full px-4 py-2 mt-2 rounded-lg border border-gray-200 bg-white/95 text-gray-900 focus:outline-none focus:ring-2 focus:ring-maliOrange"
              placeholder="Retapez le mot de passe"
              aria-invalid={errors.confirm ? "true" : "false"}
              aria-describedby={errors.confirm ? "err-confirm" : undefined}
            />
          </label>
          {errors.confirm && <p id="err-confirm" className="text-sm text-red-600 mb-3">{errors.confirm}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-maliOrange text-white font-semibold hover:bg-maliOcre transition">
            {loading ? "En cours..." : token ? "Réinitialiser le mot de passe" : "Changer le mot de passe"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          {token ? "Après la réinitialisation, vous pourrez vous connecter avec votre nouveau mot de passe." : "Pensez à choisir un mot de passe unique et sécurisé."}
        </p>
      </div>
    </div>
  );
}
