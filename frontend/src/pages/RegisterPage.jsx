import { useState } from "react";
import { useNavigate,Link } from "react-router-dom"; // Ajout de l'import pour la redirection
// import {Link} from "react-routerd-dom"
import API from "../api/API";

export default function RegisterPage() {
  const navigate = useNavigate(); // Initialisation du hook de navigation
  const [step, setStep] = useState(1); 
  const [nom_agence, setNomAgence] = useState("");
  const [nom_proprietaire, setNomProprietaire] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    // On ne cache le toast manuellement que s'il n'y a pas de redirection
    if (type === "error") {
      setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    }
  };

  const inputBase = "w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange transition-all duration-200 text-sm";

  const canGoNext = () => {
    const e = {};
    if (!nom_agence.trim()) e.nom_agence = "Requis";
    if (!telephone.trim()) e.telephone = "Requis";
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const err = {};
    if (password.length < 8) err.password = "8 caractères min.";
    if (confirm !== password) err.confirm = "Les mots de passe diffèrent";
    if (!acceptedTerms) err.terms = "Veuillez accepter les conditions";
    if (!nomUtilisateur.trim()) err.username = "Requis";
    
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    const agenceData = {
      nom_agence: nom_agence.trim(),
      nom_proprietaire: nom_proprietaire.trim(),
      numero_telephone: telephone.trim(),
      email: email.trim(),
      nomUtilisateur: nomUtilisateur.trim(),
      password: password,
    };

    try {
      const result = await API.register(agenceData);
      if (result.success) {
        showToast("Compte créé ! Redirection vers la connexion...", "success");
        
        // Redirection après 2 secondes pour laisser le temps de lire le toast
        setTimeout(() => {
          navigate("/login");
        }, 1000);

      } else {
        showToast(result.error || "Erreur lors de l'enregistrement", "error");
        setErrors({ submit: result.error });
        setLoading(false); // On arrête le loading seulement en cas d'erreur
      }
    } catch (error) {
      showToast("Erreur de connexion au serveur", "error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:items-center sm:justify-center bg-gradient-to-br from-maliGreen via-maliSand to-maliOrange sm:px-4 sm:py-6 relative min-h-screen">
      
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-2xl text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <span className="mr-3 font-bold">{toast.type === "success" ? "✓" : "✕"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full sm:h-auto">
        
        <div className="hidden lg:flex flex-col justify-center gap-4 px-8 py-8 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Rejoins <span className="text-maliOrange">MaliImmo</span>
            </h1>
            <p className="mt-1 text-sm text-white/90 max-w-md">
              Crée un compte pour publier des annonces et suivre des biens.
            </p>
          </div>
          <ul className="mt-2 space-y-2 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white text-xs">✓</span>
              <span className="font-medium">Simple & sécurisé</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white text-xs">🔒</span>
              <span className="font-medium">Protection des données</span>
            </li>
          </ul>
          <div className="mt-4">
            <img src="/images/image1.jpg" alt="illustration" className="w-full rounded-lg object-cover h-32 shadow-inner" />
          </div>
        </div>

        <div className="bg-white sm:rounded-2xl shadow-2xl p-6 flex flex-col min-h-screen sm:min-h-0">
          
          <div className="lg:hidden flex gap-2 mb-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-maliGreen' : 'bg-gray-100'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-maliGreen' : 'bg-gray-100'}`} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-0.5">
            {step === 1 ? "Créer un compte" : "Sécuriser le compte"}
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            {step === 1 ? "Informations de l'agence et contact." : "Identifiants de connexion."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
            
            <div className={`${step === 1 ? 'block' : 'hidden'} lg:block space-y-3`}>
              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Nom de l'agence <span className="text-red-500">*</span></span>
                <input className={`${inputBase} mt-1`} value={nom_agence} onChange={(e) => setNomAgence(e.target.value)} placeholder="Ex: Mali-Immo" />
                {errors.nom_agence && <p className="text-[10px] text-red-600 mt-0.5">{errors.nom_agence}</p>}
              </label>

              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Nom complet du chef</span>
                <input className={`${inputBase} mt-1`} value={nom_proprietaire} onChange={(e) => setNomProprietaire(e.target.value)} placeholder="Ex: Abdoul W." />
              </label>

              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Téléphone <span className="text-red-500">*</span></span>
                <div className="relative mt-1 flex items-center group">
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 border-r border-gray-300 bg-gray-50/50 text-gray-600 font-bold rounded-l-xl">
                    <span className="text-[10px]">+223</span>
                  </div>
                  <input type="tel" className={`${inputBase} pl-14`} value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="77 00 00 00" />
                </div>
                {errors.telephone && <p className="text-[10px] text-red-600 mt-0.5">{errors.telephone}</p>}
              </label>
              
              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Email</span>
                <input type="email" className={`${inputBase} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: abdoul@example.com" />
              </label>

              <button type="button" onClick={canGoNext} className="lg:hidden w-full py-3 bg-maliGreen text-white font-bold rounded-xl mt-4">
                Suivant
              </button>
            </div>

            <div className={`${step === 2 ? 'block' : 'hidden'} lg:block space-y-3 animate-in slide-in-from-right-4 duration-300`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-gray-700 font-medium">Nom d'utilisateur <span className="text-red-500">*</span></span>
                  <input className={`${inputBase} mt-1`} value={nomUtilisateur} onChange={(e) => setNomUtilisateur(e.target.value)} placeholder="abdoul24" />
                  {errors.username && <p className="text-[10px] text-red-600 mt-0.5">{errors.username}</p>}
                </label>
                
                <label className="block text-sm relative">
                  <span className="text-gray-700 font-medium">Mot de passe <span className="text-red-500">*</span></span>
                  <div className="mt-1 relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputBase} pr-12`} placeholder="8+ car." />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-maliGreen uppercase">
                      {showPassword ? "Cacher" : "Voir"}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}
                </label>

                <label className="block text-sm">
                  <span className="text-gray-700 font-medium">Confirmation <span className="text-red-500">*</span></span>
                  <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputBase} mt-1`} placeholder="Répéter" />
                  {errors.confirm && <p className="text-[10px] text-red-600 mt-0.5">{errors.confirm}</p>}
                </label>
              </div>
              
              <label className="flex items-start gap-3 text-sm pt-1">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-maliOrange" />
                <span className="text-gray-600 text-[11px] leading-tight">J'accepte les <a href="#" className="text-maliGreen font-medium underline">conditions d'utilisation</a> <span className="text-red-500">*</span></span>
              </label>
              {errors.terms && <p className="text-[10px] text-red-600">{errors.terms}</p>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="lg:hidden flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-sm">
                  Retour
                </button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-maliOrange text-white font-bold rounded-xl shadow-lg hover:bg-maliOcre transition active:scale-95 text-sm disabled:opacity-70">
                  {loading ? "Traitement..." : "Créer le compte"}
                </button>
              </div>
              <p className="mt-auto pt-6 text-center text-sm text-gray-600">
                Déjà inscrit ? <Link to="/login" className="text-maliGreen font-bold hover:underline">Se connecter</Link>
              </p>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}