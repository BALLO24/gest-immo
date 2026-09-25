import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Phone, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/API";

const INDICATIF = "+223";

export default function LoginPage() {
  const navigate = useNavigate();
  // AJOUT : bascule téléphone/email — avant, un seul champ texte essayait
  // d'accepter les deux, ce qui empêchait tout habillage visuel clair
  // (un préfixe +223 fixe aurait cassé la saisie d'un email). Deux champs
  // distincts maintenant, un seul affiché à la fois.
  const [mode, setMode] = useState("telephone");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("rememberedMode");
    const savedValue = localStorage.getItem("rememberedUser");
    if (savedValue) {
      if (savedMode === "email") {
        setMode("email");
        setEmail(savedValue);
      } else {
        setMode("telephone");
        setTelephone(savedValue);
      }
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        navigate(decoded.role === "admin" ? "/dashboard" : "/agence");
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (e) {
      localStorage.removeItem("authToken");
    }
  }, [navigate]);

  const chiffresTelephone = telephone.replace(/\D/g, "");

  function validate() {
    const e = {};
    if (mode === "telephone" && !chiffresTelephone) e.identifiant = "Numéro de téléphone requis.";
    if (mode === "email" && !email.trim()) e.identifiant = "Email requis.";
    if (!password) e.password = "Mot de passe requis.";
    else if (password.length < 6) e.password = "6 caractères min.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const nomUtilisateur = mode === "telephone" ? `${INDICATIF}${chiffresTelephone}` : email.trim();
    const valeurAMemoriser = mode === "telephone" ? chiffresTelephone : email.trim();

    try {
      const response = await API.login({ nomUtilisateur, password });

      if (response.success) {
        const { token } = response.data;

        if (remember) {
          localStorage.setItem("rememberedUser", valeurAMemoriser);
          localStorage.setItem("rememberedMode", mode);
        } else {
          localStorage.removeItem("rememberedUser");
          localStorage.removeItem("rememberedMode");
        }

        localStorage.setItem("authToken", token);
        toast.success("Connexion réussie !");

        const decoded = jwtDecode(token);
        setTimeout(() => {
          navigate(decoded.role === "admin" ? "/dashboard" : "/agence");
        }, 600);
      } else {
        setLoading(false);
        toast.error(response.error || "Identifiants incorrects.");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Erreur de connexion au serveur.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maliSand/40 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <img src="/logo.png" alt="" className="w-12 h-12 object-contain mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">Se connecter</h2>
          <p className="text-sm text-gray-400 mt-1">Ravi de vous revoir !</p>
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
            {errors.identifiant && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.identifiant}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 ml-0.5">Mot de passe</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
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
            {errors.password && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-maliOrange focus:ring-maliOrange/40"
              />
              Se souvenir de moi
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-maliGreen hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-xl shadow-sm transition-colors active:scale-[0.99] text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Connexion en cours...</>
            ) : (
              <>Se connecter <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Nouveau ici ? <Link to="/register" className="text-maliGreen font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
