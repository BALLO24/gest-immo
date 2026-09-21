import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, User, Phone, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Check, Info } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/API";

const INDICATIF = "+223";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nom_agence, setNomAgence] = useState("");
  const [nom_proprietaire, setNomProprietaire] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const inputBase = "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange/40 focus:border-maliOrange transition-colors";

  const chiffresTelephone = telephone.replace(/\D/g, "");

  const canGoNext = () => {
    const e = {};
    if (!nom_agence.trim()) e.nom_agence = "Requis";
    if (!nom_proprietaire.trim()) e.nom_proprietaire = "Requis";
    if (!chiffresTelephone) e.telephone = "Requis";
    else if (chiffresTelephone.length < 8) e.telephone = "Numéro trop court (8 chiffres min.)";
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const err = {};
    if (!nom_agence.trim()) err.nom_agence = "Requis";
    if (!nom_proprietaire.trim()) err.nom_proprietaire = "Requis";
    if (!chiffresTelephone) err.telephone = "Requis";
    else if (chiffresTelephone.length < 8) err.telephone = "Numéro trop court (8 chiffres min.)";
    if (password.length < 8) err.password = "8 caractères min.";
    if (confirm !== password) err.confirm = "Les mots de passe diffèrent";
    if (!acceptedTerms) err.terms = "Veuillez accepter les conditions";

    setErrors(err);
    if (Object.keys(err).length > 0) {
      if (err.nom_agence || err.nom_proprietaire || err.telephone) setStep(1);
      return;
    }

    setLoading(true);
    const agenceData = {
      nom_agence: nom_agence.trim(),
      nom_proprietaire: nom_proprietaire.trim(),
      numero_telephone: `${INDICATIF}${chiffresTelephone}`,
      ...(email.trim() && { email: email.trim() }),
      password: password,
    };

    try {
      const result = await API.register(agenceData);
      if (result.success) {
        toast.success("Demande envoyée ! Votre agence sera activée après validation par un administrateur.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maliSand/40 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="" className="w-12 h-12 object-contain mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Créer un compte" : "Sécuriser le compte"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {step === 1 ? "Informations de l'agence et contact." : "Choisissez vos identifiants de connexion."}
          </p>
        </div>

        {/* AJOUT : indicateur d'étape numéroté, visible sur toutes les
            tailles d'écran maintenant qu'il n'y a plus de colonne large
            pour tout afficher en une fois — le flux en 2 temps est
            désormais cohérent partout, plus seulement sur mobile. */}
        <div className="flex items-center gap-2 mb-6">
          <StepDot number={1} active={step === 1} done={step > 1} label="Agence" />
          <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > 1 ? "bg-maliGreen" : "bg-gray-100"}`} />
          <StepDot number={2} active={step === 2} done={false} label="Sécurité" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Nom de l'agence</label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input className={inputBase} value={nom_agence} onChange={(e) => setNomAgence(e.target.value)} placeholder="Ex: Mali Immo Prestige" />
                </div>
                {errors.nom_agence && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.nom_agence}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Nom complet du responsable</label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input className={inputBase} value={nom_proprietaire} onChange={(e) => setNomProprietaire(e.target.value)} placeholder="Ex: Abdoul Wahab" />
                </div>
                {errors.nom_proprietaire && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.nom_proprietaire}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Téléphone</label>
                <div className="relative mt-1.5 flex items-center">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 z-10" size={18} aria-hidden="true" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pr-2 border-r border-gray-200">{INDICATIF}</span>
                  <input
                    type="tel"
                    className={`${inputBase} pl-[4.75rem]`}
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="77 00 00 00"
                  />
                </div>
                {errors.telephone && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.telephone}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">
                  Email <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input type="email" className={inputBase} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@monagence.com" />
                </div>
              </div>

              <button
                type="button"
                onClick={canGoNext}
                className="w-full py-3.5 bg-maliGreen hover:bg-maliGreen/90 text-white font-semibold rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors"
              >
                Continuer <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Mot de passe</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pr-11`}
                    placeholder="8 caractères min."
                    autoComplete="new-password"
                    minLength={8}
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

              <div>
                <label className="text-sm font-semibold text-gray-700 ml-0.5">Confirmation</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputBase}
                    placeholder="Répéter"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirm && <p className="text-xs text-red-600 mt-1 ml-0.5">{errors.confirm}</p>}
              </div>

              <label className="flex items-start gap-2.5 text-sm pt-1 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-maliOrange focus:ring-maliOrange/40" />
                <span className="text-gray-600 text-xs leading-relaxed">
                  J'accepte les <a href="#" className="text-maliGreen font-semibold hover:underline">conditions d'utilisation</a>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-600 ml-0.5">{errors.terms}</p>}

              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3">
                <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
                Votre agence sera activée par un administrateur après vérification, avant de pouvoir vous connecter.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 px-5 py-3.5 border border-gray-200 text-gray-500 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} /> Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-xl shadow-sm transition-colors active:scale-[0.99] text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Traitement...</> : "Créer le compte"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Déjà inscrit ? <Link to="/login" className="text-maliGreen font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

function StepDot({ number, active, done, label }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        done ? "bg-maliGreen text-white" : active ? "bg-maliOrange text-white" : "bg-gray-100 text-gray-400"
      }`}>
        {done ? <Check size={14} /> : number}
      </div>
      <span className={`text-xs font-semibold ${active || done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}
